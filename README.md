[![Build status](https://img.shields.io/github/workflow/status/maxmilton/switch-language/ci)](https://github.com/maxmilton/switch-language/actions)
[![Coverage status](https://img.shields.io/codeclimate/coverage/maxmilton/switch-language)](https://codeclimate.com/github/maxmilton/switch-language)
[![Chrome Web Store version](https://img.shields.io/chrome-web-store/v/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.svg)](https://chrome.google.com/webstore/detail/switch-language/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)
[![Licence](https://img.shields.io/github/license/maxmilton/switch-language.svg)](https://github.com/maxmilton/switch-language/blob/master/LICENSE)

# Switch Language ![](./static/icon48.png)

Switch web page language browser extension. Simple to use and a no-nonsense user experience.

Although there are existing Chrome extensions with similar functionality, they either don't work, use old technology resulting in poor performance, are questionably large, or have no tests.

[![Add to Chrome](https://storage.googleapis.com/chrome-gcs-uploader.appspot.com/image/WlD8wC6g8khYWPJUsQceQkhXSlv1/mPGKYBIR2uCP0ApchDXE.png)](https://chrome.google.com/webstore/detail/switch-language/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)

### Features

- Change web request `Accept-Language` header
- Change `window.navigator.language`
- Change `window.navigator.languages`

### Technology

- [ekscss](https://github.com/maxmilton/ekscss) style preprocessor
- [stage1](https://github.com/maxmilton/stage1) JavaScript framework
- [esbuild](https://esbuild.github.io/) JavaScript bundler

## Browser support

Recent versions of Google Chrome and other Chromium-based browsers (e.g., Brave, Edge).

## Bugs

Report any bugs you encounter on the [GitHub issue tracker](https://github.com/maxmilton/switch-language/issues).

### Known issues

1. Brave browser forcefully sets the `Accept-Language` header to `en-US,en` when the "block fingerprinting" option is set to "Strict, may break sites". This is an intentional privacy feature of Brave. When using this extension, you need to disable block fingerprinting by going to the site shield settings (Brave icon) > Advanced controls > set "Allow fingerprinting".

## License

MIT license. See [LICENSE](https://github.com/maxmilton/switch-language/blob/master/LICENSE).

The [globe icon](https://github.com/twitter/twemoji/blob/master/assets/svg/1f310.svg) is from [twitter/twemoji](https://github.com/twitter/twemoji) which is licensed CC-BY 4.0.

---

© 2022 [Max Milton](https://maxmilton.com)
