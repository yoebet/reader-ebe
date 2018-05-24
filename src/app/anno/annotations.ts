import {AnnotationGroup} from './annotation-group';
import {Annotation} from './annotation';


export class Annotations {

  private static compact = [{
    name: '词类',
    nameEn: 'Parts of Speech',
    tagName: null,
    cssClass: 'pos',
    dataName: 'pos',
    annotations: [
      //nameEn,name,dataValue
      ['Noun', '名词', 'pn'],
      ['Verb', '动词', 'pv'],
      ['Adjective', '形容词', 'pa'],
      ['Adverb', '副词', 'pd'],
      ['Interjection', '感叹词', 'pi'],
      ['Preposition', '介词', 'pp'],
      // ['Pronoun', '代词', 'pr'],
      ['Conjunction', '连词', 'pc']
    ]
  }, {
    name: '名词',
    nameEn: 'Noun',
    tagName: null,
    cssClass: 'noun',
    dataName: 'noun',
    annotations: [
      // ['Individual Nouns', '个体名词', 'ni'],
      ['Collective Nouns', '集体名词', 'nc'],
      ['Material Nouns', '物质名词', 'nm'],
      ['Abstract Nouns', '抽象名词', 'na'],
      ['Countable Nouns', '可数', 'nn'],
      ['Uncountable Nouns', '不可数', 'nu'],
      ['Singular Form', '单数', 'ns'],
      ['Plural Form', '复数', 'np'],
      ['Gerund', '动名词', 'ng']
    ]
  }, {
    name: '动词',
    nameEn: 'Verb',
    tagName: null,
    cssClass: 'verb',
    dataName: 'verb',
    annotations: [
      ['Transitive Verbs', '及物', 'vt'],
      ['Intransitive Verbs', '不及物', 'vi'],
      ['Ergative Verbs', '及物/不及物', 've'],
      ['Link-verbs', '系动词', 'vl'],
      ['Modal Verbs', '情态动词', 'vm'],
      ['Irregular Verbs', '不规则', 'vr'],
      ['Ditransitive Verbs', '双宾动词', 'vd'],
      ['Instantaneous Verbs', '短暂动词', 'vs']
    ]
  }, {
    name: '成分',
    nameEn: 'Members of the Sentence',
    tagName: null,
    cssClass: 'memb',
    dataName: 'memb',
    annotations: [
      ['Subject', '主语', 'ms'],
      ['Predicate', '谓语', 'mp'],
      ['Object', '宾语', 'mo'],
      ['Direct Object', '直接宾语', 'md'],
      ['Indirect Object', '间接宾语', 'mi'],
      ['Predicative', '表语', 'me'],
      ['Attribute', '定语', 'ma'],
      ['Adverbial', '状语', 'mv'],
      ['Appositive', '同位语', 'mt'],
      ['Parenthesis', '插入语', 'mr'],
      ['Participial Phrases', '分词小句', 'mc']
    ]
  }, {
    name: '从句',
    nameEn: 'Clauses',
    tagName: null,
    cssClass: 'clau',
    dataName: 'clau',
    annotations: [
      ['Subject Clauses', '主语从句', 'cs'],
      ['Object Clauses', '宾语从句', 'co'],
      ['Predicative Clauses', '表语从句', 'cp'],
      ['Attributive Clauses', '定语从句', 'ca'],
      ['Appositive Clauses', '同位语从句', 'ct'],
      ['Adverbial Clauses', '状语从句', 'cd'],
      ['Antecedent', '先行词', 'cc'],
      ['Relative', '引导词', 'cr']
    ]
  },
    {
      name: '时态',
      nameEn: 'Tense',
      tagName: null,
      cssClass: 'tens',
      dataName: 'tens',
      annotations: [
        ['Present Indefinite', '现在时', 'tp'],
        ['Present Continuous', '现在进行时', 'tc'],
        ['Present Perfect', '现在完成时', 'tr'],
        ['Present Perfect Continuous', '现在完成进行时', 'te'],
        ['Past Indefinite', '过去时', 'ta'],
        ['Past Future', '过去将来时', 'tf'],
        ['Past Continuous', '过去进行时', 'ts'],
        ['Past Perfect', '过去完成时', 'tt'],
        ['Future Indefinite', '将来时', 'tu'],
        ['Future Perfect', '将来完成时', 'tz']
      ]
    },
    {
      name: '短语',
      nameEn: 'Phrases',
      tagName: null,
      cssClass: 'phra',
      dataName: 'phra',
      annotations: [
        ['Infinitive Phrases', '不定式短语', 'hi'],
        ['Phrasal Verbs', '成语动词', 'hp'],
        ['Prepositional Phrases', '介词短语', 'hr'],
        ['phrases1', '词组1', 'g1'],
        ['phrases2', '词组2', 'g2'],
        ['phrases3', '词组3', 'g3']
      ]
    }, {
      name: '其他',
      nameEn: 'Misc',
      tagName: null,
      cssClass: 'misc',
      dataName: 'misc',
      annotations: [
        ['Idiom', '习语', 'wi'],
        ['Slang', '俚语', 'ws'],
        ['Colloquial', '口语', 'wc'],
        ['Euphemism', '委婉语', 'we'],
        ['Figurative', '比喻义', 'wf'],
        ['Passive Voice', '被动语态', 'sp'],
        ['Imperative Mood', '祈使语气', 'si'],
        ['Subjunctive Mood', '虚拟语气', 'ss'],
        ['Footnote', '脚注', 'sf'],
        ['Careful', '注意', 'sc'],
        ['Inversion', '倒装', 'sv'],
        ['Ellipsis', '省略', 'se']
      ]
    }
  ];

