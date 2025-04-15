import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {SuiModalService} from 'ng2-semantic-ui';

import {Observable} from 'rxjs/';
import {catchError} from 'rxjs/operators';

import {environment} from '../../environments/environment';
import {OpResult} from '../models/op-result';
import {AppRelease, PackageInfo} from '../models/app-release';
import {BaseService} from './base.service';
import {SessionService} from './session.service';

@Injectable()
export class ReleaseService extends BaseService<AppRelease> {

  constructor(protected http: HttpClient,
              protected modalService: SuiModalService,
              protected sessionService: SessionService) {
    super(http, modalService, sessionService);
    let apiBase = environment.apiBase || '';
    this.baseUrl = `${apiBase}/${this.apiA}/releases`;
  }


  listForPlatform(platform: string): Observable<AppRelease[]> {
    let url = `${this.baseUrl}?pl=${platform}`;
    return super.list(url);
  }

  setCurrentVersion(id: string): Observable<OpResult> {
    let url = `${this.baseUrl}/${id}/setCurrent`;
    return this.postForOpResult(url);
  }

  setPreview(id: string): Observable<OpResult> {
    let url = `${this.baseUrl}/${id}/setPreview`;
    return this.postForOpResult(url);
  }

  unsetPreview(id: string): Observable<OpResult> {
    let url = `${this.baseUrl}/${id}/unsetPreview`;
    return this.postForOpResult(url);
  }

  lockVersion(id: string): Observable<OpResult> {
    let url = `${this.baseUrl}/${id}/lock`;
    return this.postForOpResult(url);
  }

  archiveVersion(id: string): Observable<OpResult> {
    let url = `${this.baseUrl}/${id}/archive`;
    return this.postForOpResult(url);
  }

  uploadPackage(releaseId: string, file: File): Observable<PackageInfo> {
    let url = `${this.baseUrl}/${releaseId}/package`;
    const formData = new FormData();
    formData.append('package', file, file.name);
    return this.http.post<PackageInfo>(url, formData, this.httpOptions);
  }

  dropPackage(id: string): Observable<OpResult> {
    let url = `${this.baseUrl}/${id}/package`;
    return this.http.delete<OpResult>(url, this.httpOptions).pipe(
      catchError(this.handleError));
  }

}
