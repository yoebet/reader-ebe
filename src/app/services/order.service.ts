import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

import {Observable} from "rxjs/index";

import {SuiModalService} from 'ng2-semantic-ui';

import {Order} from '../models/order';

import {BaseService} from './base.service';

@Injectable()
export class OrderService extends BaseService<Order> {

  constructor(protected http: HttpClient,
              protected modalService: SuiModalService) {
    super(http, modalService);
    let apiBase = environment.apiBase || '';
    this.baseUrl = `${apiBase}/${this.apiA}/orders`;
  }


  list(options): Observable<Order[]> {
    let {from, limit, searchOrderNo} = options;
    let url = `${this.baseUrl}?limit=${limit || 20}`;
    if (from) {
      url += `&from=${from}`;
    }
    if (searchOrderNo) {
      url += `&orderNo=${searchOrderNo}`;
    }
    return super.list(url) as Observable<Order[]>;
  }
}
