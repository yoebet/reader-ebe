export interface ParaSaver {

  save(para, onSaved): void;

  saveSplit(paras, onSaved): void;

  cancelEdit();
}
