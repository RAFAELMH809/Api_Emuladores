export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface JwtPayload {
  sub: string;
  role: "admin" | "operator";
  email: string;
}
