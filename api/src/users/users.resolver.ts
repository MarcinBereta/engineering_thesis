import { Resolver, Query, Args } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CurrentUser } from 'src/auth/get-current-user.decorator';

@Resolver((of) => User)
@UseGuards(JwtAuthGuard)
export class UsersResolver {
  constructor(private UsersService: UsersService) {}

  @Query((returns) => [User])
  users(@CurrentUser() user: User): Promise<User[]> {
    console.log(user);
    return this.UsersService.findAll();
  }

  @Query((returns) => User)
  getUser(@Args('name') username: string): Promise<User> {
    return this.UsersService.getUser(username);
  }
}
