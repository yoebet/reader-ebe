import {AnnotationGroup} from '../models/annotation-group';
import {Annotation} from '../models/annotation';
import {DataAttrNames, DataAttrValues, SpecialAnnotations} from '../config';


export class AnnotationSet {

  static selectMeaningAnnotation: Annotation;

  static editMeaningAnnotation: Annotation;

  static addNoteAnnotation: Annotation;

  static emptySet = () => new AnnotationSet([]);

  readonly groups: AnnotationGroup[];

  readonly annotationsMap: Map<string, Annotation> = new Map();

  readonly specialAnnotations: Annotation[];

  static buildSpecialAnnotation(annAttrs) {

    let group = new AnnotationGroup();
    group.dataName = annAttrs.dataName;
    let ann = new Annotation();
    ann.name = annAttrs.name;
    ann.nameEn = annAttrs.nameEn;
    ann.group = group;
    return ann;
  }

  static buildStaticAnnotations() {

    this.selectMeaningAnnotation = this.buildSpecialAnnotation(SpecialAnnotations.SelectMeaning);
    this.editMeaningAnnotation = this.buildSpecialAnnotation(SpecialAnnotations.EditMeaning);
    this.addNoteAnnotation = this.buildSpecialAnnotation(SpecialAnnotations.AddANote);
  }

  constructor(groups: AnnotationGroup[]) {
    this.groups = groups.map(og => {
      let ag = new AnnotationGroup();
      Object.assign(ag, og);
      return ag;
    });


    this.specialAnnotations = [
      AnnotationSet.selectMeaningAnnotation,
      AnnotationSet.editMeaningAnnotation,
      AnnotationSet.addNoteAnnotation];

    for (let group of this.groups) {
      group.annotations = group.annotations.map(oa => {
        let ann = new Annotation();
        Object.assign(ann, oa);
        ann.group = group;
        if (ann.dataName && ann.dataValue) {
          let annKey = `${ann.dataName}.${ann.dataValue}`;
          this.annotationsMap.set(annKey, ann);
        }
        return ann;
      });

    }

    // this.printStyles();
  }


  private printStyles() {

    let styles = [];

    for (let group of this.groups) {
      let {name, nameEn, cssClass, tagName, dataName} = group;
      styles.push(`\n/* *** ${name} ${nameEn} *** */\n`);
      let selector = '';// '.' + cssClass;
      // let before = selector + ':before';
      // let after = selector + ':after';
      if (tagName) {
        tagName = tagName.toLowerCase();
        selector = tagName + ', ' + selector;
        // before = tagName + ':before' + ', ' + before;
        // after = tagName + ':after' + ', ' + after;
      }
      styles.push(`${selector} {\n  border-bottom: 1px dashed grey;\n}\n`);
      // styles.push(`${before} {\n}\n`);
      // styles.push(`${after} {\n}\n`);
      // for (let annotation: Annotation of group.annotations) {
      //   let {name, nameEn, dataValue} = annotation;
      //   styles.push(`/* ${nameEn} ${nameEn} */`);
      // }
    }
    console.log(styles.join('\n'));
  }


  findAnnotation(dataName: string, dataValue: string): Annotation {
    let annKey = `${dataName}.${dataValue}`;
    return this.annotationsMap.get(annKey);
  }

  annotationOutput(dataName: string, dataValue: string) {
    // if (dataName === DataAttrNames.assoc && DataAttrValues.phraPattern.test(dataValue)) {
    //   return '词组';
    // }
    let annKey = `${dataName}.${dataValue}`;
    let ann = this.annotationsMap.get(annKey);
    if (!ann) {
      return null;
    }
    return ann.name;
  }

}

AnnotationSet.buildStaticAnnotations();


export class HighlightGroups {

  /*private static group(attr, values) {
    return values.map(v => `[data-${attr}=${v}]`).join(', ');
  }*/

  private static groupSelectors: string[] = DataAttrValues.assocGroups
    .map(group => `[data-${DataAttrNames.assoc}=${group}]`);

  static HighlightSelectors = HighlightGroups.groupSelectors.join(', ');

  static matchGroup(element): string {
    for (let selector of HighlightGroups.groupSelectors) {
      if (element.matches(selector)) {
        return selector;
      }
    }
    return null;
  }

}
