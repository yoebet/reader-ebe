import {Model} from './model';

export class UserMessage extends Model {
  category: string;
  subject: string;
  content: string;
  receiverId: string;
  receiverName: string;
  receiverNickName: string;
  senderId: string;
  senderName: string;
  senderNickName: string;

  readFlag: boolean;
  sendAsRole: string;
  replyTargetId: string;

}


export const MessageCategories = {
  'MessageReply': 'MR',
  'FeedbackReply': 'FR',
  'IssueReply': 'IR',
  'ToOneNotification': 'ON',
  'ToManyNotification': 'MN'
};
