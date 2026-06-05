import { apiRequest } from "./client";

const apiBaseUrl = import.meta.env.VITE_API_URL || "/api/v1";

function toQueryString(filters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, value);
    }
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

export function generateReport(filters = {}) {
  return apiRequest("/reports/generate", {
    body: JSON.stringify(filters),
    method: "POST",
  });
}

export function getCurrentReport(filters = {}) {
  return apiRequest(`/reports/current${toQueryString(filters)}`);
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

export async function downloadCurrentReport(format, filters = {}) {
  const response = await fetch(
    `${apiBaseUrl}/reports/export${toQueryString({ ...filters, format })}`,
    {
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Export failed.");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const extension = format === "pdf" ? "pdf" : format === "json" ? "json" : "csv";
  const link = document.createElement("a");
  link.href = url;
  link.download = `habitflow-report.${extension}`;
  link.click();
  URL.revokeObjectURL(url);
}
