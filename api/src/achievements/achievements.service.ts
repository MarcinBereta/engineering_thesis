import { Injectable } from '@nestjs/common';
import { UserAchievement } from './achievements.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AchievementsService {
    constructor(private prismaService: PrismaService) {}

    private async coursesCount(userId: string): Promise<number> {
        return await this.prismaService.course.count({
            where: {
                verified: true,
                creatorId: userId,
            },
        });
    }

    private async getUserStats(userId: string): Promise<any> {
        return await this.prismaService.user.findUnique({
            where: {
                id: userId,
            },
            include: {
                scores: true,
            },
        });
    }

    private async getAchievements(){
        return await this.prismaService.achievement.findMany()
    }

    async getUserAchievements(userId: string): Promise<UserAchievement[]> {
        const achievements =  await this.getAchievements();
        const userStats = await this.getUserStats(userId);

        const coursesCount = await this.coursesCount(userId);

        const userAchievements: UserAchievement[] = [];
        for (const achievement of achievements) {
            if (achievement.name.startsWith('numberOfGames')) {
                const numberOfGames = userStats.scores.length;
                const requiredGames = parseInt(achievement.name.split('_')[1]);
                if (numberOfGames >= requiredGames) {
                    userAchievements.push(achievement);
                }
            }
            if (achievement.name.startsWith('numberOfCreatedCourses')) {
                const requiredCourses = parseInt(
                    achievement.name.split('_')[1]
                );
                if (coursesCount >= requiredCourses) {
                    userAchievements.push(achievement);
                }
            }
        }
        return userAchievements;
    }
}
