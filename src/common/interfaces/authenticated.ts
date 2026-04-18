export type JwtUser = {
  userId: string;
  email: string;
};

export type AuthenticatedRequest = Request & {
  user: JwtUser;
};