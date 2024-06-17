import {
    Injectable,
    InternalServerErrorException,
    UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/dto/user.entity';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { SingUpUserInput } from './dto/signup-user.input';
import { ProviderInput } from './dto/provider.input';
import { GraphQLError } from 'graphql';

@Injectable()
export class AuthService {
    constructor(
        private Prisma: PrismaService,
        private jwtService: JwtService,
        private UserService: UsersService
    ) {}

    async signup(user: SingUpUserInput) {
        console.log('HERE');
        const password = bcrypt.hashSync(user.password, 10);

        const userExists = await this.Prisma.user.findMany({
            where: {
                OR: [
                    {
                        email: user.email,
                    },
                    {
                        username: user.username,
                    },
                ],
            },
        });

        if (userExists.length > 0) {
            throw new GraphQLError('Account already exists');
        }

        const newUser = await this.Prisma.user.create({
            data: {
                email: user.email,
                password: password,
                username: user.username,
            },
        });
        const username = user.username;
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
                image: newUser.image == null ? '' : newUser.image,
                verified: newUser.verified,
                role: newUser.role,
            },
            access_token: access_token,
        };
    }

    async providerLogin(input: ProviderInput) {
        const accountExists = await this.Prisma.user.findUnique({
            where: {
                email: input.email,
                password: {
                    not: null,
                },
            },
        });
        if (accountExists) {
            throw new GraphQLError('Account already exists');
        }
        const userInDb = await this.Prisma.user.findUnique({
            where: {
                email: input.email,
                password: null,
            },
        });
        if (userInDb) {
            const username = userInDb.username;
            const access_token = await this.jwtService.sign({
                username,
                sub: userInDb.id,
            });
            if (!access_token) {
                throw new InternalServerErrorException();
            }
            return {
                user: {
                    id: userInDb.id,
                    email: userInDb.email,
                    username: userInDb.username,
                    image: userInDb.image == null ? '' : userInDb.image,
                    verified: userInDb.verified,
                    role: userInDb.role,
                },
                access_token: access_token,
            };
        }
        const newUser = await this.Prisma.user.create({
            data: {
                email: input.email,
                username: input.username,
                image: input.image,
            },
        });
        const username = input.username;
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
                image: newUser.image == null ? '' : newUser.image,
                verified: newUser.verified,
                role: newUser.role,
            },
            access_token: access_token,
        };
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
            where: {
                id: user.id,
            },
        });

        return {
            user: {
                id: newUser.id,
                email: newUser.email,
                username: newUser.username,
                image: newUser.image == null ? '' : newUser.image,
                verified: newUser.verified,
                role: newUser.role,
            },
            access_token: access_token,
        };
    }

    async validateUser(username: string, password: string): Promise<User> {
        const user = await this.UserService.getUserByName(username);
        if (user && (await bcrypt.compare(password, user.password))) {
            return user;
        }
        throw new UnauthorizedException();
    }

    async getUserById(id: string): Promise<User> {
        return await this.UserService.getUserById(id);
    }
}
