import type { UserSettings } from './components/SwitchLanguage';

console.log('@@@@ CONTENT');

chrome.storage.local.get(null, (settings: UserSettings) => {
  const locale = settings.locale!;
  console.log('@@@@ CONTENT locale', locale);

  // window.navigator.language = locale;
  // window.navigator.languages = [locale, locale.split('-')[0]];

  Object.defineProperties(window.navigator.__proto__, {
    language: {
      value: locale,
      // writable: false,
      enumerable: true,
    },
    languages: {
      value: [locale, locale.split('-')[0]],
      // writable: false,
      enumerable: true,
    },
  });

  console.log('@@@@ CONTENT navigator.language', window.navigator.language);
  console.log('@@@@ CONTENT navigator.languages', window.navigator.languages);
});

const port = chrome.runtime.connect('hmadidjhmofagedbpjljhcmfgemfjlpb');

port.postMessage('locale1');

chrome.runtime.sendMessage(
  'hmadidjhmofagedbpjljhcmfgemfjlpb',
  'locale2',
  (response) => {
    console.log('@@@@ CONTENT message response', response);
  },
);

const locale = globalThis.localStorage?.getItem('__locale__');

console.log('@@@@ CONTENT locale', locale);

if (locale) {
  Object.defineProperties(window.navigator.__proto__, {
    language: {
      value: locale,
      enumerable: true,
    },
    languages: {
      value: [locale, locale.split('-')[0]],
      enumerable: true,
    },
  });

  console.log('@@@@ CONTENT navigator.language', window.navigator.language);
  console.log('@@@@ CONTENT navigator.languages', window.navigator.languages);
}

// TODO: Also override the locale (for Intl API etc.)
//  ↳ https://chromedevtools.github.io/devtools-protocol/tot/Emulation/#method-setLocaleOverride
//  ↳ Might need to be in a separate content script which has chrome extension API access

// export {};
