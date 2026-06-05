import { apiRequest } from "./client";

export function getSettings() {
  return apiRequest("/settings");
}

export function updateProfileSettings(payload) {
  return apiRequest("/settings/profile", {
    body: JSON.stringify(payload),
    method: "PATCH",
  });
}

export function updateNotificationSettings(payload) {
  return apiRequest("/settings/notifications", {
    body: JSON.stringify(payload),
    method: "PATCH",
  });
}

export function updateProductivitySettings(payload) {
  return apiRequest("/settings/productivity", {
    body: JSON.stringify(payload),
    method: "PATCH",
  });
}

export function updateAccountSettings(payload) {
  return apiRequest("/settings/account", {
    body: JSON.stringify(payload),
    method: "PATCH",
  });
}

export function updatePassword(payload) {
  return apiRequest("/settings/security", {
    body: JSON.stringify(payload),
    method: "PATCH",
  });
}
