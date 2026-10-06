import { Body, Controller, Get, Headers, Param, Post, Put, Query } from '@nestjs/common';
import { GuestManagementService } from './guest-management.service';

@Controller('v1/guests')
export class GuestManagementController {
  constructor(private readonly service: GuestManagementService) {}
  @Get('properties') async properties(@Headers('authorization') h: string) { return this.service.properties(await this.service.authenticate(h)); }
  @Get('options') async options(@Headers('authorization') h: string, @Query() q: any) { return this.service.options(await this.service.authenticate(h), q); }
  @Post('configuration') async configuration(@Headers('authorization') h: string, @Query() q: any, @Body() b: any) { return this.service.configure(await this.service.authenticate(h), q, b); }
  @Get('search') async search(@Headers('authorization') h: string, @Query() q: any) { return this.service.list(await this.service.authenticate(h), q); }
  @Post('duplicates') async duplicates(@Headers('authorization') h: string, @Query() q: any, @Body() b: any) { return this.service.duplicateReview(await this.service.authenticate(h), q, b); }
  @Get('reports') async reports(@Headers('authorization') h: string, @Query() q: any) { return this.service.reports(await this.service.authenticate(h), q); }
  @Get('export') async export(@Headers('authorization') h: string, @Query() q: any) { return this.service.export(await this.service.authenticate(h), q); }
  @Get() async list(@Headers('authorization') h: string, @Query() q: any) { return this.service.list(await this.service.authenticate(h), q); }
  @Post() async create(@Headers('authorization') h: string, @Query() q: any, @Body() b: any) { return this.service.create(await this.service.authenticate(h), q, b); }
  @Get(':id') async detail(@Headers('authorization') h: string, @Query() q: any, @Param('id') id: string) { return this.service.detail(await this.service.authenticate(h), q, id); }
  @Put(':id') async update(@Headers('authorization') h: string, @Query() q: any, @Param('id') id: string, @Body() b: any) { return this.service.update(await this.service.authenticate(h), q, id, b); }
  @Post(':id/archive') async archive(@Headers('authorization') h: string, @Query() q: any, @Param('id') id: string, @Body() b: any) { return this.service.archive(await this.service.authenticate(h), q, id, b); }
  @Get(':id/audit') async audit(@Headers('authorization') h: string, @Query() q: any, @Param('id') id: string) { return this.service.auditHistory(await this.service.authenticate(h), q, id); }
  @Get(':id/:section') async section(@Headers('authorization') h: string, @Query() q: any, @Param('id') id: string, @Param('section') section: string) {
    const row: any = await this.service.detail(await this.service.authenticate(h), q, id);
    return ['contacts', 'addresses', 'identities', 'preferences', 'notes', 'vip', 'stayHistory'].includes(section) ? row[section] : [];
  }
  @Post(':id/:section') async add(@Headers('authorization') h: string, @Query() q: any, @Param('id') id: string, @Param('section') section: string, @Body() b: any) { return this.service.child(await this.service.authenticate(h), q, id, section, b); }
  @Put(':id/:section/:childId') async edit(@Headers('authorization') h: string, @Query() q: any, @Param('id') id: string, @Param('section') section: string, @Param('childId') childId: string, @Body() b: any) { return this.service.child(await this.service.authenticate(h), q, id, section, b, childId); }
}
