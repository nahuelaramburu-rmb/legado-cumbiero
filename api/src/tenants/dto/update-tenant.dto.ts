import { PartialType } from '@nestjs/swagger';
import { CreateTenantDto } from './create-tenant.dto';

/** Edición de marca/branding — no permite tocar el slug (eso rompería URLs existentes). */
export class UpdateTenantDto extends PartialType(CreateTenantDto) {}
