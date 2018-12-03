import {Model} from './model';

export class ParaIssue extends Model {
  paraId: string;
  sentenceId: string;
  chapId: string;
  bookId: string;
  content: string;

  userId: string;
  userName: string;
  userNickName: string;

  status: string;
  solverId: string;
  replied: boolean;
}
