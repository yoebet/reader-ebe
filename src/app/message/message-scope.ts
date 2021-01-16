import {User} from '../models/user';
import {UserFeedback} from '../models/user-feedback';
import {ParaIssue} from '../models/para-issue';
import {UserMessage} from '../models/user-message';

export class MessageScope {
  receiver: User = null;
  replyForType: 'UserMessage' | 'UserFeedback' | 'ParaIssue' | null;
  replyFor: UserMessage | UserFeedback | ParaIssue = null;

  sessionId?: string = null;
  sendAsRole?: string;
}
