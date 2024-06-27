import './css/index.xcss';

import { append } from 'stage1';
import { Footer } from './components/Footer';
import { SwitchLanguage } from './components/SwitchLanguage';

declare global {
  interface HTMLElement {
    /** `stage1` synthetic click event handler. */
    __click?(event: MouseEvent): void;
  }
}

append(SwitchLanguage(), document.body);
append(Footer(), document.body);
