/* eslint-disable unicorn/prefer-string-replace-all */

// FIXME: Remove this file once no longer needed.

// FIXME: This is a convoluted workaround for a bug in the bun macro system,
// where it crashes when doing string literal template interpolation. See:
// https://github.com/oven-sh/bun/issues/3641
export function interpolate(text: string, values: string[]): string {
  let result = text;

  values.forEach((value, index) => {
    result = result.replace(new RegExp(`%%${String(index + 1)}%%`, 'g'), value);
  });

  return result;
}

// FIXME: This is a convoluted workaround for a bug in the bun macro system,
// where it crashes when doing string literal template interpolation. See:
// https://github.com/oven-sh/bun/issues/3641
export function decodeEntities(html: string): string {
  return html.replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(+code));
}
