import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {Location} from "@angular/common";

import 'rxjs/add/operator/switchMap';
import {AnnotationFamily} from '../models/annotation-family';
import {AnnoFamilyService} from "../services/anno-family.service";
import {AnnoGroupService} from "../services/anno-group.service";
import {AnnotationGroup} from "../models/annotation-group";
import {Annotation} from "../models/annotation";
import {OpResult} from "../models/op-result";

@Component({
  selector: 'annotation-family',
  templateUrl: './anno-family.component.html',
  styleUrls: ['./anno-family.component.css']
})
export class AnnoFamilyComponent implements OnInit {

  family: AnnotationFamily;
  editingGroup: AnnotationGroup;
  editingAnnotation: Annotation;

  constructor(private annotationFamilyService: AnnoFamilyService,
              private annotationGroupService: AnnoGroupService,
              private router: Router,
              private route: ActivatedRoute,
              private location: Location) {
  }

  ngOnInit() {
    this.route.paramMap.switchMap((params: ParamMap) =>
      this.annotationFamilyService.getDetail(params.get('id'))
    ).subscribe(family => {
      this.family = family;
    });
  }

  editGroup(group) {
    this.editingGroup = JSON.parse(JSON.stringify(group));
  }

  editing(group) {
    return this.editingGroup && this.editingGroup._id === group._id;
  }

  editAnnotation(ann) {
    this.editingAnnotation = ann;
  }

  doneEditAnnotation() {
    this.editingAnnotation = null;
  }

  cancelEdit() {
    this.editingGroup = null;
    this.editingAnnotation = null;
  }

  removeAnnotation(ann) {
    let list = this.editingGroup.annotations;
    let thisPos = list.indexOf(ann);
    list.splice(thisPos, 1);
  }

  protected annMove(ann, dir: string) {
    let list = this.editingGroup.annotations;
    let thisPos = list.indexOf(ann);
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
    if (dir === 'moveTop' || dir === 'moveBottom') {
      list.splice(thisPos, 1);
      if (dir === 'moveTop') {
        list.unshift(ann);
      } else {
        list.push(ann);
      }
    } else {
      list[thisPos] = list[targetPos];
      list[targetPos] = ann;
    }
  }


  annMoveUp(ann) {
    this.annMove(ann, 'moveUp');
  }

  annMoveDown(ann) {
    this.annMove(ann, 'moveDown');
  }

  moveTop(ann) {
    this.annMove(ann, 'moveTop');
  }

  moveBottom(ann) {
    this.annMove(ann, 'moveBottom');
  }


  saveGroup() {
    let editingGroup = this.editingGroup;
    this.annotationGroupService.update(editingGroup)
      .subscribe(opr => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        let group = this.family.groups.find(u => u._id === editingGroup._id);
        Object.assign(group, editingGroup);
        this.editingGroup = null;
      });
  }

  removeGroup(af) {
    if (!confirm('Are You Sure?')) {
      return;
    }
    this.annotationGroupService
      .remove(af._id)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        this.family.groups = this.family.groups.filter(c => c !== af);
      });
  }

  goBack(): void {
    this.location.back();
  }


  groupTracker(index, group) {
    return group._id;
  }


}
