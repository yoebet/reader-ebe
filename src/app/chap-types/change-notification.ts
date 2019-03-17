import {Para} from "../models/para";

export class ChangeCallback {
  liveContent: ParaLiveContent;
  onSaved: OnSaved;
}

export class ChangeNotification extends ChangeCallback {
  para: Para;
}

export class ContentFields {
  _id?: string;
  content?: string;
  trans?: string;
}

export interface ParaLiveContent {
  (): ContentFields;
}

export interface OnSaved {
  (): void;
}
