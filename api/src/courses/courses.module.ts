import { Module } from '@nestjs/common';
import { CoursesResolver } from './courses.resolver';
import { CoursesService } from './courses.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { QuizModule } from 'src/quiz/quiz.module';
@Module({
  providers: [CoursesResolver, CoursesService],
  imports: [PrismaModule, QuizModule],
})
export class CoursesModule { }
