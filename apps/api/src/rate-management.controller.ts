import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { RateManagementService } from './rate-management.service';

@Controller('v1/rate-management')
export class RateManagementController {
  constructor(private readonly service: RateManagementService) {}
  @Get('properties') async properties(@Headers('authorization') h?: string) { return this.service.properties(await this.service.authenticate(h)); }
  @Get('options') async options(@Headers('authorization') h: string, @Query('propertyId') p: string, @Query('branchId') b?: string) { return this.service.options(await this.service.authenticate(h), p, b); }
  @Get('plans') async plans(@Headers('authorization') h: string, @Query('propertyId') p: string, @Query() q: any) { return this.service.listPlans(await this.service.authenticate(h), p, q); }
  @Post('plans') async create(@Headers('authorization') h: string, @Body() b: any) { return this.service.savePlan(await this.service.authenticate(h), b); }
  @Put('plans/:id') async update(@Headers('authorization') h: string, @Param('id') id: string, @Body() b: any) { return this.service.savePlan(await this.service.authenticate(h), b, id); }
  @Post('plans/:id/activate') async activate(@Headers('authorization') h: string, @Param('id') id: string) { return this.service.activate(await this.service.authenticate(h), id, true); }
  @Post('plans/:id/deactivate') async deactivate(@Headers('authorization') h: string, @Param('id') id: string) { return this.service.activate(await this.service.authenticate(h), id, false); }
  @Post('plans/:id/prices') async price(@Headers('authorization') h: string, @Param('id') id: string, @Body() b: any) { return this.service.saveRoomRate(await this.service.authenticate(h), id, b); }
  @Delete('plans/:id/prices/:priceId') async deletePrice(@Headers('authorization') h: string, @Param('id') id: string, @Param('priceId') priceId: string) { return this.service.deleteRoomRate(await this.service.authenticate(h), id, priceId); }
  @Get('plans/:id/calendar') async calendar(@Headers('authorization') h: string, @Param('id') id: string, @Query('from') from: string, @Query('to') to: string) { return this.service.calendar(await this.service.authenticate(h), id, from, to); }
  @Put('plans/:id/calendar') async updateCalendar(@Headers('authorization') h: string, @Param('id') id: string, @Body() b: any) { return this.service.updateCalendar(await this.service.authenticate(h), id, b); }
  @Get('seasons') async seasons(@Headers('authorization') h: string, @Query('propertyId') p: string) { return this.service.seasons(await this.service.authenticate(h), p); }
  @Post('seasons') async createSeason(@Headers('authorization') h: string, @Body() b: any) { return this.service.saveSeason(await this.service.authenticate(h), b); }
  @Put('seasons/:id') async updateSeason(@Headers('authorization') h: string, @Param('id') id: string, @Body() b: any) { return this.service.saveSeason(await this.service.authenticate(h), b, id); }
  @Put('properties/:id/stay-policy') async policy(@Headers('authorization') h: string, @Param('id') id: string, @Body() b: any) { return this.service.savePolicy(await this.service.authenticate(h), id, b); }
  @Get('hourly-tiers') async tiers(@Headers('authorization') h: string, @Query('propertyId') p: string) { return this.service.hourlyTiers(await this.service.authenticate(h), p); }
  @Post('hourly-tiers') async createTier(@Headers('authorization') h: string, @Body() b: any) { return this.service.saveHourlyTier(await this.service.authenticate(h), b); }
  @Put('hourly-tiers/:id') async updateTier(@Headers('authorization') h: string, @Param('id') id: string, @Body() b: any) { return this.service.saveHourlyTier(await this.service.authenticate(h), b, id); }
  @Post('quote') async quote(@Headers('authorization') h: string, @Body() b: any) { return this.service.quote(await this.service.authenticate(h), b); }
}
