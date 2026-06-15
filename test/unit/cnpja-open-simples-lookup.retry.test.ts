import { describe, expect, it } from "vitest";

import type {
  HttpClient,
  HttpResponse,
} from "../../src/core/infra/http-client";
import { AbortError } from "../../src/core/infra/rate-limiter";
import { CnpjaOpenSimplesLookupAdapter } from "../../src/core/simples/adapters/cnpja-open-simples-lookup.adapter";

class FakeRateLimiter {
  async waitTurn(): Promise<void> {}
}

class SequentialHttpClient implements HttpClient {
  private index = 0;

  constructor(private readonly responses: Array<HttpResponse>) {}

  async get(): Promise<HttpResponse> {
    const response = this.responses[this.index];
    this.index += 1;

    if (!response) {
      throw new Error("No more responses configured");
    }

    return response;
  }
}

class RecordingHttpClient implements HttpClient {
  lastOptions: RequestInit | undefined;

  async get(_url: string, options?: RequestInit): Promise<HttpResponse> {
    this.lastOptions = options;

    return {
      status: 200,
      json: async () => ({
        taxId: "03426484000123",
        company: {
          simples: { optant: false, since: null },
          simei: { optant: false, since: null },
        },
      }),
    };
  }
}

class AbortAwareHttpClient implements HttpClient {
  private notifyStarted?: () => void;

  readonly started = new Promise<void>((resolve) => {
    this.notifyStarted = resolve;
  });

  async get(_url: string, options?: RequestInit): Promise<HttpResponse> {
    this.notifyStarted?.();
    const signal = options?.signal;

    if (!signal) {
      throw new Error("Missing signal");
    }

    return await new Promise<HttpResponse>((_resolve, reject) => {
      signal.addEventListener(
        "abort",
        () => {
          reject(new DOMException("Aborted", "AbortError"));
        },
        { once: true },
      );
    });
  }
}

describe("CnpjaOpenSimplesLookupAdapter retry", () => {
  it("retries once after a temporary provider error", async () => {
    const adapter = new CnpjaOpenSimplesLookupAdapter(
      new SequentialHttpClient([
        {
          status: 429,
          json: async () => ({}),
        },
        {
          status: 200,
          json: async () => ({
            taxId: "03426484000123",
            company: {
              simples: { optant: false, since: null },
              simei: { optant: false, since: null },
            },
          }),
        },
      ]),
      new FakeRateLimiter(),
    );

    await expect(adapter.lookup("03426484000123")).resolves.toMatchObject({
      status: "SUCCESS",
      source: "cnpja-open",
    });
  });

  it("passes the lookup signal to the http client", async () => {
    const httpClient = new RecordingHttpClient();
    const adapter = new CnpjaOpenSimplesLookupAdapter(
      httpClient,
      new FakeRateLimiter(),
      5_000,
    );
    const controller = new AbortController();

    await adapter.lookup("03426484000123", { signal: controller.signal });

    expect(httpClient.lastOptions?.signal).toBeDefined();
  });

  it("aborts an in-flight request when the caller cancels the lookup", async () => {
    const httpClient = new AbortAwareHttpClient();
    const adapter = new CnpjaOpenSimplesLookupAdapter(
      httpClient,
      new FakeRateLimiter(),
      5_000,
    );
    const controller = new AbortController();

    const lookupPromise = adapter.lookup("03426484000123", {
      signal: controller.signal,
    });
    await httpClient.started;
    controller.abort();

    await expect(lookupPromise).rejects.toBeInstanceOf(AbortError);
  });

  it("returns temporary error after the request timeout elapses", async () => {
    const adapter = new CnpjaOpenSimplesLookupAdapter(
      new AbortAwareHttpClient(),
      new FakeRateLimiter(),
      1,
    );

    await expect(adapter.lookup("03426484000123")).resolves.toMatchObject({
      status: "TEMPORARY_ERROR",
      source: "cnpja-open",
      message: expect.stringMatching(/timeout|tempo/i),
    });
  });
});
