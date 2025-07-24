import { Body, Controller, Get, Post } from '@nestjs/common';
import { Design } from './design.schema';
import { DesignsService } from './design.service';

@Controller('designs')
export class DesignsController {
  constructor(private readonly designService: DesignsService) {}

  @Get()
  async findAll(): Promise<Design[]> {
    return this.designService.findAll();
  }

  @Post()
  async createOrUpdate(@Body() payload: any): Promise<Design | void> {
    return this.designService.createOrUpdate(payload);
  }
}
