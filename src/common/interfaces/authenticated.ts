export type JwtUser = {
  userId: number;
  email: string;
};

export type AuthenticatedRequest = Request & {
  user: JwtUser;
};