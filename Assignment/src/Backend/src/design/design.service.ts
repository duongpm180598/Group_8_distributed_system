import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Design, DesignDocument } from './design.schema';
@Injectable()
export class DesignsService {
  constructor(
    @InjectModel(Design.name)
    private designModel: Model<DesignDocument>,
  ) {}

  async findOneById(designId: string): Promise<Design | null> {
    return this.designModel.findOne({ designId }).lean();
  }

  async createOrUpdate(payload: any): Promise<Design | void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const designId = payload.designId;

    if (!designId) {
      return;
    }

    // Tìm kiếm tài liệu hiện có bằng designId
    const designInDb = await this.findOneById(designId);

    if (designInDb) {
      console.log(payload);
      const updatedDesign = await this.designModel
        .findOneAndUpdate({ designId }, payload, { new: true })
        .lean();
      return updatedDesign as Design;
    } else {
      const design = new this.designModel(payload);
      return design.save();
    }
  }

  async findAll(): Promise<Design[]> {
    return this.designModel.find().exec();
  }
}
