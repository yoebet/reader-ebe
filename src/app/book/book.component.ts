import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {Location} from '@angular/common';
import 'rxjs/add/operator/switchMap';

import {Book} from '../models/book';
import {BookService} from '../services/book.service';
import {OpResult} from '../models/op-result';

@Component({
  selector: 'book-detail',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.css']
})
export class BookComponent implements OnInit {
  book: Book;
  editing = false;
  chapsTuneOrder = false;
  chapOperations = false;

  constructor(private bookService: BookService,
              private route: ActivatedRoute,
              private location: Location) {
  }

  ngOnInit(): void {
    this.route.paramMap.switchMap((params: ParamMap) =>
      this.bookService.getDetail(params.get('id'))
    ).subscribe(book => {
      if (book.author == null) {
        book.author = '';
      }
      if (book.zhName == null) {
        book.zhName = '';
      }
      if (book.zhAuthor == null) {
        book.zhAuthor = '';
      }
      this.book = book;
    });
  }

  save(name, author, zhName, zhAuthor): void {
    name = name.trim();
    if (!name) {
      return;
    }
    this.book.name = name;
    this.book.author = author.trim();
    this.book.zhName = zhName.trim();
    this.book.zhAuthor = zhAuthor.trim();
    this.bookService.update(this.book)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        this.editing = false;
      });
  }

  edit(): void {
    this.editing = true;
  }

  goBack(): void {
    this.location.back();
  }
}
