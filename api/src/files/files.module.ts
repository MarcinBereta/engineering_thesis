import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
    controllers: [FilesController],
    imports:[PrismaModule]
})
export class FilesModule {}
