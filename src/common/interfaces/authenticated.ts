import { Role } from '@common/enums/enum';

export type JwtUser = {
  userId: string;
  email: string;
  role: Role;
};

export type AuthenticatedRequest = Request & {
  user: JwtUser;
};