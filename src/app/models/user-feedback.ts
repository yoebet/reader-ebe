import {Model} from './model';

export class UserFeedback extends Model {
  subject: string;
  content: string;
  userId: string;
  userName: string;
  userNickName: string;

  /*{
    client: 'A',
    appVersion: '1.1',
    osVersion: 26
  }*/
  client: any;
  replied: boolean;

}
