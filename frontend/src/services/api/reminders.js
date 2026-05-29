import { apiRequest } from "./client";

export function getReminders() {
  return apiRequest("/reminders");
}

export function createReminder(payload) {
  return apiRequest("/reminders", {
    body: JSON.stringify(payload),
    method: "POST",
  });
}

export function updateReminder(reminderId, payload) {
  return apiRequest(`/reminders/${reminderId}`, {
    body: JSON.stringify(payload),
    method: "PATCH",
  });
}

export function deleteReminder(reminderId) {
  return apiRequest(`/reminders/${reminderId}`, {
    method: "DELETE",
  });
}
