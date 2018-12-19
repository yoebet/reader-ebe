import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'clientInfo'})
export class ClientInfoPipe implements PipeTransform {
  transform(clientObject: any): string {
    if (typeof clientObject !== 'object') {
      return '';
    }
    /*{
      client: 'A',
      appVersion: '1.1',
      osVersion: 26
    }*/
    let {client, osVersion, appVersion} = clientObject;
    return `${client}/${osVersion} ${appVersion}`;
  }
}
