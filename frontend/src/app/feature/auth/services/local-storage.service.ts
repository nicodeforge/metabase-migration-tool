import { Injectable } from '@angular/core';
import { MetabaseInstanceDto } from '../../metabase-instance/dto/metabase-instance.dto';

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  public setItem(key: string, data: Record<any, any>): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  public getItem(key: string): Record<string, any> | void {
    const item = localStorage.getItem(key);
    if (item) {
      return JSON.parse(item);
    }
    return;
  }

  public updateItem(key: string, data: Record<string, any>): void {
    console.log('LOCAL STORAGE UPDATE', key, data);
    let item = this.getItem(key);

    item = {
      ...item,
      ...data,
    };

    this.setItem(key, item);
  }

  public updateUser(partial: Record<any, any>): void {
    let userData: any = this.getItem('userData');
    userData = {
      ...userData,
      partial,
    };

    this.setItem('userData', userData);
  }

  public updateInstance(
    key: string,
    nestedKey: string,
    partial: Record<any, any>
  ): void {
    let item: any = this.getItem(key);
    let nestedItem: any = item[nestedKey];

    let itemToUpdateIndex = nestedItem.findIndex(
      (e: any) => e.id === partial['id']
    );

    nestedItem[itemToUpdateIndex] = partial;

    item[nestedKey] = nestedItem;

    this.setItem(key, item);
  }

  public addInstance(instance: MetabaseInstanceDto) {
    let userData = this.getItem('userData');
    if (userData) {
      let instances = userData['instances'];
      instances.push(instance);

      userData['instances'] = instances;

      this.updateItem('userData', userData);
    }
  }

  public removeItem(key: string): void {
    localStorage.removeItem(key);
  }
}
