import { apiRequest } from "./client";

export function getHabits() {
  return apiRequest("/habits");
}

export function createHabit(payload) {
  return apiRequest("/habits", {
    body: JSON.stringify(payload),
    method: "POST",
  });
}

export function updateHabit(habitId, payload) {
  return apiRequest(`/habits/${habitId}`, {
    body: JSON.stringify(payload),
    method: "PATCH",
  });
}

export function completeHabit(habitId) {
  return apiRequest(`/habits/${habitId}/complete`, {
    body: JSON.stringify({ completedDate: new Date().toISOString() }),
    method: "PATCH",
  });
}

export function deleteHabit(habitId) {
  return apiRequest(`/habits/${habitId}`, {
    method: "DELETE",
  });
}
