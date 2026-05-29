import { apiRequest } from "./client";

export function getProductivityInsight() {
  return apiRequest("/productivity");
}
