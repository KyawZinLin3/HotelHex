import { Body, Controller, Get, Headers, Param, Post, Query } from '@nestjs/common';
import { FrontDeskService } from './front-desk.service';

@Controller('v1/front-desk')
export class FrontDeskController {
  constructor(private readonly service: FrontDeskService) {}
  @Get('properties') async properties(@Headers('authorization') h?: string) { return this.service.properties(await this.service.authenticate(h)); }
  @Get('options') async options(@Headers('authorization') h: string, @Query() q: any) { return this.service.options(await this.service.authenticate(h), q); }
  @Get('dashboard') async dashboard(@Headers('authorization') h: string, @Query() q: any) { return this.service.dashboard(await this.service.authenticate(h), q); }
  @Get('search') async search(@Headers('authorization') h: string, @Query() q: any) { return this.service.search(await this.service.authenticate(h), q); }
  @Get('arrivals') async arrivals(@Headers('authorization') h: string, @Query() q: any) { return this.service.arrivals(await this.service.authenticate(h), q); }
  @Get('in-house') async inHouse(@Headers('authorization') h: string, @Query() q: any) { return this.service.inHouse(await this.service.authenticate(h), q); }
  @Get('due-outs') async dueOuts(@Headers('authorization') h: string, @Query() q: any) { return this.service.dueOuts(await this.service.authenticate(h), q); }
  @Get('reports') async reports(@Headers('authorization') h: string, @Query() q: any) { return this.service.reports(await this.service.authenticate(h), q); }
  @Get('walk-in-rooms') async walkInRooms(@Headers('authorization') h: string, @Query() q: any) { return this.service.walkInRooms(await this.service.authenticate(h), q); }
  @Get('guests/:guestId/identities') async identities(@Headers('authorization') h: string, @Param('guestId') id: string, @Query() q: any) { return this.service.guestIdentities(await this.service.authenticate(h), id, q); }
  @Get('reservations/:id/precheck') async precheck(@Headers('authorization') h: string, @Param('id') id: string) { return this.service.precheck(await this.service.authenticate(h), id); }
  @Get('reservations/:id/rooms') async reservationRooms(@Headers('authorization') h: string, @Param('id') id: string) { return this.service.reservationRooms(await this.service.authenticate(h), id); }
  @Post('walk-ins') async walkIn(@Headers('authorization') h: string, @Body() b: any) { return this.service.walkIn(await this.service.authenticate(h), b); }
  @Post('check-in') async checkIn(@Headers('authorization') h: string, @Body() b: any) { return this.service.checkIn(await this.service.authenticate(h), b); }
  @Post('reservations/:id/assign-room') async assignRoom(@Headers('authorization') h: string, @Param('id') id: string, @Body() b: any) { return this.service.assignRoom(await this.service.authenticate(h), id, b); }
  @Get('stays/:id') async detail(@Headers('authorization') h: string, @Param('id') id: string) { return this.service.detail(await this.service.authenticate(h), id); }
  @Get('stays/:id/rooms') async stayRooms(@Headers('authorization') h: string, @Param('id') id: string) { return this.service.stayRooms(await this.service.authenticate(h), id); }
  @Post('stays/:id/change-room') async changeRoom(@Headers('authorization') h: string, @Param('id') id: string, @Body() b: any) { return this.service.changeRoom(await this.service.authenticate(h), id, b); }
  @Post('stays/:id/extend') async extend(@Headers('authorization') h: string, @Param('id') id: string, @Body() b: any) { return this.service.extend(await this.service.authenticate(h), id, b); }
  @Post('stays/:id/late-checkout') async lateCheckout(@Headers('authorization') h: string, @Param('id') id: string, @Body() b: any) { return this.service.extend(await this.service.authenticate(h), id, b, 'LATE_CHECKOUT'); }
  @Post('stays/:id/check-out') async checkout(@Headers('authorization') h: string, @Param('id') id: string, @Body() b: any) { return this.service.checkout(await this.service.authenticate(h), id, b); }
  @Post('stays/:id/keys') async keys(@Headers('authorization') h: string, @Param('id') id: string, @Body() b: any) { return this.service.keys(await this.service.authenticate(h), id, b); }
  @Post('stays/:id/keys/:keyId/return') async returnKey(@Headers('authorization') h: string, @Param('id') id: string, @Param('keyId') keyId: string) { return this.service.returnKey(await this.service.authenticate(h), id, keyId); }
  @Get('stays/:id/notes') async notes(@Headers('authorization') h: string, @Param('id') id: string) { return this.service.note(await this.service.authenticate(h), id, undefined); }
  @Post('stays/:id/notes') async addNote(@Headers('authorization') h: string, @Param('id') id: string, @Body() b: any) { return this.service.note(await this.service.authenticate(h), id, b); }
}
