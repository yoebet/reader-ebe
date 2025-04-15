import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {Observable} from 'rxjs/';
import {tap} from 'rxjs/operators';

import {SuiModalService} from 'ng2-semantic-ui';

import {environment} from '../../environments/environment';
import {DictHistoryCapacity} from '../config';
import {DictEntry, DictFields} from '../models/dict-entry';
import {BaseService} from './base.service';
import {SessionService} from './session.service';

@Injectable()
export class DictService extends BaseService<DictEntry> {

  private _entryHistory: DictEntry[] = [];

  readonly pronsBase: string;

  constructor(protected http: HttpClient,
              protected modalService: SuiModalService,
              protected sessionService: SessionService) {
    super(http, modalService, sessionService);
    let apiBase = environment.apiBase || '';
    this.baseUrl = `${apiBase}/${this.apiA}/dict`;
    // this.pronsBase = `${environment.staticBase}/pron`;
    this.pronsBase = `${apiBase}/${this.apiB}/dict/pron`;
  }

  get entryHistory(): DictEntry[] {
    return this._entryHistory;
  }

  clearHistory() {
    this._entryHistory = [];
  }

  private pushHistory(entry) {
    let eh = this._entryHistory;
    let inHistory = eh.find(e => e.word === entry.word);
    if (!inHistory) {
      eh.push(entry);
    }
    if (eh.length > DictHistoryCapacity) {
      eh.shift();
    }
  }

  search(key: string, options: any = {}): Observable<DictEntry[]> {
    let {limit, previous, next, fields, simpleEdited} = options;
    if (next === true) {
      key = key + '_';
    } else if (previous === true) {
      key = '_' + key;
    }
    if (!limit) {
      limit = 8;
    }
    let url = `${this.baseUrl}/search/${key}?limit=${limit}`;

    let switches = ['phrase', 'phraseOnly', 'basic', 'cet', 'ielts', 'gre']
      .filter(name => options[name]);
    if (switches.length > 0) {
      url += '&';
      url += switches.join('&');
    }
    if (fields) {
      url += '&fields=' + fields;
    }
    if (simpleEdited) {
      url += '&simpleEdited=' + simpleEdited;
    }
    if (options.noref) {
      url += '&noref';
    }

    let obs = this.list(url);
    if (fields !== DictFields.COMPLETE && fields !== DictFields.SIMPLE) {
      return obs;
    }

    return obs.pipe(tap(entries => {
      for (let entry of entries) {
        if (!options.noref) {
          this.pushHistory(entry);
        }
      }
    }));
  }

  getEntry(idOrWord: string, options: any = {}): Observable<DictEntry> {
    let url = `${this.baseUrl}/${idOrWord}`;
    let addedParam = false;
    if (!DictEntry.isId(idOrWord)) {
      let switches = ['lotf', 'base', 'stem'].filter(name => options[name]);
      if (switches.length > 0) {
        url += '?';
        url += switches.join('&');
        addedParam = true;
      }
    }
    if (options.noref) {
      url += addedParam ? '&' : '?';
      url += 'noref';
      addedParam = true;
    }
    if (options.fields) {
      url += addedParam ? '&' : '?';
      url += 'fields=' + options.fields;
    }

    return this.getOneByUrl(url)
      .pipe(
        tap(entry => {
          if (entry && !options.noref) {
            this.pushHistory(entry);
          }
        }));
  }

}
