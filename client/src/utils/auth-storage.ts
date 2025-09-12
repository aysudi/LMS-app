export const setAuthToken = (token: string): void => {
  localStorage.setItem("accessToken", token);
  window.dispatchEvent(new CustomEvent("auth-token-changed"));
};

export const removeAuthToken = (): void => {
  localStorage.removeItem("accessToken");
  window.dispatchEvent(new CustomEvent("auth-token-changed"));
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem("accessToken");
};

export const hasAuthToken = (): boolean => {
  return !!localStorage.getItem("accessToken");
};
