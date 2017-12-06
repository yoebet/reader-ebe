import {
  Component, Input, Output, EventEmitter,
  OnInit, AfterViewChecked, ViewChild, ChangeDetectorRef
} from '@angular/core';
import {SuiModalService, TemplateModalConfig, ModalTemplate, ModalSize} from 'ng2-semantic-ui';

import {DictEntry, PosMeanings, MeaningItem} from '../models/dict-entry';
import {DictService} from '../services/dict.service';
import {DictEntryComponent} from './dict-entry.component';

@Component({
  selector: 'dict-entry-compact',
  templateUrl: './dict-entry.component.html',
  styleUrls: ['./dict-entry.component.css']
})
export class DictEntryCompactComponent extends DictEntryComponent implements OnInit, AfterViewChecked {
  // @ViewChild('modalTemplate') modalTemplate: ModalTemplate<DictEntry, string, string>;
  @Input() selectedItemId: number;
  @Output() viewReady = new EventEmitter();
  @Output() dictItemSelected = new EventEmitter<number>();
  viewReadyEntry = null;
  oriItemId = null;
  editing = false;
  editModal = null;

  constructor(cdr: ChangeDetectorRef, dictService: DictService/*, private modalService: SuiModalService*/) {
    super(cdr, dictService);
  }

  ngOnInit() {
    this.oriItemId = this.selectedItemId;
  }


  clickMeaningItem(pm: PosMeanings, mi: MeaningItem) {
    if (mi.id === this.selectedItemId) {
      // null: no change; -1: unset
      this.selectedItemId = (this.oriItemId === null) ? null : -1;
      return;
    }
    this.selectedItemId = mi.id;
  }

  ngAfterViewChecked() {
    if (this.viewReadyEntry === this.entry) {
      return;
    }
    this.viewReady.emit();
    this.viewReadyEntry = this.entry;
  }

  cancel() {
    this.dictItemSelected.emit(null);
  }

  done() {
    this.dictItemSelected.emit(this.selectedItemId);
  }

  // modalEdit() {
  //
  //   this.editing = true;
  //   const config = new TemplateModalConfig<DictEntry, string, string>(this.modalTemplate);
  //
  //   config.isClosable = false;
  //   config.size = ModalSize.Small;
  //   // config.context = this.entry;
  //
  //   this.editModal = this.modalService
  //     .open(config);
  //   // .onApprove(result => { /* approve callback */
  //   // })
  //   // .onDeny(result => { /* deny callback */
  //   // });
  // }

  onUpdate(updated) {
    this.entry = updated;
    this.editModal.approve('');
  }

  onCancelEdit() {
    this.editModal.deny(null);
  }

}
