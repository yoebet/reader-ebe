export class Annotations {

  private static _grouped = [
    {
      groupName: 'zz',
      tip: '',
      annotations: [
        {
          name: 'zzz',
          displayName: 'zz',
          tip: '',
          cssClass: 'sp-sub',
          tagName: 'sp-sub'
        },
        {
          name: 'ffz',
          cssClass: 'sp-obj',
          tagName: 'sp-obj'
        }
      ]
    },
    {
      groupName: 'ff',
      annotations: [
        {
          name: 'zz2',
          displayName: 'zz',
          tip: '',
          cssClass: 'sp-sub',
          tagName: 'sp-sub'
        },
        {
          name: 'ff2',
          cssClass: 'sp-obj',
          tagName: 'sp-obj'
        }
      ]
    }
  ];

  private static _forAnnotator = null;

  static get grouped() {
    return Annotations._grouped;
  }

  static get forAnnotator() {
    if (Annotations._forAnnotator == null) {
      Annotations._forAnnotator = {};
      for (let group of Annotations._grouped) {
        for (let an of group.annotations) {
          Annotations._forAnnotator[an.name] = {
            cssClass: an.cssClass,
            tagName: an.tagName
          };
        }
      }
    }
    return Annotations._forAnnotator;
  }
}
