/// <reference no-default-lib="true"/>
/// <reference lib="es2020" />
/// <reference lib="webworker" />

import type { UserSettings } from './components/SwitchLanguage';

function handleAppLoad() {
  chrome.storage.local.get(null, (settings: UserSettings) => {
    if (settings.enable && settings.locale) {
      // console.log('@@@@@ SW globalThis.localStorage', globalThis.localStorage);

      // globalThis.localStorage.setItem('__locale__', settings.locale);

      // When the extension is updated the content script is unregistered so we
      // need to re-register it
      // @ts-expect-error - missing from @types/chrome, added Chrome v96
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      chrome.scripting.getRegisteredContentScripts((scripts: any[]) => {
        if (scripts.length === 0) {
          // @ts-expect-error - missing from @types/chrome, added Chrome v96
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          chrome.scripting.registerContentScripts([
            {
              allFrames: true,
              id: 'c',
              js: ['content.js'],
              matches: ['*://*/*'],
              runAt: 'document_start',
              world: 'MAIN',
            },
          ]);
        }
      });

      void chrome.action.setBadgeBackgroundColor({ color: '#0f0' });
      void chrome.action.setBadgeText({ text: settings.locale });
    }
  });
}

chrome.runtime.onInstalled.addListener(handleAppLoad);
chrome.runtime.onStartup.addListener(handleAppLoad);

// chrome.runtime.onMessage.addListener((request, sender, reply) => {
//   console.log('@@@@ SW request', request);
// });

// globalThis.addEventListener('message', (event) => {
//   console.log('@@@@ SW message', event);
// });
