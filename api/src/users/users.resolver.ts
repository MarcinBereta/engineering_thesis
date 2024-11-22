import { Resolver, Query, Args, Context, Mutation } from '@nestjs/graphql';
import { User } from './dto/user.entity';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { ChangeData, VerificationForm, VerificationFormData, VerifyUser } from './verification-form';
import { NullResponse } from './dto/none-reponse';
import { CacheInterceptor, CacheKey } from '@nestjs/cache-manager';
import { CountDto, PaginationDto } from 'src/utils/pagination.dto';
import { UserEdit } from './dto/edit-user-input';
import { UsersService } from './users.service';

@Resolver(() => User)
@UseGuards(JwtAuthGuard)

// @UseGuards(JwtAuthGuard)
export class UsersResolver {
    constructor(private userService: UsersService) {}

    @Query(() => [User])
    @UseInterceptors(CacheInterceptor)
    @CacheKey('all_users')
    users(): Promise<User[]> {
        return this.userService.findAll();
    }

    @Query(() => [User])
    getUsersWithPagination(@Args('pagination') pagination: PaginationDto) {
        return this.userService.getUsersWithPagination(pagination);
    }

    @Query(() => CountDto)
    countUsersWithPagination(
        @Args('pagination') pagination: PaginationDto
    ): Promise<CountDto> {
        return this.userService.getUsersCount(pagination);
    }

    @Query(() => [User])
    getUserFriends(@Context() context) {
        return this.userService.getUserFriends(context.req.user.id);
    }

    @Query(() => [User])
    getUserFriendRequests(@Context() context) {
        return this.userService.getFriendsRequests(context.req.user.id);
    }

    @Query(() => [User])
    getAllUsers(): Promise<User[]> {
        return this.userService.findAll();
    }

    @Mutation(() => User)
    async updateUser(@Args('UserEdit') UserEditInput: UserEdit): Promise<User> {
        return this.userService.updateUser(UserEditInput);
    }

    @Query(() => User)
    async refreshUserData(@Context() context): Promise<User> {
        return this.userService.getUserById(context.req.user.id);
    }

    @Mutation(() => User)
    async addVerificationForm(
        @Args('VerificationForm') VerificationFormInput: VerificationForm,
        @Context() context
    ): Promise<User> {
        return this.userService.addVerificationForm(
            VerificationFormInput.text,
            context.req.user.id
        );
    }

    @Mutation(() => User)
    async verifyUser(
        @Args('VerifyUser') VerifyUserInput: VerifyUser,
        @Context() context
    ): Promise<User> {
        const user = context.req.user;
        if (user.role != 'ADMIN' && user.role != 'MODERATOR') {
            throw new Error('You are not allowed to verify users');
        }
        return this.userService.verifyUser(VerifyUserInput.requestId);
    }

    @Mutation(() => User)
    async declineUserVerification(
        @Args('VerifyUser') VerifyUserInput: VerifyUser,
        @Context() context
    ): Promise<User> {
        const user = context.req.user;
        if (user.role != 'ADMIN' && user.role != 'MODERATOR') {
            throw new Error('You are not allowed to verify users');
        }
        return this.userService.declineUserVerification(VerifyUserInput.requestId);
    }

    @Query(() => [VerificationFormData])
    @UseInterceptors(CacheInterceptor)
    @CacheKey('verification_requests')
    async getVerifyRequests(): Promise<VerificationFormData[]> {
        console.log(await this.userService.getVerificationForms())
        return this.userService.getVerificationForms();
    }

    @Mutation(() => NullResponse)
    async addFriendRequest(
        @Args('friendName') friendName: string,
        @Context() context
    ) {
        return this.userService.sendFriendRequest(
            friendName,
            context.req.user.id
        );
    }

    @Mutation(() => NullResponse)
    async acceptFriendRequest(
        @Args('friendId') requestId: string,
        @Context() context
    ) {
        return this.userService.acceptFriendRequest(
            requestId,
            context.req.user.id
        );
    }

    @Mutation(() => NullResponse)
    async declineFriendRequest(
        @Args('friendId') requestId: string,
        @Context() context
    ) {
        return this.userService.declineFriendRequest(
            requestId,
            context.req.user.id
        );
    }

    @Mutation(() => NullResponse)
    async removeFriend(@Args('friendId') friendId: string, @Context() context) {
        return this.userService.removeFriend(friendId, context.req.user.id);
    }

    @Mutation(()=>NullResponse)
    async changeData(@Args('changeData') changeData: ChangeData, @Context() context) {
        return this.userService.changeData(changeData, context.req.user.id);
    }
}
