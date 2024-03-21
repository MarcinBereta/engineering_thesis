import { Test, TestingModule } from '@nestjs/testing';
import { CoursesResolver } from './courses.resolver';

describe('CoursesResolver', () => {
  let resolver: CoursesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoursesResolver],
    }).compile();

    resolver = module.get<CoursesResolver>(CoursesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
