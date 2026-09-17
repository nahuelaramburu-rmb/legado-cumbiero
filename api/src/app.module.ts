import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { GuestListModule } from './guest-list/guest-list.module';
import { HealthController } from './health/health.controller';
import { LocationsModule } from './locations/locations.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReservationsModule } from './reservations/reservations.module';
import { ShowsModule } from './shows/shows.module';
import { TenantsModule } from './tenants/tenants.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    TenantsModule,
    UsersModule,
    ShowsModule,
    ReservationsModule,
    GuestListModule,
    LocationsModule,
  ],
  controllers: [HealthController],
  providers: [
    // JwtAuthGuard corre para TODO endpoint salvo que tenga @Public().
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // Rate limiting global, más estricto en auth (ver AuthController).
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
