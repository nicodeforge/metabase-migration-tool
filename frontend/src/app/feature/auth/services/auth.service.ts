import { Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { User } from '../user.model';
import { Router } from '@angular/router';
import { CreateUserDto } from '../dto/create-user.dto';
import { MetabaseInstanceDto } from '../../metabase-instance/dto/metabase-instance.dto';
import { LocalStorageService } from './local-storage.service';
import { UserService } from '../../user/services/user.service';

export interface AuthResponseData {
  id: string;
  email: string;
  name: string;

  instances: MetabaseInstanceDto[];
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private accessToken!: string | null | undefined;
  private refreshToken!: string | null | undefined;

  // @ts-ignore
  //public user = new BehaviorSubject<User>(null);

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly localStorageService: LocalStorageService,
    private userService: UserService
  ) {}

  public getAccessToken(): string | null {
    console.log(`TOken is ${this.accessToken}`);
    if (this.accessToken) {
      return this.accessToken;
    } else {
      return null;
    }
  }

  public setAccessToken(token: string): string {
    return (this.accessToken = token);
  }

  public setRefreshToken(token: string): string {
    return (this.refreshToken = token);
  }

  public getRefreshToken(): string | null {
    if (this.refreshToken) {
      return this.refreshToken;
    } else {
      return null;
    }
  }

  public refreshUserToken() {
    const userData = this.localStorageService.getItem('userData');
    if (userData) {
      const refreshToken: string = userData['_refreshToken'];
      return this.http.get<RefreshTokenResponse>(
        'http://localhost:3100/auth/refresh',
        {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        }
      );
    } else {
      return throwError('No user found');
    }
    /*.pipe(
        tap((refreshResponse) => {
          this.accessToken = refreshResponse.accessToken;
          this.refreshToken = refreshResponse.accessToken;
          console.log('After refreshing : ');
          console.log(this.accessToken);
          console.log(this.refreshToken);
        })
      );*/
  }

  public signIn(email: string, password: string): Observable<AuthResponseData> {
    console.log(
      `Will send post request with email ${email} and pass : ${password}`
    );
    return this.http
      .post<AuthResponseData>(
        `http://localhost:3100/auth/signin`,
        {
          email: email,
          password: password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      .pipe(
        catchError(this.handleError),
        tap(async (resData: AuthResponseData) => {
          await this.handleAuth(
            resData.id,
            resData.email,
            resData.name,
            resData.instances,
            resData.accessToken,
            resData.refreshToken
          );
        })
      );
  }

  /*public autoLogin(): void {
    console.log(`Auto login started`);
    //const localUser = localStorage.getItem('userData');
    const localUser = this.localStorageService.getItem('userData');
    let userData!: {
      id: string;
      email: string;
      name: string;
      instances: MetabaseInstanceDto[];
      _accessToken: string;
      _refreshToken: string;
    };

    if (!localUser) {
      return;
    }

    const loadedUser = new User(
      localUser['id'],
      localUser['email'],
      localUser['name'],
      localUser['instances'],
      localUser['_accessToken'],
      localUser['_refreshToken']
    );

    if (loadedUser.accessToken && loadedUser.refreshToken) {
      console.log(`Auto login success`);
      this.userService.user.next(loadedUser);
      this.router.navigateByUrl('app');
    }
  }*/

  public signUp(userToCreate: CreateUserDto): Observable<AuthResponseData> {
    return this.http
      .post<AuthResponseData>(
        'http://localhost:3100/auth/signup',
        userToCreate,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      .pipe(
        catchError(this.handleError),
        tap(async (resData: AuthResponseData) => {
          await this.handleAuth(
            resData.id,
            resData.email,
            resData.name,
            resData.instances,
            resData.accessToken,
            resData.refreshToken
          );
        })
      );
  }

  public async logout(): Promise<void> {
    this.http.get('http://localhost:3100/auth/logout').subscribe();
    // @ts-ignore
    this.userService.user.next(null);

    // this.localStorageService.removeItem('userData');
    await this.router.navigateByUrl('/');
  }

  private async handleAuth(
    userId: string,
    email: string,
    name: string,
    instances: MetabaseInstanceDto[],
    accessToken: string,
    refreshToken: string
  ): Promise<void> {
    //this.accessToken = accessToken;
    //this.refreshToken = refreshToken;
    /*const user: User = await lastValueFrom(
      this.http.get<User>(`http://localhost:3100/profile`)
    );*/

    const user = new User(
      userId,
      email,
      name,
      instances,
      accessToken,
      refreshToken
    );

    console.log(user);

    //this.localStorageService.setItem('userData', user);

    this.userService.user.next(user);
  }

  private handleError(errorResponse: HttpErrorResponse): Observable<never> {
    console.log('handleError called', errorResponse);
    if (!errorResponse || typeof errorResponse === 'undefined') {
      console.log('Error response is falsy');
    } else {
      console.log('Error reposne is truthy');
      console.log(errorResponse.error);
    }
    const errorMessage = 'An error occured';
    if (!errorResponse.error || !errorResponse.error.error) {
      return throwError(() => {
        new Error(errorMessage);
      });
    } else {
      return throwError(() => {
        new Error(errorResponse.error.error.message);
      });
    }
  }
}
