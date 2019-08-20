import {environment} from '../environments/environment';

const UIConstants = {
  annotationTagName: 'y-o',
  sentenceTagName: 's-st',
  sentenceIdAttrName: 'sid',
  dropClassPrefix: 'drop-',
  tetherClassPrefix: 'dp-',
  tetherClassPrefixNoHyphen: 'dp',
  highlightClass: 'highlight',
  highlightWordClass: 'highlight-word',
  annoDisabledBodyClass: 'anno-disabled'
};


const DataAttrNames = {
  // mid: 'mid',
  pos: 'pos',
  word: 'word',
  mean: 'mean',
  note: 'note',
  assoc: 'assoc'//关联组
};

const ValuePhras = ['phra1', 'phra2', 'phra3'];
const ValueGroups = ['group1', 'group2', 'group3'];

const DataAttrValues = {
  phraPattern: /^phra\d$/,
  assocPhra1: ValuePhras[0],
  assocGroups: ValuePhras.concat(['trunk', 'antec']).concat(ValueGroups)
};


const SpecialAnnotations = {
  SelectMeaning: {
    dataName: DataAttrNames.mean,
    name: '查词',
    nameEn: 'SelectMeaning'
  },
  EditMeaning: {
    dataName: DataAttrNames.mean,
    name: '释义',
    nameEn: 'EditMeaning'
  },
  AddANote: {
    dataName: DataAttrNames.note,
    name: '加注',
    nameEn: 'AddANote'
  }
};

const DictHistoryCapacity = 20;
const LatestAnnotationsCount = 6;


const ParaSetting = {
  TransIndentStr: '　　',
  EmptyLineSplitter: /(?:[　 	]*\n){2,}/,
  NewLineSplitter: /[　 	]*\n/
};


const staticBase = environment.staticBase;

const ImagesBase = `${staticBase}/images`;
const BookImagesBase = `${ImagesBase}/book`;
const BookImageNotSet = `${BookImagesBase}/missing.png`;
const UserAvatarsBase = `${staticBase}/avatars`;
const AppPackagesBase = `${staticBase}/apks`;
const BookPacksBase = `${staticBase}/book-packs`;
const BookChapsBase = `${staticBase}/book-chaps`;


const StaticResource = {
  BookImagesBase,
  BookImageNotSet,
  UserAvatarsBase,
  AppPackagesBase,
  BookPacksBase,
  BookChapsBase
};

const DefaultHttpHeaders = Object.assign({'X-CL': 'E'}, environment.httpHeaders);
const SelfBase = environment.selfBase;
const WebAppBase = environment.webAppBase;

const WX_CONFIG = {
  appId: 'wx0645bedc5ee3d3de',
  mp_appId: 'wx4a226a806e99f56c'
};

export {
  UIConstants,
  DataAttrNames,
  DataAttrValues,
  SpecialAnnotations,
  DictHistoryCapacity,
  LatestAnnotationsCount,
  ParaSetting,
  StaticResource,
  DefaultHttpHeaders,
  SelfBase,
  WebAppBase,
  WX_CONFIG
};
