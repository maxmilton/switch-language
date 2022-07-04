/* eslint-disable no-console, unicorn/no-process-exit */

import { test } from 'uvu';
import * as assert from 'uvu/assert';
import locales from '../src/locales.json';
import {
  mocksSetup, mocksTeardown, setup, sleep, teardown,
} from './utils';

// FIXME: Use hooks normally once issue is fixed -- https://github.com/lukeed/uvu/issues/80
// test.before.each(setup);
// test.before.each(mocksSetup);
// test.after.each(mocksTeardown);
// test.after.each(teardown);
test.before.each(() => {
  try {
    setup();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});
test.before.each(() => {
  try {
    mocksSetup();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});
test.after.each(() => {
  try {
    mocksTeardown();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});
test.after.each(() => {
  try {
    teardown();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});

test('renders entire popup app', async () => {
  // eslint-disable-next-line global-require
  require('../dist/popup.js');

  // TODO: Better assertions
  assert.is(document.body.innerHTML.length > 1000, true, 'has content');
  const firstNode = document.body.firstChild as HTMLDivElement;
  assert.instance(firstNode, window.HTMLDivElement);
  assert.ok(document.body.querySelector('h1'));
  assert.is(document.body.querySelector('h1')?.textContent, 'Switch Language');
  assert.ok(document.body.querySelector('input#enabled'));
  assert.ok(document.body.querySelector('select.select'));
  assert.is(
    document.body.querySelectorAll('option').length,
    Object.keys(locales).length,
  );
  assert.ok(document.body.querySelectorAll('option').length > 20);

  // Wait for timers/Promises within the app to finish
  await sleep(4);
});

test.run();
