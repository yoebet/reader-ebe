import {Component, Input, OnInit, ViewChild} from '@angular/core';

import {ComponentModalConfig, SuiModal} from 'ng2-semantic-ui';
import {ModalSize} from 'ng2-semantic-ui/dist/modules/modal/classes/modal-config';

import {StaticResource} from '../config';
import {Book} from '../models/book';
import {BookService} from '../services/book.service';

@Component({
  selector: 'book-image',
  templateUrl: './book-image.component.html',
  styleUrls: ['./book-image.component.css']
})
export class BookImageComponent implements OnInit {
  @ViewChild('file') file;
  @Input() book: Book;

  uploading = false;

  bookImagesBase = StaticResource.BookImagesBase;
  bookImageNotSet = StaticResource.BookImageNotSet;

  constructor(private bookService: BookService,
              private modal: SuiModal<Book, string, string>) {
    this.book = modal.context;
  }

  ngOnInit(): void {
  }

  close() {
    this.modal.approve('');
  }


  selectFile() {
    if (this.uploading) {
      alert('正在上传');
      return;
    }
    this.file.nativeElement.click();
  }

  upload() {
    let files = this.file.nativeElement.files;
    // console.log(files);// FileList
    if (!files || files.length === 0) {
      return;
    }
    this.uploading = true;
    this.bookService.uploadImage(this.book._id, files[0])
      .subscribe(bookImage => {
          this.uploading = false;
          if (!bookImage.file) {
            alert('上传失败');
            return;
          }
          this.book.image = bookImage;
        },
        error => {
          alert('上传失败');
          this.uploading = false;
          console.error(error);
        });
  }

}


export class BookImageModal extends ComponentModalConfig<Book> {
  constructor(book: Book) {
    super(BookImageComponent, book, false);
    this.size = ModalSize.Tiny;
    // this.isFullScreen = true;
    this.mustScroll = false;
    // this.isBasic = true;
  }
}
