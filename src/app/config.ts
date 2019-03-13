import {environment} from "../environments/environment";

const UIConstants = {
  annotationTagName: 'y-o',
  sentenceTagName: 's-st',
  sentenceIdAttrName: 'sid',
  dropClassPrefix: 'drop-',
  tetherClassPrefix: 'dp-',
  tetherClassPrefixNoHyphen: 'dp',
  highlightClass: 'highlight',
  highlightWordClass: 'highlight-word'
};


const DataAttrNames = {
  mid: 'mid',
  word: 'word',
  mean: 'mean',
  note: 'note',
  assoc: 'assoc'//关联组
};

const DataAttrValues = {
  phraPattern: /^phra\d$/,
  assocGroups: ['phra1', 'phra2', 'phra3', 'trunk', 'antec', 'group1', 'group2', 'group3']
};


const SpecialAnnotations = {
  SelectMeaning: {
    name: '选词义',
    nameEn: 'SelectMeaning'
  },
  AddANote: {
    name: '加注解',
    nameEn: 'AddANote'
  }
};


const ImagesBase = `${environment.staticBase}/images`;
const BookImagesBase = `${ImagesBase}/book`;
const BookImageNotSet = `${BookImagesBase}/missing.png`;

export {
  UIConstants,
  DataAttrNames,
  DataAttrValues,
  SpecialAnnotations,
  BookImagesBase,
  BookImageNotSet
};
