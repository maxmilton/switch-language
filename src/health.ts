/**
 * Track JavaScript exceptions with the trackx client.
 *
 * @fileoverview In Chrome extensions v3 running remote code is not allowed so
 * trackx via CDN would not work + loading local code is obviously much faster.
 *
 * Since the runtime environment will be modern browsers the lite client is OK.
 */

import * as trackx from 'trackx/lite';

trackx.setup('https://api.trackx.app/v1/j8a84q08rm5');
trackx.meta.release = process.env.APP_RELEASE;

if (process.env.NODE_ENV !== 'production') {
  trackx.meta.NODE_ENV = process.env.NODE_ENV ?? 'NULL';
}

void fetch('https://api.trackx.app/v1/j8a84q08rm5/ping', {
  method: 'POST',
  keepalive: true,
  mode: 'no-cors',
});
