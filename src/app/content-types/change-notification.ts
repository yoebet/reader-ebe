import {Para} from "../models/para";

export class ChangeCallback {
  liveContent: () => ContentFields;
  onSaved: () => void;
}

export class ChangeNotification extends ChangeCallback {
  para: Para;
}

export class ContentFields {
  _id?: string;
  content?: string;
  trans?: string;
}
