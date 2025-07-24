import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DesignGateway } from './design/design.gateway';
import { DesignModule } from './design/design.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
      expandVariables: true,
    }),
    MongooseModule.forRoot(process.env.DATABASE_URI as string, {}),
    UsersModule,
    AuthModule,
    DesignModule,
  ],
  controllers: [AppController],
  providers: [AppService, DesignGateway],
})
export class AppModule {}
