import { Resolver, Query, Args, Context, Mutation } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './dto/user.entity';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/auth/get-current-user.decorator';
import { UserEdit } from './dto/edit-user-input';
import {
    VerificationForm,
    VerificationFormData,
    VerifyUser,
} from './verification-form';
import { NullResponse } from './dto/none-reponse';
import { CacheInterceptor, CacheKey } from '@nestjs/cache-manager';
import { CountDto, PaginationDto } from 'src/utils/pagination.dto';

@Resolver((of) => User)
@UseGuards(JwtAuthGuard)

// @UseGuards(JwtAuthGuard)
export class UsersResolver {
    constructor(private UsersService: UsersService) {}

    @Query((returns) => [User])
    @UseInterceptors(CacheInterceptor)
    @CacheKey('all_users')
    users(@CurrentUser() user: User): Promise<User[]> {
        return this.UsersService.findAll();
    }

    @Query((returns) => [User])
    getUsersWithPagination(@Args('pagination') pagination: PaginationDto) {
        return this.UsersService.getUsersWithPagination(pagination);
    }

    @Query((returns) => CountDto)
    countUsersWithPagination(
        @Args('pagination') pagination: PaginationDto
    ): Promise<CountDto> {
        return this.UsersService.getUsersCount(pagination);
    }

    @Query((returns) => [User])
    getUserFriends(@Context() context) {
        return this.UsersService.getUserFriends(context.req.user.id);
    }

    @Query((returns) => [User])
    getUserFriendRequests(@Context() context) {
        return this.UsersService.getFriendsRequests(context.req.user.id);
    }

    @Query((returns) => [User])
    getAllUsers(): Promise<User[]> {
        return this.UsersService.findAll();
    }

    @Mutation((returns) => User)
    async updateUser(@Args('UserEdit') UserEdit: UserEdit): Promise<User> {
        return this.UsersService.updateUser(UserEdit);
    }

    @Query((returns) => User)
    async refreshUserData(@Context() context): Promise<User> {
        return this.UsersService.getUserById(context.req.user.id);
    }

    @Mutation((returns) => User)
    async addVerificationForm(
        @Args('VerificationForm') VerificationForm: VerificationForm,
        @Context() context
    ): Promise<User> {
        return this.UsersService.addVerificationForm(
            VerificationForm.text,
            context.req.user.id
        );
    }

    @Mutation((returns) => User)
    async verifyUser(
        @Args('VerifyUser') VerifyUser: VerifyUser,
        @Context() context
    ): Promise<User> {
        const user = context.req.user;
        if (user.role != 'ADMIN' && user.role != 'MODERATOR') {
            throw new Error('You are not allowed to verify users');
        }
        return this.UsersService.verifyUser(VerifyUser.requestId);
    }

    @Query((returns) => [VerificationFormData])
    @UseInterceptors(CacheInterceptor)
    @CacheKey('verification_requests')
    async getVerifyRequests(
        @Context() context
    ): Promise<VerificationFormData[]> {
        return this.UsersService.getVerificationForms();
    }

    @Mutation((returns) => NullResponse)
    async addFriendRequest(
        @Args('friendName') friendName: string,
        @Context() context
    ) {
        return this.UsersService.sendFriendRequest(
            friendName,
            context.req.user.id
        );
    }

    @Mutation((returns) => NullResponse)
    async acceptFriendRequest(
        @Args('friendId') requestId: string,
        @Context() context
    ) {
        return this.UsersService.acceptFriendRequest(
            requestId,
            context.req.user.id
        );
    }

    @Mutation((returns) => NullResponse)
    async declineFriendRequest(
        @Args('friendId') requestId: string,
        @Context() context
    ) {
        return this.UsersService.declineFriendRequest(
            requestId,
            context.req.user.id
        );
    }

    @Mutation((returns) => NullResponse)
    async removeFriend(@Args('friendId') friendId: string, @Context() context) {
        return this.UsersService.removeFriend(friendId, context.req.user.id);
    }
}
