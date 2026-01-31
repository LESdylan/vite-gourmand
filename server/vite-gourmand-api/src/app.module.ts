// src/app.module.ts
import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MenusModule } from './menus/menus.module';
import { OrdersModule } from './orders/orders.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    PrismaModule, // relational DB
    AnalyticsModule, // MongoDB
    MongooseModule.forRoot(process.env.MONGO_URI), // connect to MongoDB
    UsersModule,
    AuthModule,
    MenusModule,
    OrdersModule,
  ],
})
export class AppModule {}
