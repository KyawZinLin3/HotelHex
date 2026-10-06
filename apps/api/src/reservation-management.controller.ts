import { Body, Controller, Get, Headers, Param, Post, Put, Query } from '@nestjs/common';
import { ReservationManagementService } from './reservation-management.service';

@Controller('v1/reservations')
export class ReservationManagementController {
  constructor(private readonly service: ReservationManagementService) {}
  @Get('properties') async properties(@Headers('authorization') h?: string) { return this.service.properties(await this.service.authenticate(h)); }
  @Get('options') async options(@Headers('authorization') h: string, @Query() q: any) { return this.service.options(await this.service.authenticate(h), q); }
  @Post('catalog') async catalog(@Headers('authorization') h: string, @Query() q: any, @Body() b: any) { return this.service.addCatalog(await this.service.authenticate(h), q, b); }
  @Post('availability/search') async availability(@Headers('authorization') h: string, @Body() b: any) { return this.service.availability(await this.service.authenticate(h), b); }
  @Get('reports') async reports(@Headers('authorization') h: string, @Query() q: any) { return this.service.reports(await this.service.authenticate(h), q); }
  @Get() async list(@Headers('authorization') h: string, @Query() q: any) { return this.service.list(await this.service.authenticate(h), q); }
  @Post() async create(@Headers('authorization') h: string, @Query() q: any, @Body() b: any) { return this.service.create(await this.service.authenticate(h), q, b); }
  @Get(':id') async detail(@Headers('authorization') h: string, @Param('id') id: string) { return this.service.detail(await this.service.authenticate(h), {}, id); }
  @Put(':id') async update(@Headers('authorization') h: string, @Param('id') id: string, @Body() b: any) { return this.service.update(await this.service.authenticate(h), id, b); }
  @Post(':id/confirm') async confirm(@Headers('authorization') h: string, @Param('id') id: string, @Body() b: any) { return this.service.confirm(await this.service.authenticate(h), id, b); }
  @Post(':id/cancel') async cancel(@Headers('authorization') h: string, @Param('id') id: string, @Body() b: any) { return this.service.cancel(await this.service.authenticate(h), id, b); }
  @Post(':id/no-show') async noShow(@Headers('authorization') h: string, @Param('id') id: string, @Body() b: any) { return this.service.noShow(await this.service.authenticate(h), id, b); }
  @Post(':id/reprice') async reprice(@Headers('authorization') h: string, @Param('id') id: string) { return this.service.reprice(await this.service.authenticate(h), id); }
  @Post(':id/room') async assign(@Headers('authorization') h: string, @Param('id') id: string, @Body() b: any) { return this.service.assign(await this.service.authenticate(h), id, b); }
  @Get(':id/rooms') async rooms(@Headers('authorization') h: string, @Param('id') id: string) { return this.service.assignableRooms(await this.service.authenticate(h), id); }
  @Put(':id/guarantee') async guarantee(@Headers('authorization') h: string, @Param('id') id: string, @Body() b: any) { return this.service.guarantee(await this.service.authenticate(h), id, b); }
  @Get(':id/requests') async requests(@Headers('authorization') h: string, @Param('id') id: string) { return this.service.child(await this.service.authenticate(h), id, undefined, 'requests'); }
  @Post(':id/requests') async addRequest(@Headers('authorization') h: string, @Param('id') id: string, @Body() b: any) { return this.service.child(await this.service.authenticate(h), id, b, 'requests'); }
  @Get(':id/notes') async notes(@Headers('authorization') h: string, @Param('id') id: string) { return this.service.child(await this.service.authenticate(h), id, undefined, 'notes'); }
  @Post(':id/notes') async addNote(@Headers('authorization') h: string, @Param('id') id: string, @Body() b: any) { return this.service.child(await this.service.authenticate(h), id, b, 'notes'); }
  @Get(':id/history') async history(@Headers('authorization') h: string, @Param('id') id: string) { return this.service.history(await this.service.authenticate(h), id); }
}
