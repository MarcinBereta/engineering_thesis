import { Resolver, Query, Args, Context, Mutation } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/auth/get-current-user.decorator';
import { UserEdit } from './edit-user-input';
import {
  VerificationForm,
  VerificationFormData,
  VerifyUser,
} from './verification-form';

@Resolver((of) => User)
@UseGuards(JwtAuthGuard)

// @UseGuards(JwtAuthGuard)
export class UsersResolver {
  constructor(private UsersService: UsersService) {}

  @Query((returns) => [User])
  users(@CurrentUser() user: User): Promise<User[]> {
    return this.UsersService.findAll();
  }

  @Query((returns) => User)
  getUser(@Args('name') username: string): Promise<User> {
    return this.UsersService.getUser(username);
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
    @Context() context,
  ): Promise<User> {
    return this.UsersService.addVerificationForm(
      VerificationForm.text,
      context.req.user.id,
    );
  }

  @Mutation((returns) => User)
  async verifyUser(
    @Args('VerifyUser') VerifyUser: VerifyUser,
    @Context() context,
  ): Promise<User> {
    const user = context.req.user;
    if (user.role != 'ADMIN' && user.role != 'MODERATOR') {
      throw new Error('You are not allowed to verify users');
    }
    return this.UsersService.verifyUser(VerifyUser.requestId);
  }

  @Query((returns) => [VerificationFormData])
  async getVerifyRequests(@Context() context): Promise<VerificationFormData[]> {
    return this.UsersService.getVerificationForms();
  }
}
