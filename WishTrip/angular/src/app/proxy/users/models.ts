
export interface ChangePasswordDto {
  currentPassword?: string;
  newPassword?: string;
}

export interface UpdateProfileDto {
  userName?: string;
  email?: string;
  name?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface UserProfileDto {
  id?: string;
  userName?: string;
  name?: string;
  email?: string;
  bio?: string;
  avatarUrl?: string;
}
