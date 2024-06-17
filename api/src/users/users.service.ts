import { Inject, Injectable } from '@nestjs/common';
import { Category, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserInput } from './dto/create-user-input';
import { UserEdit } from './dto/edit-user-input';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { VerificationFormData } from './verification-form';
@Injectable()
export class UsersService {
    constructor(
        private prismaService: PrismaService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
    ) {}

    async findAll(): Promise<User[]> {
        const cachedUsers = await this.cacheManager.get<User[]>('all_users');
        if (cachedUsers) {
            return cachedUsers;
        }

        const users = await this.prismaService.user.findMany({
            include: {
                Moderator: true,
            },
        });

        await this.cacheManager.set('all_users', users);

        return users;
    }

    async create(User: CreateUserInput): Promise<User> {
        this.cacheManager.del('all_users');
        return await this.prismaService.user.create({
            data: {
                email: User.email,
                username: User.username,
                password: User.password,
            },
        });
    }

    async getUserById(id: string): Promise<User> {
        const cachedUser = await this.cacheManager.get<User>('user/' + id);
        if (cachedUser) {
            return cachedUser;
        }
        const user = await await this.prismaService.user.findUnique({
            where: {
                id,
            },
        });
        if (!user) {
            throw new Error('User not found');
        }
        await this.cacheManager.set('user/' + id, user);
        await this.cacheManager.set('user/name/' + user.username, user);

        return user;
    }

    async getUserByName(username: string): Promise<User> {
        const cachedUser = await this.cacheManager.get<User>(
            'user/name/' + username
        );
        if (cachedUser) {
            return cachedUser;
        }

        const user = await this.prismaService.user.findUnique({
            where: {
                username: username,
            },
        });
        if (!user) {
            throw new Error('User not found');
        }
        await this.cacheManager.set('user/' + user.id, user);
        return user;
    }

    private async removeUserFromModerators(userId: string) {
        await this.prismaService.moderator.deleteMany({
            where: {
                userId: userId,
            },
        });
    }

    private async updateModerator(userId: string, categories: string[]) {
        const isUserModerator = await this.prismaService.moderator.findFirst({
            where: {
                userId: userId,
            },
        });

        if (!isUserModerator) {
            await this.prismaService.moderator.create({
                data: {
                    userId: userId,
                    categories: categories as Category[],
                },
            });
        } else {
            await this.prismaService.moderator.updateMany({
                where: {
                    userId: userId,
                },
                data: {
                    categories: categories as Category[],
                },
            });
        }
    }

    async updateUser(userData: UserEdit): Promise<User> {
        if (userData.role == 'USER')
            await this.removeUserFromModerators(userData.id);
        else await this.updateModerator(userData.id, userData.categories);

        const user = await this.prismaService.user.update({
            where: {
                id: userData.id,
            },
            data: {
                role: userData.role,
                verified: userData.verified,
            },
            include: {
                Moderator: true,
            },
        });

        await this.cacheManager.del('all_users');
        await this.cacheManager.del('user/' + user.id);
        await this.cacheManager.del('user/name/' + user.username);

        return user;
    }

    async addVerificationForm(text: string, userId: string) {
        const user = await this.getUserById(userId);
        if (!user) {
            throw new Error('User doesn`t exist');
        }
        if (user.verified) {
            throw new Error('User is already verified');
        }
        const isVerificationSent =
            await this.prismaService.verificationForm.findFirst({
                where: {
                    userId: userId,
                },
            });

        if (isVerificationSent) {
            throw new Error('Verification form is already sent');
        }

        await this.prismaService.verificationForm.create({
            data: {
                text: text,
                userId: userId,
            },
        });

        await this.cacheManager.del('verification_requests');
        return user;
    }

