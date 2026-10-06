import { Body, Controller, Get, Headers, Param, Post, Put, Query } from '@nestjs/common';
import { RoomAccessService } from './room-access.service';
import { RoomManagementService } from './room-management.service';

@Controller('v1/room-management')
export class RoomManagementController {
  constructor(private readonly service: RoomManagementService, private readonly access: RoomAccessService) {}
  @Get('properties')
  async properties(@Headers('authorization') token?: string) { return this.service.properties(await this.access.authenticate(token)); }
  @Get('options')
  async options(@Headers('authorization') token: string, @Query('propertyId') propertyId: string) { return this.service.options(await this.access.authenticate(token), propertyId); }
  @Get('rooms')
  async rooms(@Headers('authorization') token: string, @Query() q: any) { return this.service.list(await this.access.authenticate(token), q); }
  @Get('reports')
  async reports(@Headers('authorization') token: string, @Query() q: any) { return this.service.list(await this.access.authenticate(token), q, q.export === 'true' ? 'ROOM.REPORT.EXPORT' : 'ROOM.REPORT.VIEW'); }
  @Post('rooms/bulk')
  async bulk(@Headers('authorization') token: string, @Body() body: any) { return this.service.bulk(await this.access.authenticate(token), body); }
  @Post('rooms')
  async create(@Headers('authorization') token: string, @Body() body: any) { return this.service.saveRoom(await this.access.authenticate(token), body); }
  @Get('rooms/:id')
  async room(@Headers('authorization') token: string, @Param('id') id: string) { return this.service.detail(await this.access.authenticate(token), id); }
  @Get('rooms/:id/eligibility')
  async eligibility(@Headers('authorization') token: string, @Param('id') id: string, @Query() q: any) { return this.service.eligibility(await this.access.authenticate(token), id, q); }
  @Put('rooms/:id')
  async update(@Headers('authorization') token: string, @Param('id') id: string, @Body() body: any) { return this.service.saveRoom(await this.access.authenticate(token), body, id); }
  @Post('rooms/:id/activate')
  async activate(@Headers('authorization') token: string, @Param('id') id: string, @Body() body: any) { return this.service.activate(await this.access.authenticate(token), id, body, true); }
  @Post('rooms/:id/deactivate')
  async deactivate(@Headers('authorization') token: string, @Param('id') id: string, @Body() body: any) { return this.service.activate(await this.access.authenticate(token), id, body, false); }
  @Get('rooms/:id/status-history')
  async history(@Headers('authorization') token: string, @Param('id') id: string) { return this.service.history(await this.access.authenticate(token), id); }
  @Post('rooms/:id/status')
  async status(@Headers('authorization') token: string, @Param('id') id: string, @Body() body: any) { return this.service.status(await this.access.authenticate(token), id, body); }
  @Get('rooms/:id/notes')
  async notes(@Headers('authorization') token: string, @Param('id') id: string) { return this.service.notes(await this.access.authenticate(token), id); }
  @Post('rooms/:id/notes')
  async note(@Headers('authorization') token: string, @Param('id') id: string, @Body() body: any) { return this.service.notes(await this.access.authenticate(token), id, body); }
  @Get('out-of-order')
  async ooo(@Headers('authorization') token: string, @Query() q: any) { return this.service.holds(await this.access.authenticate(token), q, 'OOO'); }
  @Get('out-of-service')
  async oos(@Headers('authorization') token: string, @Query() q: any) { return this.service.holds(await this.access.authenticate(token), q, 'OOS'); }
  @Post('out-of-order')
  async createOoo(@Headers('authorization') token: string, @Body() body: any) { return this.service.createHold(await this.access.authenticate(token), 'OOO', body); }
  @Post('out-of-service')
  async createOos(@Headers('authorization') token: string, @Body() body: any) { return this.service.createHold(await this.access.authenticate(token), 'OOS', body); }
  @Post('out-of-order/:id/release')
  async releaseOoo(@Headers('authorization') token: string, @Param('id') id: string, @Body() body: any) { return this.service.releaseHold(await this.access.authenticate(token), id, 'OOO', body); }
  @Put('out-of-order/:id')
  async updateOoo(@Headers('authorization') token: string, @Param('id') id: string, @Body() body: any) { return this.service.updateHold(await this.access.authenticate(token), id, body); }
  @Post('out-of-service/:id/release')
  async releaseOos(@Headers('authorization') token: string, @Param('id') id: string, @Body() body: any) { return this.service.releaseHold(await this.access.authenticate(token), id, 'OOS', body); }
  @Get(':resource')
  async catalog(@Headers('authorization') token: string, @Param('resource') resource: string, @Query('propertyId') propertyId: string) { return this.service.catalog(await this.access.authenticate(token), resource, propertyId); }
  @Post(':resource')
  async createCatalog(@Headers('authorization') token: string, @Param('resource') resource: string, @Body() body: any) { return this.service.saveCatalog(await this.access.authenticate(token), resource, body); }
  @Put(':resource/:id')
  async updateCatalog(@Headers('authorization') token: string, @Param('resource') resource: string, @Param('id') id: string, @Body() body: any) { return this.service.saveCatalog(await this.access.authenticate(token), resource, body, id); }
}
