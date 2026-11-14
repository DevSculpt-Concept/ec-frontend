import { http } from "@/lib/http";

export interface UserProfile {
  id: string;
  email: string;
  role: string;
  full_name: string;
  phone?: string;
  profile_image_url?: string;
}

export interface UpdateProfileData {
  full_name?: string;
  phone?: string;
  profile_image_url?: string;
}

export const userService = {
  async getProfile(): Promise<{ status: string; message: string; data: { user: UserProfile } }> {
    const res = await http.get<{ user: UserProfile }>("/users/me");
    return res as { status: string; message: string; data: { user: UserProfile } };
  },

  async updateProfile(data: UpdateProfileData): Promise<{ status: string; message: string; data: { user: UserProfile } }> {
    const res = await http.patch<{ user: UserProfile }>("/users/me", data);
    return res as { status: string; message: string; data: { user: UserProfile } };
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ status: string; message: string }> {
    const res = await http.post("/users/me/change-password", { currentPassword, newPassword });
    return { status: res.status, message: res.message || "Password changed successfully" };
  },

  async deleteAccount(): Promise<{ status: string; message: string }> {
    const res = await http.delete("/users/me");
    return { status: res.status, message: res.message || "Account deleted" };
  },

  async uploadProfilePicture(file: File): Promise<{ status: string; message: string; data: { user: UserProfile; imageUrl: string } }> {
    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      throw new Error(`Image size is ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum allowed size is 5MB.`);
    }
    const form = new FormData();
    form.append("image", file);
    const res = await http.post<{ user: UserProfile; imageUrl: string }>("/users/me/profile-picture", form);
    return res as { status: string; message: string; data: { user: UserProfile; imageUrl: string } };
  },
};
