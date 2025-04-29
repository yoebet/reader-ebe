import {Model} from './model';
import {Para} from './para';
import {WordStat} from './word-stat';

export class Chap extends Model {
  name: string;
  zhName = '';
  bookId: string;
  no: number;
  // originalId: string;

  status = 'E';

  // isFree: boolean;
  // price: number; // cents
  // priceLabel: string;

  contentPack: ChapContentPack;

  paras: Para[];

  paraCommentsCountLoaded = false;

  stat?: WordStat;
}

export class ChapContentPack {
  file: string;
  // jsonFile: string;
  // hash: string;
  size: number;
  builtAt: Date;
}
