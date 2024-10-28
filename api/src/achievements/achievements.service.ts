import { Injectable } from '@nestjs/common';
import { UserAchievement } from './achievements.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AchievementsService {
    constructor(private prismaService: PrismaService) {}

    async getUserAchievements(userId: string): Promise<UserAchievement[]> {
        const achievements = await this.checkAchivements(userId);
        const userAchievements: UserAchievement[] = [];
        for (const achievement of achievements) {
            userAchievements.push({
                name: achievement,
                userId: userId,
                icon: 'default-icon',
            });
            const userAchievement =
                await this.prismaService.achievement.findFirst({
                    where: {
                        userId: userId,
                        name: achievement,
                    },
                });
            if (!userAchievement) {
                await this.prismaService.achievement.create({
                    data: {
                        name: achievement,
                        userId: userId,
                        icon: 'default-icon',
                    },
                });
            }
        }

        console.log(userAchievements);
        return userAchievements;
    }
    /*
    Achivements:
    - Number of games 1 - 1000
    - Number of games 2 - 10000
    - Number of friends 1 - 10
    - Number of friends 2 - 100
    - NUmber of created courses 1 - 10
    - Number of created courses 2 - 100
    - Get verification 
    - Get 100% in quiz 1 - 10
    - Get 100% in quiz 2 - 100
    - Get first friend
    */
    async isVerified(userID: string): Promise<boolean> {
        const user = await this.prismaService.user.findUnique({
            where: {
                id: userID,
            },
        });
        return user.verified;
    }
    async getAllUserGamesCount(userID: string): Promise<number> {
        return await this.prismaService.userScores.count({
            where: {
                userId: userID,
            },
        });
    }
    async getFriendsCount(userID: string): Promise<number> {
        return await this.prismaService.friends.count({
            where: {
                userId: userID,
            },
        });
    }
    async getCreatedCourses(userID: string): Promise<number> {
        return await this.prismaService.course.count({
            where: {
                creatorId: userID,
            },
        });
    }
    async checkAchivements(userID: string): Promise<string[]> {
        const userGames = await this.getAllUserGamesCount(userID);
        const userFriends = await this.getFriendsCount(userID);
        const userCourses = await this.getCreatedCourses(userID);
        console.log(userGames, userFriends, userCourses);
        const userAchivements = [];
        if (userGames >= 1000) {
            userAchivements.push('numberOfGames1000');
        }
        if (userGames >= 10000) {
            userAchivements.push('numberOfGames10000');
        }
        if (userCourses >= 10) {
            userAchivements.push('numberOfCreatedCourses10');
        }
        if (userCourses >= 100) {
            userAchivements.push('numberOfCreatedCourses100');
        }
        if (userFriends >= 1) {
            userAchivements.push('getFirstFriend');
        }
        if (userFriends >= 10) {
            userAchivements.push('numberOfFriends10');
        }
        if (userFriends >= 100) {
            userAchivements.push('numberOfFriends100');
        }
        if (this.isVerified(userID)) {
            userAchivements.push('getVerification');
        }
        console.log(userAchivements);
        return userAchivements;
    }
}
