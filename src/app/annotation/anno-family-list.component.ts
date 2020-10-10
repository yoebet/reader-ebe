import {Component, OnInit} from '@angular/core';

import {AnnotationFamily} from '../models/annotation-family';
import {AnnoFamilyService} from '../services/anno-family.service';
import {OpResult} from '../models/op-result';

@Component({
  selector: 'annotation-family-list',
  templateUrl: './anno-family-list.component.html'
})
export class AnnoFamilyListComponent implements OnInit {

  families: AnnotationFamily[];
  editingFamily: AnnotationFamily;

  operations = false;

  constructor(private annoService: AnnoFamilyService) {
  }

  ngOnInit() {
    this.annoService.list()
      .subscribe(families => {
        this.families = families;
      });
  }

  edit(af) {
    this.editingFamily = Object.assign({}, af);
  }

  editing(af) {
    return this.editingFamily && this.editingFamily._id === af._id;
  }

  save() {
    let editingFamily = this.editingFamily;
    this.annoService.update(editingFamily)
      .subscribe(opr => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        let family = this.families.find(u => u._id === editingFamily._id);
        Object.assign(family, editingFamily);
        this.editingFamily = null;
      });
  }

  incVersion(af) {
    this.annoService.incVersion(af._id)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        if (!af.version) {
          af.version = 1;
        } else {
          af.version++;
        }
        alert('版本号已增加');
      });
  }

  remove(af) {
    if (!confirm('Are You Sure?')) {
      return;
    }
    this.annoService
      .remove(af._id)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        this.families = this.families.filter(c => c !== af);
      });
  }

  clone(af: AnnotationFamily): void {
    if (!confirm('... To Clone?')) {
      return;
    }
    this.annoService.clone(af._id).subscribe(clonedFamily => {
      if (!clonedFamily) {
        alert('Fail To Clone.');
        return;
      }
      let index = this.families.indexOf(af);
      this.families.splice(index + 1, 0, clonedFamily);
    });
  }

  tracker(index, af) {
    return af._id;
  }
}
