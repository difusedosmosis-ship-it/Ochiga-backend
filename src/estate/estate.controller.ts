import { Controller, Post, Body } from '@nestjs/common';
import { EstateService } from './estate.service';

@Controller('estate')
export class EstateController {
  constructor(private readonly estateService: EstateService) {}

  @Post('create-home')
  async createHome(@Body() dto: any) {
    return this.estateService.createHome(dto);
  }
}
