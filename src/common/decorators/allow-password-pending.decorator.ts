import { SetMetadata } from '@nestjs/common';

export const ALLOW_PASSWORD_PENDING_KEY = 'allowPasswordPending';

// Rota liberada para quem ainda precisa trocar a senha temporária
export const AllowPasswordPending = () => SetMetadata(ALLOW_PASSWORD_PENDING_KEY, true);
