import { ReservationManagementController } from './reservation-management.controller';
import { ReservationManagementService } from './reservation-management.service';
import { FrontDeskController } from './front-desk.controller';
import { FrontDeskService } from './front-desk.service';
import { GuestManagementController } from './guest-management.controller';
import { GuestManagementService } from './guest-management.service';
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { HealthController } from "./health.controller";
import { OrganizationController } from "./organization.controller";
import { OrganizationService } from "./organization.service";
import { PrismaService } from "./prisma.service";
import { SecurityController } from "./security.controller";
import { SecurityService } from "./security.service";
import { RoomManagementController } from './room-management.controller';
import { RoomManagementService } from './room-management.service';
import { RoomAccessService } from './room-access.service';
import { RateManagementController } from './rate-management.controller';
import { RateManagementService } from './rate-management.service';

@Module({
  controllers: [FrontDeskController, ReservationManagementController, GuestManagementController, AppController, HealthController, OrganizationController, SecurityController, RoomManagementController, RateManagementController],
  providers: [FrontDeskService, ReservationManagementService, GuestManagementService, PrismaService, OrganizationService, SecurityService, RoomManagementService, RoomAccessService, RateManagementService],
})
export class AppModule {}

