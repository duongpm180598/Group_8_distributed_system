import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MembersModule } from './members/members.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { DesignGateway } from './design/design.gateway';

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
    MembersModule,
    EventsModule,
    DesignGateway,
  ],
  controllers: [AppController],
  providers: [AppService, DesignGateway],
})
export class AppModule {}
