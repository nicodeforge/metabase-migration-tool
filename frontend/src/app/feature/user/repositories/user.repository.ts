import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { User } from '../../auth/user.model';

@Injectable({ providedIn: 'root' })
export class UserRepository {
  constructor(private http: HttpClient) {}

  public async update(user: User): Promise<any> {
    return await lastValueFrom(
      this.http.put('http://localhost:3100/user', {
        user,
      })
    );
  }
}
