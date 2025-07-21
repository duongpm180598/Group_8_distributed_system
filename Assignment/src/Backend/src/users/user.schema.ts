import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
export type UserDocument = HydratedDocument<User>;

@Schema({ collection: 'users' })
export class User extends Document {
  @Prop({ required: true })
  username: string;

  @Prop({ required: false })
  name: string;

  @Prop({ required: false })
  avatar: string;

  @Prop({ required: false })
  password?: string;

  @Prop({ name: 'created_date', default: new Date() })
  createdDate: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);