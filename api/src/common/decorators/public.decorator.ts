import { SetMetadata } from '@nestjs/common';

/** Marca un endpoint como accesible sin token (opt-out del JwtAuthGuard global). */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
