import {Component, OnInit} from '@angular/core';

import {ComponentModalConfig, SuiModal} from "ng2-semantic-ui";
import {ModalSize} from "ng2-semantic-ui/dist/modules/modal/classes/modal-config";

import {Book, PrivilegedUsers} from '../models/book';
import {BookService} from '../services/book.service';
import {OpResult} from "../models/op-result";

@Component({
  selector: 'book-users',
  templateUrl: './book-users.component.html',
  styleUrls: ['./book-users.component.css']
})
export class BookUsersComponent implements OnInit {
  book: Book;
  pUsers: PrivilegedUsers;

  constructor(private bookService: BookService,
              private modal: SuiModal<Book, string, string>) {
    this.book = modal.context;
  }

  ngOnInit(): void {
    if (!this.book) {
      return;
    }
    this.bookService.getPrivilegedUsers(this.book._id)
      .subscribe((pUsers: PrivilegedUsers) => {
        this.pUsers = pUsers;
      });
  }

  newEditor() {

  }

  removeEditor(userId: string) {
    let editor = this.pUsers.editors
      .find(e => e.userId === userId);
    if (!editor) {
      return;
    }
    if (!confirm(`你要去除 ${editor.userNickName} 的编辑权限吗？`)) {
      return;
    }
    this.bookService.removeEditor(this.book._id, userId)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        this.pUsers.editors = this.pUsers.editors
          .filter(e => e.userId !== userId);
      });
  }

  newReader() {

  }

  removeReader(userId: string) {
    let reader = this.pUsers.readers
      .find(r => r.userId === userId);
    if (!reader) {
      return;
    }
    if (!confirm(`你要去除 ${reader.userNickName} 的阅读权限吗？`)) {
      return;
    }
    this.bookService.removeReader(this.book._id, userId)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        this.pUsers.readers = this.pUsers.readers
          .filter(r => r.userId !== userId);
      });
  }

  close() {
    this.modal.approve('');
  }

}


export class BookUsersModal extends ComponentModalConfig<Book> {
  constructor(book: Book) {
    super(BookUsersComponent, book, false);
    this.size = ModalSize.Tiny;
    // this.isFullScreen = true;
    this.mustScroll = false;
    // this.isBasic = true;
  }
}
