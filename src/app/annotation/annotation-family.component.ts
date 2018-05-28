import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {Location} from "@angular/common";

import 'rxjs/add/operator/switchMap';
import {AnnotationFamily} from '../models/annotation-family';
import {AnnotationFamilyService} from "../services/annotation-family.service";

@Component({
  selector: 'annotation-family',
  templateUrl: './annotation-family.component.html',
  styleUrls: ['./annotation-family.component.css']
})
export class AnnotationFamilyComponent implements OnInit {

  family: AnnotationFamily;

  constructor(private annotationFamilyService: AnnotationFamilyService,
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


  goBack(): void {
    this.location.back();
  }

}
