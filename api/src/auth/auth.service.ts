import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { SigninUserInput } from './dto/signin-user.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private Prisma: PrismaService,
    private jwtService: JwtService,
    private UserService: UsersService,
  ) {}

  async signup(user: SigninUserInput) {
    const password = bcrypt.hashSync(user.password, 10);
    return await this.Prisma.user.create({
      data: {
        email: user.email,
        password: password,
        username: user.username,
      },
    });
  }

  async signin(user: User) {
    const { username } = user;
    const access_token = await this.jwtService.sign({
      username,
      sub: user.id,
    });
    if (!access_token) {
      throw new InternalServerErrorException();
    }
    return {
      access_token,
      username,
    };
  }

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.UserService.getUserByName(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    throw new UnauthorizedException();
  }
}
