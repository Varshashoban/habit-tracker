export async function getApiHealth() {
  const response = await fetch("/api/v1/health");

  if (!response.ok) {
    throw new Error("API health check failed.");
  }

  return response.json();
}
