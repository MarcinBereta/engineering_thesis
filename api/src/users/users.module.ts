import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersResolver } from './users.resolver';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
    providers: [UsersService, UsersResolver],
    controllers: [UsersController],
    imports: [PrismaModule],
    exports: [UsersService],
})
export class UsersModule {}
