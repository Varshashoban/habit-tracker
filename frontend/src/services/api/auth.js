import { apiRequest } from "./client";

export function signupUser(payload) {
  return apiRequest("/auth/signup", {
    body: JSON.stringify(payload),
    method: "POST",
  });
}

export function loginUser(payload) {
  return apiRequest("/auth/login", {
    body: JSON.stringify(payload),
    method: "POST",
  });
}

export function logoutUser() {
  return apiRequest("/auth/logout", {
    method: "POST",
  });
}

export function getCurrentUser() {
  return apiRequest("/auth/me");
}
