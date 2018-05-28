import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {AnnotationFamily} from '../models/annotation-family';
import {AnnotationFamilyService} from "../services/annotation-family.service";

@Component({
  selector: 'annotation-family-list',
  templateUrl: './annotation-family-list.component.html',
  styleUrls: ['./annotation-family-list.component.css']
})
export class AnnotationFamilyListComponent implements OnInit {

  families: AnnotationFamily[];

  constructor(private annotationFamilyService: AnnotationFamilyService,
              private router: Router) {
  }

  ngOnInit() {
    this.annotationFamilyService.list()
      .subscribe(families => {
        this.families = families;
      });
  }

  gotoDetail(family: AnnotationFamily): void {
    this.router.navigate(['/annotation-families', family._id]);
  }

  clone(af: AnnotationFamily): void {
    if (!confirm('... To Clone?')) {
      return;
    }
    this.annotationFamilyService.clone(af._id).subscribe(clonedFamily => {
      if (!clonedFamily) {
        alert('Fail To Clone.');
        return;
      }
      let index = this.families.indexOf(af);
      this.families.splice(index + 1, 0, clonedFamily);
    });
  }

}
