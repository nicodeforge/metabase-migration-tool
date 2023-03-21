import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilsService {
  public isObjectInArray(object: any, array: Array<any>): boolean {
    const objectString = JSON.stringify(object);
    const result = [];
    array.forEach((obj) => result.push(JSON.stringify(obj) === objectString));
    return result.includes(true);
  }

  public sortArrayByObjectId(input: Array<any>): any {
    return input.sort((a, b) => a.id - b.id);
  }
}
