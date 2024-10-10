
  import { Module } from '@nestjs/common';
import { AchievementsResolver } from './achievements.resolver';
import { AchievementsService } from './achievements.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [AchievementsResolver, AchievementsService],
  imports:[PrismaModule]
})
export class AchievementsModule {}
