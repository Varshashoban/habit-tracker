import { apiRequest } from "./client";

export function getForecast() {
  return apiRequest("/forecast");
}