    async verifyUser(requestId: string) {
        const verificationForm =
            await this.prismaService.verificationForm.findUnique({
                where: {
                    id: requestId,
                },
            });
        if (!verificationForm) {
            throw new Error('Verification form not found');
        }
        const user = await this.getUserById(verificationForm.userId);
        if (!user) {
            throw new Error('User not found');
        }
        if (user.verified) {
            throw new Error('User is already verified');
        }
        await this.prismaService.user.update({
            where: {
                id: verificationForm.userId,
            },
            data: {
                verified: true,
            },
        });

        await this.prismaService.verificationForm.delete({
            where: {
                id: requestId,
            },
        });
        await this.cacheManager.del('verification_requests');

        return user;
    }

    async getVerificationForms() {
        const cachedRequests = await this.cacheManager.get<
            VerificationFormData[]
        >('verification_requests');
        if (cachedRequests) {
            return cachedRequests;
        }
        const requests = await this.prismaService.verificationForm.findMany({
            include: {
                User: true,
            },
        });
        await this.cacheManager.set('verification_requests', requests);
        return requests;
    }

    async getVerificationForm(formId: string) {
        return await this.prismaService.verificationForm.findFirst({
            where: {
                id: formId,
            },
        });
    }

    async getUserFriends(userId: string) {
        const user = await this.getUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        const friends = (
            await this.prismaService.user.findUnique({
                where: {
                    id: userId,
                },
                include: {
                    Friends: {
                        include: {
                            Friend: true,
                        },
                    },
                },
            })
        ).Friends;
        return friends.map((friend) => friend.Friend);
    }

    async getFriendsRequests(userId: string) {
        const user = await this.getUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const requests = (
            await this.prismaService.user.findUnique({
                where: {
                    id: userId,
                },
                include: {
                    FriendsRequests: {
                        include: {
                            Friend: true,
                        },
                    },
                },
            })
        ).FriendsRequests;

        return requests.map((request) => request.Friend);
    }

    async sendFriendRequest(userName: string, userId: string) {
        const friend = await this.prismaService.user.findUnique({
            where: {
                username: userName,
            },
        });
        if (!friend) {
            throw new Error('User not found');
        }

        return await this.prismaService.friendsRequests.create({
            data: {
                userId: friend.id,
                friendId: userId,
            },
        });
    }

    async acceptFriendRequest(friendId: string, userId: string) {
        const request = await this.getFriendRequestByUserId(friendId, userId);

        if (!request) {
            throw new Error('Request not found');
        }

        await this.prismaService.friendsRequests.delete({
            where: {
                id: request.id,
            },
        });

        return await this.prismaService.friends.createMany({
            data: [
                {
                    userId: request.userId,
                    friendId: request.friendId,
                },
                {
                    userId: request.friendId,
                    friendId: request.userId,
                },
            ],
        });
    }

    private async getFriendRequestByUserId(userId: string, friendId: string) {
        return await this.prismaService.friendsRequests.findFirst({
            where: {
                OR: [
                    { userId: userId, friendId: friendId },
                    { userId: friendId, friendId: userId },
                ],
            },
        });
    }

    async declineFriendRequest(friendId: string, userId: string) {
        const request = await this.getFriendRequestByUserId(friendId, userId);
        if (!request) {
            throw new Error('Request not found');
        }

        return await this.prismaService.friendsRequests.delete({
            where: {
                id: request.id,
            },
        });
    }

    async removeFriend(userId: string, friendId: string) {
        const friend = await this.prismaService.friends.findFirst({
            where: {
                userId: userId,
                friendId: friendId,
            },
        });
        if (!friend) {
            throw new Error('Friend not found');
        }

        return await this.prismaService.friends.deleteMany({
            where: {
                OR: [
                    { userId: userId, friendId: friendId },
                    { userId: friendId, friendId: userId },
                ],
            },
        });
    }

    async removeFriendRequest(userId: string, friendId: string) {
        const request = await this.prismaService.friendsRequests.findFirst({
            where: {
                userId: userId,
                friendId: friendId,
            },
        });
        if (!request) {
            throw new Error('Request not found');
        }

        return await this.prismaService.friendsRequests.deleteMany({
            where: {
                OR: [
                    { userId: userId, friendId: friendId },
                    { userId: friendId, friendId: userId },
                ],
            },
        });
    }
}
