import { Provider, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { SigninResponse } from './dto/sigin-response';
import { SigninUserInput } from './dto/signin-user.input';
import { SignupResponse } from './dto/signup-response';
import { GqlAuthGuard } from './guards/auth.guard';
import { SingUpUserInput } from './dto/signup-user.input';
import { ProviderInput } from './dto/provider.input';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => SignupResponse)
  async signup(
    @Args('registerUserInput') registerUserInput: SingUpUserInput,
  ): Promise<SignupResponse> {
    return this.authService.signup(registerUserInput);
  }

  @Mutation(() => SigninResponse)
  async providerLogin(
    @Args('providerUserInput') providerInput: ProviderInput,
  ): Promise<SignupResponse> {
    return this.authService.providerLogin(providerInput);
  }

  @Mutation(() => SigninResponse)
  @UseGuards(GqlAuthGuard)
  async signin(
    @Args('loginUserInput') loginUserInput: SigninUserInput,
    @Context() context,
  ): Promise<SigninResponse> {
    return this.authService.signin(context.user);
  }
}
