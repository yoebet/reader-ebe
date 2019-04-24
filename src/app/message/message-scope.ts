import {User} from '../models/user';
import {UserFeedback} from '../models/user-feedback';
import {ParaIssue} from '../models/para-issue';
import {UserMessage} from '../models/user-message';

export class MessageScope {
  sessionId: string = null;
  receiver: User = null;
  replyForType: string = null;
  replyFor: UserMessage | UserFeedback | ParaIssue = null;
  sendAsRole: string;
}
