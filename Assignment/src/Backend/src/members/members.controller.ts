import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { Member } from './member.schema';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('members')
export class MembersController {
  constructor(private readonly memberService: MembersService) {}

  //get all members
  @Get()
  async findAll(): Promise<Member[]> {
    return this.memberService.findAll();
  }

  //get member by id
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Member> {
    const member = await this.memberService.findOne(id);
    if (!member) {
      throw new NotFoundException('Member does not exist!');
    } else {
      return member;
    }
  }

  //create member
  @Post()
  async create(@Body() member: Member): Promise<Member> {
    return this.memberService.create(member);
  }

  //update member
  @Put(':id')
  async update(@Param('id') id: string, @Body() member: Member): Promise<any> {
    return this.memberService.update(id, member);
  }

  //delete member
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<any> {
    //handle error if member does not exist
    const member = await this.memberService.findOne(id);
    if (!member) {
      throw new NotFoundException('Member does not exist!');
    }
    return this.memberService.delete(id);
  }
}
