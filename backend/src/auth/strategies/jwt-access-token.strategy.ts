import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';
import { UserEntity } from '../../user/user.entity';
import { JwtPayload } from '../jwt-payload.type';

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.access_secret'),
    });
  }

  public async validate(payload: JwtPayload) {
    const user: UserEntity = await this.userService.findOne(
      payload.email,
      true,
    );
    return {
      id: payload.sub,
      email: payload.email,
      name: user?.name,
      instances: user.instances,
    };
  }
}
