import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { OrganizationService } from "./organization.service";

@Controller("v1/organization")
export class OrganizationController {
  constructor(private readonly service: OrganizationService) {}

  @Get("dashboard")
  dashboard() { return this.service.dashboard(); }

  @Get("hierarchy")
  hierarchy() { return this.service.hierarchy(); }

  @Get(":resource")
  list(@Param("resource") resource: string, @Query() query: Record<string, string | undefined>) {
    return this.service.list(resource, query);
  }

  @Get(":resource/:id")
  get(@Param("resource") resource: string, @Param("id") id: string) {
    return this.service.get(resource, id);
  }

  @Post(":resource")
  create(@Param("resource") resource: string, @Body() body: any) {
    return this.service.create(resource, body);
  }

  @Patch(":resource/:id")
  update(@Param("resource") resource: string, @Param("id") id: string, @Body() body: any) {
    return this.service.update(resource, id, body);
  }

  @Patch(":resource/:id/deactivate")
  deactivate(@Param("resource") resource: string, @Param("id") id: string) {
    return this.service.deactivate(resource, id);
  }
}
