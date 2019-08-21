import {Component, OnInit, ViewChild} from '@angular/core';
import {AppRelease, AppPlatform} from '../models/app-release';

import {StaticResource} from '../config';
import {ReleaseService} from '../services/release.service';
import {OpResult} from '../models/op-result';

@Component({
  selector: 'release-list',
  templateUrl: './release-list.component.html',
  styleUrls: ['./release-list.component.css']
})
export class ReleaseListComponent implements OnInit {
  @ViewChild('file') file;
  platform: string = AppPlatform.Android;

  releases: AppRelease[];
  newRelease: AppRelease = null;
  editing: AppRelease = null;

  uploading = false;

  appPackagesBase = StaticResource.AppPackagesBase;

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

    if (this.releases && this.releases[0]) {
      let latest = this.releases[0];
      rr.versionCode = latest.versionCode + 1;
      rr.versionName = latest.versionName.replace(
        /\d+$/,
        d => '' + (+d + 1))
    }

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
    this.releaseService
      .setCurrentVersion(rr._id)
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

  setPreview(rr: AppRelease) {
    if (!confirm('设置为预览版吗（测试版可升级）？')) {
      return;
    }
    this.releaseService
      .setPreview(rr._id)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        for (let r of this.releases) {
          if (r.preview) {
            r.preview = false;
          }
        }
        rr.preview = true;
      });
  }

  unsetPreview(rr: AppRelease) {
    if (!confirm('要取消预览吗？')) {
      return;
    }
    this.releaseService
      .unsetPreview(rr._id)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        rr.preview = false;
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

  dropPackage(rr: AppRelease) {
    if (!confirm('要删除安装包吗？')) {
      return;
    }
    this.releaseService
      .dropPackage(rr._id)
      .subscribe((opr: OpResult) => {
        if (opr.ok === 0) {
          alert(opr.message || 'Fail');
          return;
        }
        rr.packageInfo = null;
      });
  }

  selectFile() {
    if (this.uploading) {
      alert('正在上传');
      return;
    }
    this.file.nativeElement.click();
  }

  upload(rr: AppRelease) {
    let files = this.file.nativeElement.files;
    // console.log(files);// FileList
    if (!files || files.length == 0) {
      return;
    }
    this.uploading = true;
    this.releaseService.uploadPackage(rr._id, files[0])
      .subscribe(packageInfo => {
          this.uploading = false;
          if (!packageInfo.file) {
            alert('上传失败');
            return;
          }
          rr.packageInfo = packageInfo;
        },
        error => {
          alert('上传失败');
          this.uploading = false;
          console.error(error);
        });
  }

  releaseTracker(index, release) {
    return release._id;
  }
}
