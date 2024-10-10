import { Test, TestingModule } from '@nestjs/testing';
import { AchievementsService } from './achievements.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('AchievementsService', () => {
  let service: AchievementsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AchievementsService, PrismaService],
    }).compile();

    service = module.get<AchievementsService>(AchievementsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
