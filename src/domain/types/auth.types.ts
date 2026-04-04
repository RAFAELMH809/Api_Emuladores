export interface LoginInput {
  email: string;
  password: string;
}

export interface JwtPayload {
  sub: string;
  role: "admin" | "operator";
  email: string;
}