  private static _annotationGroups: AnnotationGroup[] = null;

  private static _annotationsMap: Map<string, Annotation> = null;

  private static _specialAnnotations: Annotation[] = null;

  static init() {
    let groups: AnnotationGroup[] = Annotations._annotationGroups = [];
    let annMap = Annotations._annotationsMap = new Map();

    for (let compactGroup of Annotations.compact) {
      let group = new AnnotationGroup();
      group.name = compactGroup.name;
      group.nameEn = compactGroup.nameEn;
      let {tagName, cssClass, dataName} = compactGroup;
      if (tagName) {
        tagName = tagName.toUpperCase();
      }
      group.tagName = tagName;
      group.cssClass = cssClass;
      group.dataName = dataName;
      groups.push(group);

      let annotations: Annotation[] = group.annotations = [];
      for (let annotationProps of compactGroup.annotations) {
        let [nameEn, name, dataValue] = annotationProps;
        let ann = new Annotation();
        ann.group = group;
        ann.name = name;
        ann.nameEn = nameEn;
        ann.dataValue = dataValue;
        annotations.push(ann);
        if (dataName && dataValue) {
          let annKey = `${dataName}.${dataValue}`;
          annMap.set(annKey, ann);
        }
      }
    }

    this._specialAnnotations = [];

    let groupSwm = new AnnotationGroup();
    groupSwm.dataName = 'mid';
    let swm = new Annotation();
    swm.name = '选词义';
    swm.nameEn = 'SelectWordMeaning';
    swm.group = groupSwm;

    let groupAan = new AnnotationGroup();
    groupAan.dataName = 'note';
    let aan = new Annotation();
    aan.name = '加注解';
    aan.nameEn = 'AddANote';
    aan.group = groupAan;

    this._specialAnnotations.push(swm);
    this._specialAnnotations.push(aan);

    // Annotations.printStyles();
  }


  private static printStyles() {

    let styles = [];

    for (let group of Annotations.annotationGroups) {
      let {name, nameEn, cssClass, tagName, dataName} = group;
      styles.push(`\n/* *** ${name} ${nameEn} *** */\n`);
      let selector = '.' + cssClass;
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

  static get annotationGroups(): AnnotationGroup[] {
    return Annotations._annotationGroups;
  }

  static get specialAnnotations(): Annotation[] {
    return Annotations._specialAnnotations;
  }

  static get annotationsMap(): Map<string, Annotation> {
    return Annotations._annotationsMap;
  }

  static findAnnotation(dataName: string, dataValue: string): Annotation {
    let annKey = `${dataName}.${dataValue}`;
    return Annotations._annotationsMap.get(annKey);
  }

  static annotationOutput(dataName: string, dataValue: string) {
    if (dataName === 'phra' && /^g\d$/.test(dataValue)) {
      return '词组';
    }
    // if (dataName === 'clau') {
    //   if (dataValue === 'cc' || dataValue === 'cr') {
    //     return null;
    //   }
    // }
    let annKey = `${dataName}.${dataValue}`;
    let ann = Annotations._annotationsMap.get(annKey);
    if (!ann) {
      return null;
    }
    return ann.name;
  }
}

Annotations.init();


export class HighlightGroups {

  private static group(attr, values) {
    return values.map(v => `[data-${attr}=${v}]`).join(', ');
  }

  static groupSelectors: string[] = [
    '[data-phra=g1]',
    '[data-phra=g2]',
    '[data-phra=g3]',
    HighlightGroups.group('clau', ['cc', 'cr']),
    HighlightGroups.group('memb', ['ms', 'mp', 'mo'])
  ];

  static highlightAnnotationSelectors = HighlightGroups.groupSelectors.join(', ');

  static matchGroup(element): string {
    for (let selector of HighlightGroups.groupSelectors) {
      if (element.matches(selector)) {
        return selector;
      }
    }
    return null;
  }

}
