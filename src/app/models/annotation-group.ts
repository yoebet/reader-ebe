import {Model} from './model';
import {Annotation} from './annotation';

export class AnnotationGroup extends Model {
  name: string;
  nameEn: string;
  dataName: string;
  tagName: string;
  cssClass: string;
  // status: string;

  annotations: Annotation[];
}
