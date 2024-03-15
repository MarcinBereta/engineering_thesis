import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { SingUpUserInput } from './dto/signup-user.input';

@Injectable()
export class AuthService {
  constructor(
    private Prisma: PrismaService,
    private jwtService: JwtService,
    private UserService: UsersService,
  ) {}

  async signup(user: SingUpUserInput) {
    const password = bcrypt.hashSync(user.password, 10);
    const newUser = await this.Prisma.user.create({
      data: {
        email: user.email,
        password: password,
        username: user.username,
      },
    });
    const username = user.username
    const access_token = await this.jwtService.sign({
      username,
      sub: newUser.id,
    });
    if (!access_token) {
      throw new InternalServerErrorException();
    }
    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
      },
      access_token: access_token
    }
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
    const newUser = await this.Prisma.user.findUnique({
      where:{
        id:user.id
      }
    })

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
      },
      access_token: access_token
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
