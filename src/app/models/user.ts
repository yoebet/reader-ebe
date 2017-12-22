import {Model} from './model';

export class User extends Model {
  name: string;
  pass: string;
  role: string;
  status: string;

  static roles = ['', 'Admin', 'Editor'];
}
