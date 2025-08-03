import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Design, DesignDocument } from './design.schema';
import { v4 as uuidv4 } from 'uuid';
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
    const designId = payload?.designId ?? '';

    // Tìm kiếm tài liệu hiện có bằng designId
    const designInDb = await this.findOneById(designId);

    if (designId && designInDb) {
      const updatedDesign = await this.designModel
        .findOneAndUpdate({ designId }, payload, { new: true })
        .lean();
      return updatedDesign as Design;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!payload.name) {
        let newName = 'Untitled';
        let index = 0;
        let existingDesign: Design | null = null;

        do {
          const searchName = index === 0 ? 'Untitled' : `Untitled (${index})`;
          existingDesign = await this.designModel
            .findOne({ name: searchName })
            .lean();
          if (existingDesign) {
            index++;
          } else {
            newName = searchName;
          }
        } while (existingDesign);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        payload.name = newName;
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      payload.designId = uuidv4();
      console.log(payload, '===========================');
      const design = new this.designModel(payload);
      return design.save();
    }
  }

  async findAll(): Promise<Design[]> {
    return this.designModel.find().exec();
  }
}
