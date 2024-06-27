import './Footer.xcss';

import { h } from 'stage1';
import { compile } from 'stage1/macro' assert { type: 'macro' };
import { decodeEntities } from '../macros' assert { type: 'macro' };

export type FooterComponent = HTMLElement;

// FIXME: Crashes with SIGSEGV when interpolating process.env.APP_RELEASE template expression
// const meta = compile(`
//   <footer>
//     © <a href=https://maxmilton.com class="normal muted" target=_blank>Max Milton</a> ・ v${process.env.APP_RELEASE} ・ <a href=https://github.com/maxmilton/switch-language/issues target=_blank>report bug</a>
//   </footer>
// `);
// const view = h<FooterComponent>(meta.html);
const meta = compile(
  // FIXME: This is an alternative workaround for the bun macro bug. See: https://github.com/oven-sh/bun/issues/3830
  decodeEntities(`
    <footer>&#169; <a href=https://maxmilton.com class="normal muted" target=_blank>Max Milton</a> &#12539; v${process.env.APP_RELEASE!} &#12539; <a href=https://github.com/maxmilton/switch-language/issues target=_blank>report bug</a>
    </footer>
  `),
  { keepSpaces: true },
);

export function Footer(): FooterComponent {
  return h<FooterComponent>(meta.html);
}
