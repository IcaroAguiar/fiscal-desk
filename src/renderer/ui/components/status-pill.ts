export type StatusPillVariant = "default" | "muted" | "success" | "danger";

export type StatusPillOptions = {
  variant?: StatusPillVariant;
  children: string;
  dataSlot?: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function statusPill(options: StatusPillOptions): string {
  const { variant = "default", children, dataSlot } = options;
  const variantClass = variant !== "default" ? `status-pill--${variant}` : "";
  const slotAttribute = dataSlot ? ` data-slot="${escapeHtml(dataSlot)}"` : "";

  return `<span${slotAttribute} class="status-pill ${variantClass}">${escapeHtml(children)}</span>`;
}
