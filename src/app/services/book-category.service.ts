import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {SuiModalService} from 'ng2-semantic-ui';

import {environment} from '../../environments/environment';
import {SorterService} from './sorter.service';
import {BookCategory} from '../models/book-category';

@Injectable()
export class BookCategoryService extends SorterService<BookCategory> {


  constructor(protected http: HttpClient,
              protected modalService: SuiModalService) {
    super(http, modalService);
    let apiBase = environment.apiBase || '';
    this.baseUrl = `${apiBase}/${this.apiA}/book_categories`;
  }


}
