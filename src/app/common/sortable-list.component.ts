import {OpResult} from "../models/op-result";

export abstract class SortableListComponent {

  abstract get modelList();
  abstract get sortableService();

  protected move(model, dir: string) {
    let list = this.modelList;
    let thisPos = list.indexOf(model);
    if (thisPos === 0) {
      if (dir === 'moveUp' || dir === 'moveTop') {
        return;
      }
    }
    if (thisPos === list.length - 1) {
      if (dir === 'moveDown' || dir === 'moveBottom') {
        return;
      }
    }
    let targetPos = null;
    switch (dir) {
      case 'moveUp':
        targetPos = thisPos - 1;
        break;
      case 'moveDown':
        targetPos = thisPos + 1;
        break;
      case 'moveTop':
        targetPos = 0;
        break;
      case 'moveBottom':
        targetPos = list.length - 1;
        break;
    }
    this.sortableService[dir](model)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        if (dir === 'moveTop' || dir === 'moveBottom') {
          list.splice(thisPos, 1);
          if (dir === 'moveTop') {
            list.unshift(model);
          } else {
            list.push(model);
          }
        } else {
          list[thisPos] = list[targetPos];
          list[targetPos] = model;
        }
      });
  }

  moveUp(model) {
    this.move(model, 'moveUp');
  }

  moveDown(model) {
    this.move(model, 'moveDown');
  }

  moveTop(model) {
    this.move(model, 'moveTop');
  }

  moveBottom(model) {
    this.move(model, 'moveBottom');
  }
}
