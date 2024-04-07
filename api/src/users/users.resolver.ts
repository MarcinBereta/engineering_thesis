import { Resolver, Query, Args, Context, Mutation } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/auth/get-current-user.decorator';
import { UserEdit } from './edit-user-input';

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
}
