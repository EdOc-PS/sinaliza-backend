import { Role } from '@common/enums/enum';

export type JwtUser = {
  userId: string;
  email: string;
  roles: Role[];
  mustChangePassword?: boolean;
};

export type AuthenticatedRequest = Request & {
  user: JwtUser;
};
