import { Controller, Get } from "@nestjs/common";
@Controller()
export class AppController {
  @Get()
  getRoot() { return { name: "HotelHex API", version: "0.1.0", status: "ready" }; }
}
