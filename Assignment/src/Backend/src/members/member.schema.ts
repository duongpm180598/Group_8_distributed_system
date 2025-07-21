import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
export type MemberDocument = HydratedDocument<Member>;

@Schema({ collection: 'members' })
export class Member extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  nickname: string;

  @Prop({ required: true })
  gender: string;

  @Prop({ name: 'birth_date', required: false })
  birthDate: Date;

  @Prop({ name: 'death_date', required: false })
  deathDate: Date;

  @Prop({ required: false })
  address: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: false })
  fid: string;

  @Prop({ required: false })
  mid: string;

  @Prop()
  pids: string[];

  @Prop({ required: false, default: '' })
  phone: string;

  @Prop({ required: false, default: '' })
  photo: string;

  @Prop({ required: false, default: '' })
  position: string;

  @Prop({ name: 'created_date', default: new Date() })
  createdDate: Date;

  @Prop({ name: 'updated_date', default: null })
  updatedDate: Date;
}

export const MemberSchema = SchemaFactory.createForClass(Member);
