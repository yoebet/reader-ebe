import {Model} from './model';
import {Para} from './para';

export class Chap extends Model {
  name: string;
  zhName = '';
  bookId: string;
  no: number;
  // originalId: string;

  status = 'E';

  isFree: boolean;
  price: number; // cents
  priceLabel: string;

  contentPack: ChapContentPack;

  paras: Para[];

  paraCommentsCountLoaded = false;
}

export class ChapContentPack {
  file: string;
  // jsonFile: string;
  // hash: string;
  size: number;
  builtAt: Date;
}
