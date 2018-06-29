import {Model} from './model';
import {AnnotationGroup} from "./annotation-group";

export class AnnotationFamily extends Model {
  name: string;
  // isDefault: boolean;
  // status: string;

  groups: AnnotationGroup[];
}
