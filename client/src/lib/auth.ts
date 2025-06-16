import { apiRequest } from "./queryClient";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  userType: "prestador" | "contratante" | "anunciante";
}

export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await apiRequest("POST", "/api/login", credentials);
    return response.json();
  },

  async register(data: RegisterData) {
    const response = await apiRequest("POST", "/api/register", data);
    return response.json();
  },

  async logout() {
    await apiRequest("POST", "/api/logout");
  },

  async getCurrentUser() {
    const response = await apiRequest("GET", "/api/user");
    return response.json();
  },
};
