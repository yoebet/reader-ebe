import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {Location} from '@angular/common';
import 'rxjs/add/operator/switchMap';

import {Book} from '../models/book';
import {BookService} from '../services/book.service';
import {BookFormModal} from "./book-form.component";
import {BookInfoModal} from "./book-info.component";
import {BookPacksModal} from "./book-packs.component";
import {BookUsersModal} from "./book-users.component";
import {SuiModalService} from "ng2-semantic-ui";

@Component({
  selector: 'book-detail',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.css']
})
export class BookComponent implements OnInit {
  book: Book;
  statusNames = Book.StatusNames;
  categoryNames = Book.CategoryNames;

  constructor(private bookService: BookService,
              private route: ActivatedRoute,
              private location: Location,
              public modalService: SuiModalService) {
  }

  ngOnInit(): void {
    this.route.paramMap.switchMap((params: ParamMap) =>
      this.bookService.getDetail(params.get('id'))
    ).subscribe(book => {
      this.book = book;
    });
  }

  showDetail() {
    this.modalService.open(new BookInfoModal(this.book))
    // .onDeny((d) => {})
    // .onApprove((r) => {})
    ;
  }

  showForm() {
    this.modalService.open(new BookFormModal(this.book))
    // .onDeny((d) => {})
    // .onApprove((r) => {})
    ;
  }

  showPacks() {
    this.modalService.open(new BookPacksModal(this.book))
    // .onDeny((d) => {})
    // .onApprove((r) => {})
    ;
  }

  showUsers() {
    this.modalService.open(new BookUsersModal(this.book))
    // .onDeny((d) => {})
    // .onApprove((r) => {})
    ;
  }

  goBack(): void {
    this.location.back();
  }
}
