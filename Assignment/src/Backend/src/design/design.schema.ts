import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
export type DesignDocument = HydratedDocument<Design>;

@Schema({ collection: 'designs' })
export class Design extends Document {
  @Prop({ required: true })
  designId: string;

  @Prop({ type: Object })
  thumbnail: string;

  @Prop({ type: Object })
  canvas: any;

  @Prop({ name: 'created_date', default: new Date() })
  createdDate: Date;
}

export const DesignSchema = SchemaFactory.createForClass(Design);
