import {AnnotationGroup} from './annotation-group';

export class Annotation {
  group: AnnotationGroup;
  name: string;
  nameEn: string;
  dataValue: string;

  get cssClass() {
    return this.group.cssClass;
  }

  get tagName() {
    return this.group.tagName;
  }

  get dataName() {
    return this.group.dataName;
  }
}
