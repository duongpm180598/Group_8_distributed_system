import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  private async comparePasswords(
    userPassword: string,
    currentPassword: string,
  ) {
    return await bcrypt.compare(currentPassword, userPassword);
  }

  async findOneByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ username }).lean();
  }

  async validateCredentials({
    username,
    password,
  }: {
    username: string;
    password: string;
  }): Promise<User> {
    const user = await this.findOneByUsername(username);

    if (!user) {
      throw new HttpException(
        'Tài khoản hoặc mật khẩu không chính xác',
        HttpStatus.UNAUTHORIZED,
      );
    }
    let areEqual = false;
    if (user.password) {
      areEqual = await this.comparePasswords(user.password, password);
    }
    if (!areEqual) {
      throw new HttpException(
        'Tài khoản hoặc mật khẩu không chính xác',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return user;
  }

  private async hashPassword(password) {
    try {
      if (password) {
        password = await bcrypt.hash(password, 10);
      }
      return password;
    } catch (error) {
      console.log(error);
      throw new Error('Lỗi khi tạo tài khoản');
    }
  }

  async create(user: User): Promise<User> {
    const { username, password } = user;
    const userInDb = await this.findOneByUsername(username);
    if (userInDb) {
      throw new HttpException('Tài khoản đã tồn tại', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await this.hashPassword(password);

    const newUser = new this.userModel({ ...user, password: hashedPassword });

    return newUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }
}
