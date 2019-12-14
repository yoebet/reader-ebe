// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

const ServerDomain = 'yuwen-reading.net';


// const ServerRoot = 'http://localhost:3000';
const ServerRoot = `https://${ServerDomain}`;
// const ServerRoot = `http://${ServerDomain}`;

export const environment = {
  production: false,
  apiBase: ServerRoot,
  staticBase: `http://localhost`,
  selfBase: `http://${ServerDomain}/ee`,
  webAppBase: `http://${ServerDomain}/ww`,
  httpHeaders: {
    'X-XS': 'grMmqX5wDJsQKDs2oF7KxK'
  }
};
