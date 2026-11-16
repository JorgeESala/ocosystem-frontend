export const clientDisplayName = (client: {
  name?: string | null;
  businessName?: string | null;
}): string =>
  client.name?.trim() || client.businessName?.trim() || "Sin nombre";
