import { Test, TestingModule } from '@nestjs/testing';
import { AchievementsResolver } from './achievements.resolver';
import { AchievementsService } from './achievements.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('AchievementsResolver', () => {
  let resolver: AchievementsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AchievementsResolver, AchievementsService, PrismaService],
    }).compile();

    resolver = module.get<AchievementsResolver>(AchievementsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
