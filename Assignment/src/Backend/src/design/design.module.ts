import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { DesignsController } from './design.controller';
import { DesignsService } from './design.service';
import { DesignGateway } from './design.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { Design, DesignSchema } from './design.schema';

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({
      global: true,
      //   secret: 'dng180598',
      secretOrPrivateKey: '' + process.env.JWT_SECRET,
    }),
    MongooseModule.forFeature([{ name: Design.name, schema: DesignSchema }]),
  ],
  controllers: [DesignsController],
  providers: [DesignsService, DesignGateway],
  exports: [DesignsService],
})
export class DesignModule {}
