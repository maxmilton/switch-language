// https://developer.chrome.com/docs/extensions/mv3/devguide/
// https://developer.chrome.com/docs/extensions/mv3/manifest/
// https://developer.chrome.com/docs/extensions/reference/

import pkg from './package.json' assert { type: 'json' };

function gitRef() {
  return Bun.spawnSync([
    'git',
    'describe',
    '--always',
    '--dirty=-dev',
    '--broken',
  ])
    .stdout.toString()
    .trim()
    .replace(/^v/, '');
}

export const createManifest = (
  debug = !process.env.CI,
): chrome.runtime.ManifestV3 => ({
  manifest_version: 3,
  name: 'Switch Language',
  description: 'Switch web page language.',
  homepage_url: pkg.homepage,
  version: pkg.version,
  // shippable releases should not have a named version
  version_name: debug ? gitRef() : undefined,
  icons: {
    16: 'icon16.png',
    48: 'icon48.png',
    128: 'icon128.png',
  },
  permissions: [
    'activeTab', // https://developer.chrome.com/docs/extensions/mv2/manifest/activeTab/
    'scripting',
    'storage',
    'declarativeNetRequest',
  ],
  host_permissions: ['*://*/*'],
  action: {
    default_popup: 'popup.html',
  },
  background: {
    service_worker: 'sw.js',
  },
  offline_enabled: true,
  incognito: 'spanning',
  content_security_policy: {
    extension_pages: [
      "default-src 'none'",
      "script-src-elem 'self'",
      "style-src-elem 'self'",
      'img-src data:', // CSS inline background-image
      'connect-src https://api.trackx.app',
      'report-uri https://api.trackx.app/v1/j8a84q08rm5/report',
      '', // include trailing semicolon
    ].join(';'),
  },

  // https://chrome.google.com/webstore/detail/switch-language/
  // key: 'FIXME:ADD_KEY_HERE',
});
