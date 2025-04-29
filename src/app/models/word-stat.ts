import { Model } from './model';

export interface WordStat extends Model {
    total: number;
    unique: number;
    // junior1: number;
    // junior2: number;
    cet4: number;
    cet6: number;
    ielts: number;
    gre: number;
    pro: number;
    beyond: number;
    cet4Words: string[];
    cet6Words: string[];
    ieltsWords: string[];
    greWords: string[];
    proWords: string[];
    // beyondWords: string[];
}


export interface ChapWordStat extends WordStat {
    bookId: string;
    chapId: string;
}


export interface BookWordStat extends WordStat {
    bookId: string;
}
