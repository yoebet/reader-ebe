const ServerDomain = 'yuwen-reading.net';

const ServerRoot = `http://${ServerDomain}`;

export const environment = {
  production: true,
  apiBase: '',
  staticBase: '',
  selfBase: `${ServerRoot}/ee`,
  webAppBase: `${ServerRoot}/ww`,
  httpHeaders: {}
};
