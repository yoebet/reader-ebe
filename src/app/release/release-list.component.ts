import {Component, OnInit} from '@angular/core';
import {AppRelease, AppPlatform} from "../models/app-release";

import {ReleaseService} from '../services/release.service';
import {OpResult} from "../models/op-result";

@Component({
  selector: 'release-list',
  templateUrl: './release-list.component.html',
  styleUrls: ['./release-list.component.css']
})
export class ReleaseListComponent implements OnInit {
  platform: string = AppPlatform.Android;

  releases: AppRelease[];
  newRelease: AppRelease = null;
  editing: AppRelease = null;

  constructor(private  releaseService: ReleaseService) {
  }

  ngOnInit() {
    this.releaseService
      .listForPlatform(this.platform)
      .subscribe(releases => this.releases = releases);
  }

  editNew() {
    let rr = new AppRelease();
    rr.platform = this.platform;
    rr.status = 'N';
    rr.releaseDate = new Date();

    this.newRelease = rr;
  }

  cancelEditNew() {
    this.newRelease = null;
  }

  edit(rr: AppRelease) {
    this.editing = rr;
  }

  cancelEdit() {
    this.editing = null;
  }

  save(rr: AppRelease, versionName: string, versionCode: number, releaseNote: string): void {
    versionName = versionName.trim();
    if (!versionName) {
      return;
    }
    versionCode = +versionCode;
    let rra = {versionName, versionCode, releaseNote} as AppRelease;
    rra._id = rr._id;
    this.releaseService.update(rra)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        rr.versionName = versionName;
        rr.versionCode = versionCode;
        rr.releaseNote = releaseNote;
        this.editing = null;
      });
  }

  saveNew(): void {
    let rr = this.newRelease;
    if (!rr) {
      return;
    }
    rr.versionName = rr.versionName.trim();
    if (!rr.versionName) {
      return;
    }
    rr.versionCode = +rr.versionCode;
    this.releaseService.create(rr)
      .subscribe((nrr: AppRelease) => {
        this.releases.unshift(nrr);
        this.newRelease = null;
      });
  }

  lock(rr: AppRelease) {
    if (!confirm('要锁定吗？')) {
      return;
    }
    this.releaseService
      .lockVersion(rr._id)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        rr.status = 'L';
      });
  }

  setCurrent(rr: AppRelease) {
    if (!confirm('设置为当前最新版本？')) {
      return;
    }
    if (rr.current) {
      return;
    }
    this.releaseService
      .setCurrentVersion(this.platform, rr.versionCode)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        for (let r of this.releases) {
          if (r.current) {
            r.current = false;
          }
        }
        rr.current = true;
      });
  }

  archive(rr: AppRelease) {
    if (!confirm('要归档（隐藏）吗？')) {
      return;
    }
    this.releaseService
      .archiveVersion(rr._id)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        this.releases = this.releases.filter(r => r !== rr);
      });
  }

  drop(rr: AppRelease) {
    if (!confirm('确定要删除吗？')) {
      return;
    }
    this.releaseService
      .remove(rr._id)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        this.releases = this.releases.filter(r => r !== rr);
      });
  }

  releaseTracker(index, release) {
    return release._id;
  }
}
