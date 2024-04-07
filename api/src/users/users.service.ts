import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserInput } from './create-user-input';
import { UserEdit } from './edit-user-input';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async findAll(): Promise<User[]> {
    return await this.prismaService.user.findMany();
  }

  async create(User: CreateUserInput): Promise<User> {
    return await this.prismaService.user.create({
      data: {
        email: User.email,
        username: User.username,
        password: User.password,
      },
    });
  }

  async getUser(username: string): Promise<User> {
    return await this.prismaService.user.findUnique({
      where: {
        email: username,
      },
    });
  }

  async getUserById(id: string): Promise<User> {
    const user = await await this.prismaService.user.findUnique({
      where: {
        id,
      },
    });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async getUserByName(username: string): Promise<User> {
    return await this.prismaService.user.findUnique({
      where: {
        username: username,
      },
    });
  }

  async updateUser(userData: UserEdit): Promise<User> {
    const user = await this.prismaService.user.update({
      where: {
        id: userData.id,
      },
      data: {
        role: userData.role,
        verified: userData.verified,
      },
    });
    return user;
  }
}
