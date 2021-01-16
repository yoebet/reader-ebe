import {Model} from './model';

export class UserMessage extends Model {
  category: string;
  // subject: string;
  content: string;
  receiverId: string;
  receiverName: string;
  receiverNickName: string;
  senderId: string;
  senderName: string;
  senderNickName: string;

  readFlag: boolean;
  sessionId: string;
  sendAsRole: string;
  replyTargetId: string;
  replied: boolean;
}

export const SenderRoles = {'System': 'S', 'Admin': 'A', 'Editor': 'E'};

export const MessageCategories = {
  'MessageReply': 'MR',
  'FeedbackReply': 'FR',
  'IssueReply': 'IR',
  'ToOneNotification': 'ON',
  'ToManyNotification': 'MN'
};
