import './SwitchLanguage.xcss';

import { append, collect, h } from 'stage1';
import { compile } from 'stage1/macro' assert { type: 'macro' };
import locales from '../locales.json';
import { LanguageOption } from './LanguageOption';

export interface UserSettings {
  enable?: boolean;
  locale?: string;
}

type SwitchLanguageComponent = HTMLDivElement;

interface Refs {
  enabled: HTMLInputElement;
  select: HTMLSelectElement;
}

const meta = compile(`
  <div>
    <h1 class="mv2 tc">Switch Language</h1>

    <div class="df ma3">
      <div class=dfc>
        <input @enabled id=enabled class=checkbox type=checkbox />
        <label class=label for=enabled>Enabled</label>
      </div>

      <select @select class="select ml4"></select>
    </div>
  </div>
`);
const view = h<SwitchLanguageComponent>(meta.html);

export function SwitchLanguage(): SwitchLanguageComponent {
  const root = view;
  const refs = collect<Refs>(root, meta.k, meta.d);

  const setActiveLanguage = async () => {
    const enable = refs.enabled.checked;
    const locale = refs.select.value;

    // window.localStorage.setItem('__locale__', locale);

    await chrome.storage.local.set({ enable, locale });

    await chrome.scripting.unregisterContentScripts();

    if (enable) {
      console.log('@@@@ SwitchLanguage setActiveLanguage', locale);

      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [1],
        addRules: [
          {
            action: {
              requestHeaders: [
                {
                  header: 'Accept-Language',
                  operation: chrome.declarativeNetRequest.HeaderOperation.SET,
                  value: `${locale},${locale.split('-')[0]}`,
                },
              ],
              type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
            },
            condition: {},
            id: 1,
          },
        ],
      });

      await chrome.scripting.registerContentScripts([
        {
          allFrames: true,
          id: 'c',
          js: ['content.js'],
          matches: ['*://*/*'],
          runAt: 'document_start',
          world: 'MAIN',
        },
      ]);
      void chrome.action.setBadgeBackgroundColor({ color: '#0f0' });
      void chrome.action.setBadgeText({ text: locale });
    } else {
      console.log('@@@@ SwitchLanguage setActiveLanguage DISABLE');

      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [1],
      });

      void chrome.action.setBadgeText({ text: '' });
    }

    void chrome.tabs.reload();
  };

  // Populate language options in select dropdown
  // eslint-disable-next-line guard-for-in
  for (const locale in locales) {
    append(
      LanguageOption(locale, (locales as Record<string, string>)[locale]),
      refs.select,
    );
  }

  refs.enabled.onchange = setActiveLanguage;
  refs.select.onchange = setActiveLanguage;

  chrome.storage.local.get(null, (settings: UserSettings) => {
    refs.enabled.checked = !!settings.enable;

    const locale =
      settings.locale ?? Intl.NumberFormat().resolvedOptions().locale;

    if (locale in locales) {
      refs.select.value = locale;
    } else {
      const option = LanguageOption(locale, locale);
      option.selected = true;
      option.disabled = true;
      append(option, refs.select);
    }
  });

  return root;
}
