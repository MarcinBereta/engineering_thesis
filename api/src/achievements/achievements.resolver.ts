import {  UseGuards } from '@nestjs/common';
import { Context, Query, Resolver } from '@nestjs/graphql';
import { UserAchievement } from './achievements.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { AchievementsService } from './achievements.service';

@Resolver()
@UseGuards(JwtAuthGuard)
export class AchievementsResolver {

    constructor(private achievementsService: AchievementsService) {}

    @Query(() => [UserAchievement])
    async getUserAchievements(@Context() context): Promise<UserAchievement[]> {
        return this.achievementsService.getUserAchievements(context.req.user.id);
    }
}
