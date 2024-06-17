import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizResolver } from './quiz.resolver';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
    providers: [QuizService, QuizResolver],
    imports: [PrismaModule],
    exports: [QuizService],
})
export class QuizModule {}
