import {Model} from './model';

export class AppRelease extends Model {

  platform: string;
  versionName: string;
  versionCode: number;

  releaseNote: string;
  packageInfo: PackageInfo;
  current: boolean;

  status: string; // { N: normal, L: Locked, A: Archived}
}

export const AppPlatform = {Android: 'A', IOS: 'I'};

export class PackageInfo {
  file: string;
  hash: string;
  size: number;
  uploadedAt: Date;
  commit: string;
}
