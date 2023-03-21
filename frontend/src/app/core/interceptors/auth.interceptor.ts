import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpHeaders,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { RefreshTokenResponse } from '../../feature/auth/services/auth.service';
import {
  BehaviorSubject,
  catchError,
  filter,
  Observable,
  switchMap,
  take,
  throwError,
} from 'rxjs';
import { TokenResponse } from '../../feature/auth/dto/token-response.dto';
import { LocalStorageService } from '../../feature/auth/services/local-storage.service';

const EXCLUDED_URL = ['localhost:4200', '/auth/signin'];
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );
  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService
  ) {}

  public intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    console.log('Interceptor called for request : ', req);

    const isARequestOnExcludedUrl: boolean =
      EXCLUDED_URL.filter((excludedURl) => req.url.includes(excludedURl))
        .length > 0;

    if (isARequestOnExcludedUrl) {
      console.log(`Returning unmodified request`);
      return next.handle(req.clone());
    }
    let authReq = req;
    const userData = this.localStorageService.getItem('userData');
    let accessToken = '';
    if (userData) {
      accessToken = userData['_accessToken'];
    } else {
      return next.handle(req.clone());
    }

    if (authReq.url.includes('/auth/refresh')) {
      console.log('Accessing auth refresh endpoint');
      return next.handle(authReq.clone());
    }
    if (accessToken != null) {
      console.log(`Interceptor adds token ${accessToken}`);
      authReq = this.addTokenHeader(req, accessToken);
    }

    return next.handle(authReq).pipe(
      catchError((error) => {
        if (
          error instanceof HttpErrorResponse &&
          !authReq.url.includes('/auth/signin') &&
          error.status === 401
        ) {
          return this.handle401Error(authReq, next);
        }

        return throwError(error);
      })
    );
  }

  private addTokenHeader(request: HttpRequest<any>, token: string) {
    const userData = this.localStorageService.getItem('userData');
    if (userData) {
      token = userData['_accessToken'];
    }
    const headers = new HttpHeaders().append(
      'Authorization',
      `Bearer ${token}`
    );

    return request.clone({ headers });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.refreshUserToken().pipe(
        switchMap((tokens: TokenResponse) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(tokens.accessToken);
          console.log(`handle401Error - New token : ${tokens.accessToken}`);
          console.log('Interceptor switchMap user ', tokens);
          if (tokens.accessToken && tokens.refreshToken) {
            const updatedTokens = {
              _accessToken: tokens.accessToken,
              _refreshToken: tokens.refreshToken,
            };
            this.localStorageService.updateItem('userData', updatedTokens);
            return next.handle(
              this.addTokenHeader(request, tokens.accessToken)
            );
          } else {
            return throwError('Darn');
          }
        }),
        catchError((err) => {
          this.isRefreshing = false;
          return throwError(err);
        })
      );
    }

    return this.refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => next.handle(this.addTokenHeader(request, token)))
    );
  }

  private refreshUserToken() {
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
  }
}
