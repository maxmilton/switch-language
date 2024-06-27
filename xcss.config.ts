// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck 😢
/* eslint-disable @typescript-eslint/no-unsafe-return */

// FIXME: Fix ekscss compiler types then remove ts-nocheck

import framework from '@ekscss/framework/config';
import { extend, preloadApply } from '@ekscss/framework/utils';
import { type Middleware, ctx, onBeforeBuild, xcss } from 'ekscss';

// Generate references so #apply can be used in any file
onBeforeBuild(preloadApply);

onBeforeBuild(() => {
  // Cheeky abuse of ekscss ctx to stop unwanted style imports
  ctx.dependencies.push(
    import.meta.resolveSync('@ekscss/framework/level2/a11y.xcss'),
  );
});

const app: Middleware = (element) => {
  // Fix app height not resizing
  if (
    element.type === 'rule' &&
    element.value === 'html,body' &&
    element.children[0].value === 'min-height:100vh;'
  ) {
    // Remove element from output result
    // eslint-disable-next-line no-param-reassign
    element.type = 'comm';
  }
};

export default extend(framework, {
  // Replace framework.plugins[2] (@ekscss/plugin-prefix) with our app plugin
  // XXX: This may break when @ekscss/framework is updated!
  plugins: [framework.plugins[0], framework.plugins[1], app],

  globals: {
    // fontStack: '', // chrome injects decent font-family value in extensions
    // fontStack: 'Inter, sans-serif',
    textSize: '15px',

    media: { ns: '', m: '', l: '' }, // not a responsive app

    // color: {
    //   primary: (x) => x.color.forest3,
    //   // linkHover: (x) => x.color.forest2,
    //   linkHover: (x) => x.color.forest4,
    // },

    // form: {
    //   checkboxCheckedBackgroundColor: (x) => x.color.forest3,
    //   checkboxCheckedBorderColor: (x) => x.color.forest2,
    // },

    // button: {
    //   primary: {
    //     backgroundColorFrom: (x) => x.color.forest2,
    //     backgroundColorTo: (x) => x.color.forest1,
    //     borderColor: (x) => x.color.forest1,
    //     hoverBackgroundColor: (x) => x.color.forest1,
    //   },
    // },

    color: {
      primary: (x) => x.color.rose4,
      background: (x) => x.color.black,
      text: (x) => x.color.light1,
      muted: (x) => x.color.gray2,
      linkHover: (x) => x.color.rose5,
    },

    input: {
      textColor: (x) => x.color.light2,
      backgroundColor: 'transparent',
      outlineSize: '2px',
      border: (x) => xcss`1px solid ${x.color.gray1}`,
      hoverBorderColor: (x) => x.color.gray4,
      disabledBackgroundColor: 'transparent',
      disabledBorder: (x) => x.color.dark3,
    },

    // tag: {
    //   textColor: (x) => x.color.dark5,
    //   // backgroundColor: (x) => x.color.light3,
    //   marginBetween: '0.6em',
    // },

    app: {
      width: '410px',
    },
  },
});
