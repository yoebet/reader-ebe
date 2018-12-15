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

export const IssueStatuses = {
  Todo: 'T',
  Solved: 'S',
  Ignored: 'I'
};

export const IssueStatusNames = {
  T: '未解决',
  S: '已解决',
  I: '忽略'
};
