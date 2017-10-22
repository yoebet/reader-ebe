import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router, ParamMap} from '@angular/router';
import {Location} from '@angular/common';
import 'rxjs/add/operator/switchMap';

import {Chap} from '../models/chap';
import {ChapService} from '../services/chap.service';
import {OpResult} from '../models/op-result';

@Component({
  selector: 'chap-detail',
  templateUrl: './chap.component.html',
  styleUrls: ['./chap.component.css']
})
export class ChapComponent implements OnInit {
  chap: Chap;
  editing = false;

  constructor(private chapService: ChapService,
              private route: ActivatedRoute,
              private location: Location) {
  }

  ngOnInit(): void {
    this.route.paramMap.switchMap((params: ParamMap) =>
      this.chapService.getDetail(params.get('id'))
    ).subscribe(chap => this.chap = chap);
  }

  save(name): void {
    name = name.trim();
    if (!name) {
      this.editing = false;
      return;
    }
    if (this.chap.name === name) {
      this.editing = false;
      return;
    }
    this.chap.name = name;
    this.chapService.update(this.chap)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        this.editing = false;
      });
  }

  edit(): void {
    this.editing = true;
  }

  goBack(): void {
    this.location.back();
  }

}
