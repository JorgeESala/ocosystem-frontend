export function serverMessage(error: unknown, fallback: string): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object"
  ) {
    const data = (error as { response?: { data?: { message?: unknown } } })
      .response?.data;
    if (data && typeof data.message === "string" && data.message) {
      return data.message;
    }
  }
  return fallback;
}
