import {Component, Input, OnInit} from '@angular/core';

import {ComponentModalConfig, SuiModal} from 'ng2-semantic-ui';
import {ModalSize} from 'ng2-semantic-ui/dist/modules/modal/classes/modal-config';

import {Book} from '../models/book';
import {BookService} from '../services/book.service';
import {OpResult} from '../models/op-result';
import {PriceLabelPipe} from '../pipes/price-label.pipe';
import {AnnotationFamily} from '../models/annotation-family';
import {AnnoFamilyService} from '../services/anno-family.service';
import {User, UserIdName} from '../models/user';
import {SessionService} from '../services/session.service';
import {UserBook} from '../models/user-book';

@Component({
  selector: 'book-form',
  templateUrl: './book-form.component.html',
  styleUrls: ['./book-form.component.css']
})
export class BookFormComponent implements OnInit {
  @Input() book: Book;
  editing: Book;

  langOptions = Book.LangTypes;
  statusOptions = Book.Statuses;
  categoryOptions = Book.Categories;

  annOptions: AnnotationFamily[];
  settingChiefEditor = false;
  editors: UserBook[];

  get currentUser(): User {
    return this.sessionService.currentUser;
  }

  get admin(): boolean {
    let cu = this.sessionService.currentUser;
    if (!cu) {
      return false;
    }
    return cu.role === 'A' || cu.role === 'R';
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
    this.editing = editing;
  }

  alterChiefEditor() {
    this.settingChiefEditor = true;
    if (!this.editors) {
      this.bookService.getEditors(this.book._id)
        .subscribe((editors: UserBook[]) => {
          this.editors = editors;
        });
    }
  }

  private doSetChiefEditor(editorId, editorName) {
    this.bookService.setChiefEditor(this.book._id, editorId)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        this.book.chiefEditorId = editorId;
        this.book.chiefEditorName = editorName;
        this.settingChiefEditor = false;
      });
  }

  setChiefEditor(name) {
    name = name.trim();
    if (!name) {
      return;
    }
    this.bookService.checkCandidate(this.book._id, name)
      .subscribe((idName: UserIdName) => {
        if (!idName) {
          alert('用户不存在');
          return;
        }
        if (!confirm(`你要把 ${idName.nickName}（${idName.name}）设为主编辑吗？`)) {
          return;
        }
        this.doSetChiefEditor(idName._id, idName.nickName);
      });
  }

  selectChiefEditor(editor: UserBook) {
    this.doSetChiefEditor(editor.userId, editor.userNickName);
  }

  updatePriceLabel() {
    let book = this.editing;
    if (book.isFree) {
      book.priceLabel = '免费';
      return;
    }
    let pipe = this.priceLabelPipe;
    if (book.pricingMode === 'B') {
      book.priceLabel = pipe.transform({price: book.price});
    } else if (book.pricingMode === 'C') {
      let priceLabel = pipe.transform({price: book.pricePerChap});
      book.priceLabel = `${priceLabel}/章`;
    }
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
