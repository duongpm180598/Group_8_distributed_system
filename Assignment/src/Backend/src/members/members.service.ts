import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Member, MemberDocument } from './member.schema';
import { Repository } from 'typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class MembersService {
  constructor(
    @InjectModel(Member.name)
    private readonly memberModel: Model<MemberDocument>,
  ) {}

  async findAll(): Promise<Member[]> {
    return this.memberModel.find().exec();
  }

  async findOne(_id: string): Promise<Member | null> {
    return this.memberModel.findById({ _id });
  }

  async create(Member: Partial<Member>): Promise<Member> {
    const newMember = new this.memberModel(Member);
    return newMember.save();
  }

  async update(_id: string, Member: Partial<Member>): Promise<Member | null> {
    await this.memberModel.findByIdAndUpdate(_id, Member);
    return this.memberModel.findById(_id);
  }

  async delete(_id: string): Promise<void> {
    await this.memberModel.findByIdAndDelete({ _id });
  }
}
