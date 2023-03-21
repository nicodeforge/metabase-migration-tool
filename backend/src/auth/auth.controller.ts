import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthDto } from './dto/auth.dto';
import { Request } from 'express';
import { AccessTokenGuard } from './guards/access-token.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { TokenResponseDto } from './dto/token-response.dto';
import { UserDto } from '../user/dto/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  public signup(@Body() user: CreateUserDto): Promise<UserDto> {
    return this.authService.signUp(user);
  }

  @Post('signin')
  public signin(@Body() data: AuthDto) {
    return this.authService.signIn(data);
  }

  @UseGuards(AccessTokenGuard)
  @Get('logout')
  public async logout(@Req() req: Request) {
    await this.authService.logout(req.user['id']);
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  public async refreshTokens(@Req() req: Request): Promise<TokenResponseDto> {
    const userId = req.user['sub'];
    const refreshToken = req.user['refreshToken'];

    return await this.authService.refreshTokens(userId, refreshToken);
  }
}
