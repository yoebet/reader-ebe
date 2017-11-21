import {Component, Input, Output, EventEmitter, OnInit, AfterViewInit, ViewChild} from '@angular/core';
import {SuiModalService, TemplateModalConfig, ModalTemplate, ModalSize} from 'ng2-semantic-ui';

import {DictEntry, PosMeanings, MeaningItem, WordCategories, TagLabelMap} from '../models/dict-entry';
import {DictService} from '../services/dict.service';

@Component({
  selector: 'dict-entry-compact',
  templateUrl: './dict-entry-compact.component.html',
  styleUrls: ['./dict-entry-compact.component.css']
})
export class DictEntryCompactComponent implements OnInit, AfterViewInit {
  @ViewChild('modalTemplate') modalTemplate: ModalTemplate<DictEntry, string, string>;
  @Input() entry: DictEntry;
  @Input() selectedItemId: number;
  @Output() viewReady = new EventEmitter();
  @Output() dictItemSelected = new EventEmitter<number>();
  viewReadyEntry = null;
  oriItemId = null;
  editing = false;
  editModal = null;

  constructor(private dictService: DictService, private modalService: SuiModalService) {
  }

  ngOnInit() {
    this.oriItemId = this.selectedItemId;
  }

  get wordCats() {
    return WordCategories;
  }

  get cats() {
    return this.entry.categories;
  }

  get tagLabelMap() {
    return TagLabelMap;
  }

  clickMeaningItem(pm: PosMeanings, mi: MeaningItem) {
    if (mi.id === this.selectedItemId) {
      // null: not set; -1: unset
      this.selectedItemId = (this.oriItemId === null) ? null : -1;
      return;
    }
    this.selectedItemId = mi.id;
  }

  ngAfterViewInit() {
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

  modalEdit() {

    this.editing = true;
    const config = new TemplateModalConfig<DictEntry, string, string>(this.modalTemplate);

    config.isClosable = false;
    config.size = ModalSize.Small;
    // config.context = this.entry;

    this.editModal = this.modalService
      .open(config);
    // .onApprove(result => { /* approve callback */
    // })
    // .onDeny(result => { /* deny callback */
    // });
  }

  onUpdate(updated) {
    this.entry = updated;
    this.editModal.approve('');
  }

  onCancelEdit() {
    this.editModal.deny(null);
  }

}
