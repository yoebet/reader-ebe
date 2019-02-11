import {environment} from "../environments/environment";

const UIConstants = {
  annotationTagName: 'y-o',
  sentenceTagName: 's-st',
  dropClassPrefix: 'drop-',
  tetherClassPrefix: 'dp-',
  tetherClassPrefixNoHyphen: 'dp',
  highlightClass: 'highlight',
  highlightWordClass: 'highlight-word'
};


const ImagesBase = `${environment.staticBase}/images`;
const BookImagesBase = `${ImagesBase}/book`;
const BookImageNotSet = `${BookImagesBase}/missing.png`;

export {UIConstants, BookImagesBase, BookImageNotSet};
