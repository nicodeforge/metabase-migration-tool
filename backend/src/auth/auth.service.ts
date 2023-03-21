import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthDto } from './dto/auth.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserDto } from '../user/dto/user.dto';
import { TokenResponseDto } from './dto/token-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,

    private configService: ConfigService,
  ) {}

  public async signIn(data: AuthDto): Promise<UserDto> {
    const user = await this.userService.findOne(data.username, true);
    if (!user) {
      throw new BadRequestException('This user does not exist');
    }

    const passwordMatches = await argon2.verify(user.password, data.password);

    if (!passwordMatches)
      throw new BadRequestException('Password or email incorrect');

    const tokens = await this.getTokens(user.id, user.email);
    console.log('NEW TOKENS GENERATED');
    console.log('Access : ', tokens.accessToken);
    console.log('Refresh : ', tokens.refreshToken);

    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      instances: user.instances,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  public async signUp(user: CreateUserDto): Promise<UserDto> {
    const userExists = await this.userService.findOne(user.email, false);

    if (userExists) {
      throw new BadRequestException('User already exists');
    }

    const hash = await this.hashString(user.password);
    let newUser = await this.userService.create({
      ...user,
      password: hash,
    });

    const tokens = await this.getTokens(newUser.id, newUser.email);

    await this.updateRefreshToken(newUser.id, tokens.refreshToken);

    newUser = await this.userService.findOne(user.email);

    return {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      instances: [],
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  private async getTokens(
    userId: string,
    username: string,
  ): Promise<TokenResponseDto> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          secret: this.configService.get<string>('jwt.access_secret'),
          expiresIn: '5m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          secret: this.configService.get<string>('jwt.refresh_secret'),
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  public async refreshTokens(
    userId: string,
    refreshToken: string,
  ): Promise<TokenResponseDto> {
    const user = await this.userService.findOneById(userId);

    console.log(`refreshTokens params : ${userId}, ${refreshToken}`);

    if (!user || !user.refreshToken)
      throw new ForbiddenException('Access Denied');

    const refreshTokensMatch = await this.stringMatchesHash(
      refreshToken,
      user.refreshToken,
    );

    if (!refreshTokensMatch) {
      console.log('Refresh tokens DO NOT MATCH');
      throw new ForbiddenException('Access Denied');
    }

    const tokens = await this.getTokens(user.id, user.email);

    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  public async stringMatchesHash(
    plainInput: string,
    hashedInput: string,
  ): Promise<boolean> {
    return await argon2.verify(hashedInput, plainInput);
  }
  public async logout(userId: string) {
    console.log('LOGGED OUT', userId);
    return this.userService.update(userId, { refreshToken: null });
  }

  public async hashString(data: string): Promise<string> {
    return await argon2.hash(data);
  }

  private async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hashedRefreshToken = await this.hashString(refreshToken);
    console.log('Update refresh token');
    console.log('Plain token : ', refreshToken);
    console.log(`Hash : ${hashedRefreshToken}`);
    const update = await this.userService.update(userId, {
      refreshToken: hashedRefreshToken,
    });

    console.log('Update result', update);
  }
}
