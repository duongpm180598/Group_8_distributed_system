import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Design } from './design.schema';
import { DesignsService } from './design.service';

@Controller('designs')
export class DesignsController {
  constructor(private readonly designService: DesignsService) {}

  @Get()
  async findAll(): Promise<Design[]> {
    return this.designService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') designId: string): Promise<Design | null> {
    return this.designService.findOneById(designId);
  }

  @Post()
  async createOrUpdate(@Body() payload: any): Promise<Design | void> {
    return this.designService.createOrUpdate(payload);
  }
}
