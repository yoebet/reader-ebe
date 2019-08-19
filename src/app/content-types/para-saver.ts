export interface ParaSaver {

  save(para, onSaved): void;

  saveSplit(paras, onSaved): void;

  updateTrans(chap, idTrans, onSaved): void;

  cancelEdit();
}
