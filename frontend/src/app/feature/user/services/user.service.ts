import { Injectable } from '@angular/core';
import { LocalStorageService } from '../../auth/services/local-storage.service';
import { User } from '../../auth/user.model';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UpdateResponseType } from '../../../shared/models/update-response.type';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  // @ts-ignore
  public user: BehaviorSubject<User> = new BehaviorSubject<User>(null);

  constructor(
    private localStorage: LocalStorageService,
    private router: Router,
    private http: HttpClient //private userRepository: UserRepository
  ) {
    this.autoLogin();

    this.sub();
  }

  private autoLogin(): void {
    console.log(`Auto login started`);
    const localUser = this.localStorage.getItem('userData');

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
      this.user.next(loadedUser);
      this.router.navigateByUrl('app');
    }
  }

  private sub(): void {
    this.user.subscribe((user) => {
      console.log('user changed', user);
      if (user != null) {
        this.updateLocally(user);
      }
    });
  }

  private updateLocally(user: User): void {
    //this.userRepository.update(user);
    this.localStorage.updateItem('userData', user);
  }

  public updateRemotelly(user: User): void {
    const payload: Record<any, any> = {
      id: user.id,
      name: user.name,
      email: user.email,
    };
    console.log('UPDATE USER', user);
    this.http
      .put<UpdateResponseType>('http://localhost:3100/user', payload)
      .subscribe((response: UpdateResponseType) => {
        if (response.affected > 0) {
          console.log('Update response', response);
          this.user.next(user);
        }
      });
  }
}
