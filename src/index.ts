import './css/index.xcss';

import { append } from 'stage1';
import { Footer } from './components/Footer';
import { SwitchLanguage } from './components/SwitchLanguage';

append(SwitchLanguage(), document.body);
append(Footer(), document.body);
