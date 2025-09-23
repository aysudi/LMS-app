export interface RegisterFormValues {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  terms: boolean;
}

export interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface ForgotPasswordFormValues {
  email: string;
}

export interface ResetPasswordFormValues {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface EditProfileFormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  bio: string;
  skills: string[];
  socialLinks: {
    website: string;
    linkedin: string;
    github: string;
    twitter: string;
  };
}
