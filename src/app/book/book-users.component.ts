import {Component, OnInit} from '@angular/core';

import {ComponentModalConfig, SuiModal} from "ng2-semantic-ui";
import {ModalSize} from "ng2-semantic-ui/dist/modules/modal/classes/modal-config";

import {Book, PrivilegedUsers} from '../models/book';
import {BookService} from '../services/book.service';
import {OpResult} from "../models/op-result";
import {UserIdName} from "../models/user";
import {UserBook} from "../models/user-book";

@Component({
  selector: 'book-users',
  templateUrl: './book-users.component.html',
  styleUrls: ['./book-users.component.css']
})
export class BookUsersComponent implements OnInit {
  book: Book;
  pUsers: PrivilegedUsers;
  addingEditor = false;
  addingReader = false;

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

  private newBookUser(idName: UserIdName, bookId: string): UserBook {
    let ub = new UserBook();
    ub.userId = idName._id;
    ub.userName = idName.name;
    ub.userNickName = idName.nickName;
    ub.bookId = bookId;
    return ub;
  }

  addEditor(name) {
    name = name.trim();
    if (!name) {
      return;
    }
    let book = this.book;
    this.bookService.checkCandidate(book._id, name)
      .subscribe((idName: UserIdName) => {
        if (!idName) {
          alert('用户不存在');
          return;
        }
        if (!confirm(`你要把 ${idName.nickName}（账号：${idName.name}）加为编辑吗？`)) {
          return;
        }
        this.bookService.addEditor(book._id, idName._id)
          .subscribe((opr: OpResult) => {
            if (opr.ok === 0) {
              alert(opr.message || 'Fail');
              return;
            }
            let ub = this.newBookUser(idName, book._id);
            this.pUsers.editors.push(ub);
            this.addingEditor = false;
          });
      });
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

  addReader(name) {
    name = name.trim();
    if (!name) {
      return;
    }
    let book = this.book;
    this.bookService.checkCandidate(book._id, name)
      .subscribe((idName: UserIdName) => {
        if (!idName) {
          alert('用户不存在');
          return;
        }
        if (!confirm(`你要把 ${idName.nickName}（账号：${idName.name}）加为读者吗？`)) {
          return;
        }
        this.bookService.addReader(book._id, idName._id)
          .subscribe((opr: OpResult) => {
            if (opr.ok === 0) {
              alert(opr.message || 'Fail');
              return;
            }
            let ub = this.newBookUser(idName, book._id);
            this.pUsers.readers.push(ub);
            this.addingReader = false;
          });
      });
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
