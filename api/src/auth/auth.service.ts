import { Injectable, UnauthorizedException } from '@nestjs/common';
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
    private tokenExpireTime: number = 30 * 24 * 60 * 60;

    constructor(
        private Prisma: PrismaService,
        private jwtService: JwtService,
        private UserService: UsersService
    ) {}

    async signup(user: SingUpUserInput) {
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
            console.log(await this.Prisma.user.findMany());
            console.log(user)
            console.log(userExists)
            throw new GraphQLError('Account already exists');
        }

        const newUser = await this.Prisma.user.create({
            data: {
                email: user.email,
                password: password,
                username: user.username,
            },
        });
        const { access_token, refresh_token, expires } =
            await this.generateToken({
                username: user.username,
                sub: newUser.id,
            });

        if (!access_token) {
            throw new GraphQLError('Failed to create access token');
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
            refresh_token,
            expires,
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
            const { access_token, refresh_token, expires } =
                await this.generateToken({
                    username: userInDb.username,
                    sub: userInDb.id,
                });

            if (!access_token) {
                throw new GraphQLError('Failed to create access token');
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
                refresh_token,
                expires,
            };
        }
        const newUser = await this.Prisma.user.create({
            data: {
                email: input.email,
                username: input.username,
                image: input.image,
            },
        });
        const { access_token, refresh_token, expires } =
            await this.generateToken({
                username: newUser.username,
                sub: newUser.id,
            });

        if (!access_token) {
            throw new GraphQLError('Failed to create access token');
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
            refresh_token,
            expires,
        };
    }

    async signin(user: User) {
        const newUser = await this.Prisma.user.findUnique({
            where: {
                id: user.id,
            },
        });

        const { access_token, refresh_token, expires } =
            await this.generateToken({
                username: newUser.username,
                sub: newUser.id,
            });

        if (!access_token) {
            throw new GraphQLError('Failed to create access token');
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
            access_token,
            refresh_token,
            expires,
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

    private validateRefreshToken(refreshToken: string) {
        try {
            const decoded = this.jwtService.verify(refreshToken);
            if (decoded.sub) {
                return decoded;
            }

            throw new UnauthorizedException('Invalid refresh token');
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async refreshToken(refreshToken: string) {
        const decoded = this.validateRefreshToken(refreshToken);
        const user = await this.UserService.getUserById(decoded.sub);
        const { access_token, refresh_token, expires } =
            await this.generateToken({
                username: user.username,
                sub: user.id,
            });
        return {
            user: user,
            access_token,
            refresh_token,
            expires,
        };
    }

    async generateToken(userObject: { username: string; sub: string }) {
        const access_token = await this.jwtService.sign(userObject, {
            expiresIn: this.tokenExpireTime,
        });
        const refresh_token = await this.jwtService.sign(userObject, {
            expiresIn: this.tokenExpireTime * 6,
        });
        return {
            access_token,
            refresh_token,
            expires: new Date(Date.now() + this.tokenExpireTime * 1000),
        };
    }
}
