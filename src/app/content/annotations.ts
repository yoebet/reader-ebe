export class Annotations {

  private static compact = [{
    name: '词类',
    nameEn: 'Parts of Speech',
    annotations: [
      //name,displayName,cssClass,tagName
      ['Noun', '名词', 'pn', 'p-n'],
      ['Verb', '动词', 'pv', 'p-v'],
      ['Adjective', '形容词', 'pa', 'p-a'],
      ['Adverb', '副词', 'pd', 'p-d'],
      ['Interjection', '感叹词', 'pi', 'p-i'],
      ['Preposition', '介词', 'pp', 'p-p'],
      ['Conjunction', '连词', 'pc', 'p-c'],
      // ['Pronoun', '代词', 'pr', 'p-r'],
    ]
  }, {
    name: '名词',
    nameEn: 'Noun',
    annotations: [
      ['Individual Nouns', '个体名词', 'ni', 'n-i'],
      ['Collective Nouns', '集体名词', 'nc', 'n-c'],
      ['Material Nouns', '物质名词', 'nm', 'n-m'],
      ['Abstract Nouns', '抽象名词', 'na', 'n-a'],
      ['Countable Nouns', '可数名词', 'nn', 'n-n'],
      ['Uncountable Nouns', '不可数名词', 'nu', 'n-u'],
      ['Singular Form', '单数', 'ns', 'n-s'],
      ['Plural Form', '复数', 'np', 'n-p'],
      ['Gerund', '动名词', 'ng', 'n-g'],
    ]
  }, {
    name: '动词',
    nameEn: 'Verb',
    annotations: [
      ['Transitive Verbs', '及物动词', 'vt', 'v-t'],
      ['Intransitive Verbs', '不及物动词', 'vi', 'v-i'],
      ['Ergative Verbs', '及物/不及物动词', 've', 'v-e'],
      ['Link-verbs', '系动词', 'vl', 'v-l'],
      ['Modal Verbs', '情态动词', 'vm', 'v-m'],
      ['Irregular Verbs', '不规则动词', 'vr', 'v-r'],
      ['Ditransitive Verbs', '双宾动词', 'vd', 'v-d'],
      ['Instantaneous Verbs', '短暂动词', 'vs', 'v-s'],
    ]
  }, {
    name: '成分',
    nameEn: 'Members of the Sentence',
    annotations: [
      ['Subject', '主语', 'ms', 'm-s'],
      ['Predicate', '谓语', 'mp', 'm-p'],
      ['Object', '宾语', 'mo', 'm-o'],
      ['Direct Object', '直接宾语', 'md', 'm-d'],
      ['Indirect Object', '间接宾语', 'mi', 'm-i'],
      ['Predicative', '表语', 'me', 'm-e'],
      ['Attribute', '定语', 'ma', 'm-a'],
      ['Adverbial', '状语', 'mv', 'm-v'],
      ['Appositive', '同位语', 'mt', 'm-t'],
      ['Parenthesis', '插入语', 'mr', 'm-r'],
      ['Participial Phrases', '分词小句', 'mc', 'm-c'],
      // ['Complex Object', '复合宾语', 'mc', 'm-c'],
      // ['Cognate Object', '同源宾语', 'mg', 'm-g'],
    ]
  }, {
    name: '从句',
    nameEn: 'Clauses',
    annotations: [
      ['Subject Clauses', '主语从句', 'cs', 'c-s'],
      ['Object Clauses', '宾语从句', 'co', 'c-o'],
      ['Predicative Clauses', '表语从句', 'cp', 'c-p'],
      ['Attributive Clauses', '定语从句', 'ca', 'c-a'],
      ['Appositive Clauses', '同位语从句', 'ct', 'c-t'],
      ['Adverbial Clauses', '状语从句', 'cd', 'c-d'],
      ['Antecedent', '先行词', 'cc', 'c-c'],
      ['Relative', '引导词', 'cr', 'c-r'],
    ]
  },
    {
      name: '时态',
      nameEn: 'Tense',
      annotations: [
        ['Present Indefinite', '现在时', 'tp', 't-p'],
        ['Present Continuous', '现在进行时', 'tc', 't-c'],
        ['Present Perfect', '现在完成时', 'tr', 't-r'],
        ['Present Perfect Continuous', '现在完成进行时', 'te', 't-e'],
        ['Past Indefinite', '过去时', 'ta', 't-a'],
        ['Past Future', '过去将来时', 'tf', 't-f'],
        ['Past Continuous', '过去进行时', 'ts', 't-s'],
        ['Past Perfect', '过去完成时', 'tt', 't-t'],
        ['Future Indefinite', '将来时', 'tu', 't-u'],
        ['Future Perfect', '将来完成时', 'tz', 't-z'],
      ]
    },
    {
      name: '短语',
      nameEn: 'Phrases',
      annotations: [
        ['Infinitive Phrases', '不定式短语', 'hi', 'h-i'],
        ['Phrasal Verbs', '成语动词', 'hp', 'h-p'],
        ['Prepositional Phrases', '介词短语', 'hr', 'h-r'],
        ['phrases1', '组1', 'hg1', 'h-g1'],
        ['phrases2', '组2', 'hg2', 'h-g2'],
        ['phrases3', '组3', 'hg3', 'h-g3'],
      ]
    }, {
      name: '其他',
      nameEn: 'Word',
      annotations: [
        ['Idiom', '习语', 'wi', 'w-i'],
        ['Slang', '俚语', 'ws', 'w-s'],
        ['Colloquial', '口语', 'wc', 'w-c'],
        ['Euphemism', '委婉语', 'we', 'w-e'],
        ['Figurative', '比喻义', 'wf', 'w-f'],
    //   ]
    // },
    // {
    //   name: '语态语气',
    //   nameEn: 'Voice',
    //   annotations: [
        ['Passive Voice', '被动语态', 'sp', 's-p'],
        ['Imperative Mood', '祈使语气', 'si', 's-i'],
        ['Subjunctive Mood', '虚拟语气', 'ss', 's-s'],
    //   ]
    // },
    // {
    //   name: '其他',
    //   nameEn: 'Misc',
    //   annotations: [
        ['Footnote', '脚注', 'sf', 's-f'],
        ['Careful', '注意', 'sc', 's-c'],
        ['Inversion', '倒装', 'sv', 's-v'],
        ['Ellipsis', '省略', 'se', 's-e'],
      ]
    }
  ];

  // For UI
  // [{
  //   groupName: '句子成分',
  //   annotations: [{
  //     name: 'subj',
  //     displayName: '主语',
  //     cssClass: 'ms',
  //     tagName: 'm-s'
  //   }]
  // }];
  private static _grouped = null;

  // flatten
  private static _forAnnotator = null;

  private static init() {
    let grouped = Annotations._grouped = [];
    let forAnnotator = Annotations._forAnnotator = {};

    let tagToName = {};
    let classToName = {};

    for (let compactGroup of Annotations.compact) {
      let {name, nameEn} = compactGroup;
      let group = {name, nameEn};
      let annotations = group['annotations'] = [];
      for (let annotationProps of compactGroup.annotations) {
        let [name, displayName, cssClass, tagName] = annotationProps;

        if (tagName) {
          tagName = tagName.toUpperCase();
          if (classToName[tagName]) {
            console.log(tagName + ' used.')
          }
          classToName[tagName] = name;
        }

        if (tagToName[cssClass]) {
          console.log(cssClass + ' used.')
        }
        tagToName[cssClass] = name;

        forAnnotator[name] = {cssClass, tagName};
        annotations.push({name, displayName, cssClass, tagName});

      }
      grouped.push(group);
    }

    forAnnotator['$tagToName'] = tagToName;
    forAnnotator['$classToName'] = classToName;

    // Annotations.printStyles();
  }


  private static printStyles() {

    let styles = [];

    for (let compactGroup of Annotations.compact) {
      let {name, nameEn} = compactGroup;
      styles.push(`\n /* *** ${name} ${nameEn} *** */\n`);
      for (let annotationProps of compactGroup.annotations) {
        let [name, displayName, cssClass, tagName] = annotationProps;
        styles.push(`/* ${displayName} ${name} */`);
        let selector = '.' + cssClass;
        let before = selector + ':before';
        let after = selector + ':after';
        if (tagName) {
          selector = tagName + ', ' + selector;
          before = tagName + ':before' + ', ' + before;
          after = tagName + ':after' + ', ' + after;
        }
        styles.push(`${selector} {\n}\n`);
        styles.push(`${before} {\n}\n`);
        styles.push(`${after} {\n}\n`);
      }
    }
    console.log(styles.join('\n'));
  }

  static get grouped() {
    if (Annotations._grouped == null) {
      Annotations.init();
    }
    return Annotations._grouped;
  }

  static get forAnnotator() {
    if (Annotations._forAnnotator == null) {
      Annotations.init();
    }
    return Annotations._forAnnotator;
  }
}
