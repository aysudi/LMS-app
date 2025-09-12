export interface IUser {
  id?: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password?: string;
  role?: string;
  isEmailVerified?: boolean;
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User implements IUser {
  id?: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password?: string;
  role: string;
  isEmailVerified: boolean;
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(userData: IUser) {
    this.id = userData.id;
    this.firstName = userData.firstName;
    this.lastName = userData.lastName;
    this.username = userData.username;
    this.email = userData.email;
    this.password = userData.password;
    this.role = userData.role || "student";
    this.isEmailVerified = userData.isEmailVerified || false;
    this.avatar = userData.avatar;
    this.createdAt = userData.createdAt;
    this.updatedAt = userData.updatedAt;
  }

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  getDisplayName(): string {
    return this.username || this.getFullName();
  }

  isVerified(): boolean {
    return this.isEmailVerified;
  }

  isStudent(): boolean {
    return this.role === "student";
  }

  isInstructor(): boolean {
    return this.role === "instructor";
  }

  isAdmin(): boolean {
    return this.role === "admin";
  }

  getInitials(): string {
    return `${this.firstName.charAt(0)}${this.lastName.charAt(
      0
    )}`.toUpperCase();
  }

  toJSON(): Omit<IUser, "password"> {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }

  // Create user for registration (only required fields)
  static forRegistration(userData: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
  }): User {
    return new User({
      ...userData,
      role: "student",
      isEmailVerified: false,
    });
  }
}
