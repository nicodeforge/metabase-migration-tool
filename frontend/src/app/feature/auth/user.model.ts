import { MetabaseInstanceDto } from '../metabase-instance/dto/metabase-instance.dto';

export class User {
  constructor(
    public id: string,
    public email: string,
    public name: string,

    public instances: MetabaseInstanceDto[],
    private _accessToken: string,
    private _refreshToken: string
  ) {}

  get accessToken(): string {
    console.log(`USER MODEL.getAccessToken`);
    return this._accessToken;
  }

  set accessToken(token: string) {
    console.log(`USER MODEL.setAccessToken`);
    this._accessToken = token;
  }

  get refreshToken(): string {
    console.log(`USER MODEL.getRefreshToken`);
    return this._refreshToken;
  }

  set refreshToken(token: string) {
    console.log(`USER MODEL.setRefreshToken`);
    this._refreshToken = token;
  }
}
