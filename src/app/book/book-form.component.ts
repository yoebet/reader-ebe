import {Component, Input, OnInit} from '@angular/core';

import {ComponentModalConfig, SuiModal} from "ng2-semantic-ui";
import {ModalSize} from "ng2-semantic-ui/dist/modules/modal/classes/modal-config";

import {Book} from '../models/book';
import {BookService} from '../services/book.service';
import {OpResult} from "../models/op-result";
import {PriceLabelPipe} from "../pipes/price-label.pipe";
import {AnnotationFamily} from "../models/annotation-family";
import {AnnoFamilyService} from "../services/anno-family.service";
import {User, UserIdName} from "../models/user";
import {SessionService} from "../services/session.service";

@Component({
  selector: 'book-form',
  templateUrl: './book-form.component.html',
  styleUrls: ['./book-form.component.css']
})
export class BookFormComponent implements OnInit {
  @Input() book: Book;
  editing: Book;
  // langOptions = Book.LangTypes;
  statusOptions = Book.Statuses;
  categoryOptions = Book.Categories;

  annOptions: AnnotationFamily[];
  settingChiefEditor = false;

  get currentUser(): User {
    return this.sessionService.currentUser;
  }

  constructor(private bookService: BookService,
              private sessionService: SessionService,
              private annoFamilyService: AnnoFamilyService,
              private priceLabelPipe: PriceLabelPipe,
              private modal: SuiModal<BookFormContext, string, string>) {
    let context = modal.context;
    this.book = context.book;
    this.annOptions = context.annOptions;
  }

  ngOnInit(): void {
    this.edit();
    if (!this.annOptions) {
      this.annoFamilyService
        .getCandidates()
        .subscribe(afs => this.annOptions = afs);
    }
  }

  save(): void {
    this.editing.name = this.editing.name.trim();
    if (!this.editing.name) {
      return;
    }
    this.bookService.update(this.editing)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        Object.assign(this.book, this.editing);
        this.editing = null;
        this.close();
      });
  }

  edit(): void {
    let editing = new Book();
    Object.assign(editing, this.book);
    delete editing.chaps;
    delete editing.updatedAt;
    /*if (editing.author == null) {
      editing.author = '';
    }
    if (editing.zhName == null) {
      editing.zhName = '';
    }
    if (editing.zhAuthor == null) {
      editing.zhAuthor = '';
    }*/
    this.editing = editing;
  }


  setChiefEditor(name) {
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
        if (!confirm(`你要把 ${idName.nickName}（${idName.name}）设为主编辑吗？`)) {
          return;
        }
        this.bookService.setChiefEditor(book._id, idName._id)
          .subscribe((opr: OpResult) => {
            if (opr.ok === 0) {
              alert(opr.message || 'Fail');
              return;
            }
            this.book.chiefEditorId = idName._id;
            this.book.chiefEditorName = idName.nickName;
            this.settingChiefEditor = false;
          });
      });
  }

  updatePriceLabel() {
    let book = this.editing;
    book.priceLabel = this.priceLabelPipe.transform(book);
  }

  close() {
    this.modal.approve('');
  }
}

export class BookFormContext {
  book: Book;
  annOptions?: AnnotationFamily[];
}

export class BookFormModal extends ComponentModalConfig<BookFormContext> {
  constructor(context: BookFormContext) {
    super(BookFormComponent, context, false);
    this.size = ModalSize.Tiny;
    // this.isFullScreen = true;
    this.mustScroll = true;
  }
}
