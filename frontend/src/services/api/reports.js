import { apiRequest } from "./client";

const apiBaseUrl = import.meta.env.VITE_API_URL || "/api/v1";

export function generateReport() {
  return apiRequest("/reports/generate", {
    method: "POST",
  });
}

export function getReportHistory() {
  return apiRequest("/reports/history");
}

export async function downloadReport(reportId, format) {
  const response = await fetch(
    `${apiBaseUrl}/reports/${reportId}/export?format=${format}`,
    {
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Export failed.");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const extension = format === "pdf" ? "pdf" : "csv";
  const link = document.createElement("a");
  link.href = url;
  link.download = `habitflow-${format}.${extension}`;
  link.click();
  URL.revokeObjectURL(url);
}
