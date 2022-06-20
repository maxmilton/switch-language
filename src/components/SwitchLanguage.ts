import './SwitchLanguage.xcss';

import { append, h, S1Node } from 'stage1';
import locales from '../locales.json';
import { LanguageOption } from './LanguageOption';

export interface UserSettings {
  enable?: boolean;
  locale?: string;
}

type SwitchLanguageComponent = S1Node & HTMLDivElement;

type RefNodes = {
  enabled: HTMLInputElement;
  select: HTMLSelectElement;
};

const view = h(`
  <div>
    <h1 class="mv2 tc">Switch Language</h1>

    <div class="df ma3">
      <div class=dfc>
        <input id=enabled class=checkbox type=checkbox #enabled/>
        <label class=label for=enabled>Enabled</label>
      </div>

      <select class="select ml4" #select></select>
    </div>
  </div>
`);

export function SwitchLanguage(): SwitchLanguageComponent {
  const root = view as SwitchLanguageComponent;
  const { enabled, select } = view.collect<RefNodes>(root);

  const setActiveLanguage = async () => {
    const enable = enabled.checked;
    const locale = select.value;

    // window.localStorage.setItem('__locale__', locale);

    void chrome.storage.local.set({
      enable,
      locale,
    });

    // @ts-expect-error - missing from @types/chrome, added Chrome v96
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await chrome.scripting.unregisterContentScripts();

    if (enable) {
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

      // @ts-expect-error - missing from @types/chrome, added Chrome v96
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
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
      select,
    );
  }

  enabled.onchange = setActiveLanguage;
  select.onchange = setActiveLanguage;

  void chrome.storage.local.get(null, (settings: UserSettings) => {
    enabled.checked = !!settings.enable;

    const locale = settings.locale || Intl.NumberFormat().resolvedOptions().locale;

    if (locale in locales) {
      select.value = locale;
    } else {
      const option = LanguageOption(locale, locale);
      option.selected = true;
      option.disabled = true;
      append(option, select);
    }
  });

  return root;
}
