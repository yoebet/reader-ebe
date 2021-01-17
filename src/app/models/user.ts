import {Model} from './model';

export class User extends Model {

  static Roles = ['', 'A', 'E', 'P'];

  name: string;
  nickName: string;
  pass: string;
  role: string;
  status: string;
  memo: string;

  gender: string;
  selfIntro?: string;
  phoneNumber?: string;

  province?: string;
  city?: string;
  wxUnionid?: string;

  rc: string;
  frc?: string;

  lastLogin?: any; // {time, client, appVersion?, osVersion?}
  lastLoginApp?: any;
  tokenObj?: any; // {token, ttl}
  avatarSetting?: any; // {type: 'img/char', imgUrl: 'xxx', ...}

  resourceCounts?: any; // {"order":0,"userWord":63,"comment":2,"note":2,"recUser":1,"editedBook":0}

  preference?: any;
}

export class UserIdName {
  _id: string;
  name: string;
  nickName: string;
}
