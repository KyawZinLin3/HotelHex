import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Put, Req } from "@nestjs/common";
import { SecurityService } from "./security.service";

@Controller("v1/security")
export class SecurityController {
  constructor(private readonly service: SecurityService) {}
  @Post('auth/change-password') changePassword(@Headers('authorization') authorization: string, @Body() body: any) { return this.service.changeOwnPassword(authorization?.replace(/^Bearer\s+/i, ''), body.oldPassword, body.newPassword); }
  @Post('auth/logout') logout(@Headers('authorization') authorization?: string) { return this.service.logout(authorization?.replace(/^Bearer\s+/i, '')); }
  @Post("auth/login") login(@Body() body: any, @Req() req: any) { return this.service.login(body.username ?? "", body.password ?? "", { ipAddress: req.ip, userAgent: req.headers?.["user-agent"] }); }
  @Get("auth/me") me(@Headers("authorization") authorization?: string) { return this.service.currentUser(authorization?.replace(/^Bearer\s+/i, "")); }
  @Get("users") users() { return this.service.users(); }
  @Post("users") createUser(@Body() body: any) { return this.service.createUser(body); }
  @Get("users/:id") user(@Param("id") id: string) { return this.service.user(id); }
  @Patch("users/:id") updateUser(@Param("id") id: string, @Body() body: any) { return this.service.updateUser(id, body); }
  @Post("users/:id/activate") activate(@Param("id") id: string) { return this.service.setUserStatus(id, "ACTIVE"); }
  @Post("users/:id/deactivate") deactivate(@Param("id") id: string) { return this.service.setUserStatus(id, "INACTIVE"); }
  @Post("users/:id/unlock") unlock(@Param("id") id: string) { return this.service.setUserStatus(id, "ACTIVE"); }
  @Post("users/:id/reset-password") reset(@Param("id") id: string, @Body() body: any) { return this.service.resetPassword(id, body.password); }
  @Get("users/:id/assignments") assignments(@Param("id") id: string) { return this.service.assignments(id); }
  @Post("users/:id/assignments") assign(@Param("id") id: string, @Body() body: any) { return this.service.assignRole(id, body); }
  @Delete("users/:id/assignments/:assignmentId") remove(@Param("assignmentId") id: string) { return this.service.removeAssignment(id); }
  @Get("roles") roles() { return this.service.roles(); }
  @Post("roles") createRole(@Body() body: any) { return this.service.createRole(body); }
  @Get("roles/:id") role(@Param("id") id: string) { return this.service.role(id); }
  @Patch("roles/:id") updateRole(@Param("id") id: string, @Body() body: any) { return this.service.updateRole(id, body); }
  @Get("roles/:id/permissions") rolePermissions(@Param("id") id: string) { return this.service.role(id); }
  @Put("roles/:id/permissions") setPermissions(@Param("id") id: string, @Body() body: any) { return this.service.replaceRolePermissions(id, body.permissionIds ?? []); }
  @Get("permissions") permissions() { return this.service.permissions(); }
}
