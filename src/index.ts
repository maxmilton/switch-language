import './css/index.xcss';

import { append } from 'stage1';
import { Footer } from './components/Footer';
import { LocaleSwitch } from './components/Switcher';

append(LocaleSwitch(), document.body);
append(Footer(), document.body);
