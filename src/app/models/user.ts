import {Model} from './model';

export class User extends Model {
  name: string;
  nickName: string;
  pass: string;
  role: string;
  status: string;

  lastLogin?: any; // {time}
  tokenObj?: any; // {token, ttl}
  avatarSetting?: any; // {type: 'img/char', imgUrl: 'xxx', ...}

  static Roles = ['', 'A', 'E', 'P'];
}

export class UserIdName {
  _id: string;
  name: string;
  nickName: string;
}
