/* eslint-disable no-console */
/* eslint-disable unicorn/no-process-exit */

// TODO: If we want to collect coverage during e2e testing, we might need
// something custom like https://github.com/bricss/dopant/blob/master/test/fixtures/index.mjs

import fs from 'fs';
import path from 'path';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import {
  cleanupPage,
  DIST_DIR,
  E2ETestContext,
  renderPage,
  setup,
  sleep,
  teardown,
} from './utils';

const fileTest = suite('file');
const test = suite<E2ETestContext>('e2e');

// FIXME: Use hooks normally once issue is fixed -- https://github.com/lukeed/uvu/issues/80
// test.before(setup);
// test.after(teardown);
// test.after.each(cleanupPage);
test.before(async (context) => {
  try {
    await setup(context);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});
test.after(async (context) => {
  try {
    await teardown(context);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});
test.after.each(async (context) => {
  try {
    await cleanupPage(context);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});

for (const filename of [
  'content.js',
  'icon16.png',
  'icon48.png',
  'icon128.png',
  'manifest.json',
  'popup.css',
  'popup.html',
  'popup.js',
  'sw.js',
  'trackx.js',
]) {
  fileTest(`dist/${filename} exists`, () => {
    const filePath = path.join(DIST_DIR, filename);
    assert.ok(fs.statSync(filePath));
  });
}

// TODO: Run it against a real target page
//  ↳ But keep in mind it's currently not possible to test an action button
//    popup so this may be impossible without hacks

test('renders reader app', async (context) => {
  const { page } = await renderPage(
    context,
    'chrome-extension://fhemonmbahmafphlmegeiplebakacbll/popup.html',
  );
  // TODO: Better and more assertions
  // eslint-disable-next-line unicorn/no-await-expression-member
  assert.ok((await page.innerHTML('body')).length > 1500);
  assert.ok(await page.$('h1'));
  assert.ok(await page.$('#enabled'));
  assert.ok(await page.$('select'));
  assert.ok(await page.$('footer'));
  // eslint-disable-next-line unicorn/no-await-expression-member
  assert.is((await page.$$('option')).length, 22);
  await sleep(200);
  assert.is(context.unhandledErrors.length, 0, 'zero unhandled errors');
  assert.is(context.consoleMessages.length, 0, 'zero console messages');
});

fileTest.run();
test.run();
