import type { BuildArtifact, BunPlugin } from 'bun';
import * as xcss from 'ekscss';
import * as lightningcss from 'lightningcss';
import { PurgeCSS } from 'purgecss';
import * as terser from 'terser';
import { createManifest } from './manifest.config';
import xcssConfig from './xcss.config';

const firefox = Bun.env.FIREFOX_BUILD;
const mode = Bun.env.NODE_ENV;
const dev = mode === 'development';

let css = '';

const extractCSS: BunPlugin = {
  name: 'extract-css',
  setup(build) {
    build.onLoad({ filter: /\.css$/ }, async (args) => {
      css += await Bun.file(args.path).text();
      return { contents: '' };
    });
    build.onLoad({ filter: /\.xcss$/ }, async (args) => {
      const source = await Bun.file(args.path).text();
      const compiled = xcss.compile(source, {
        from: args.path,
        globals: xcssConfig.globals,
        plugins: xcssConfig.plugins,
      });

      for (const warning of compiled.warnings) {
        console.error('XCSS:', warning.message);

        if (warning.file) {
          console.log(
            `  at ${[warning.file, warning.line, warning.column]
              .filter(Boolean)
              .join(':')}`,
          );
        }
      }

      css += compiled.css;
      return { contents: '' };
    });
  },
};

function makeHTML(jsPath: string, cssPath: string) {
  return `
    <!doctype html>
    <meta charset=utf-8>
    <meta name=google value=notranslate>
    <link href=${cssPath} rel=stylesheet>
    <script src=health.js defer></script>
    <script src=${jsPath} type=module></script>
  `
    .trim()
    .replaceAll(/\n\s*/g, '\n');
}

async function minifyCSS(artifact: BuildArtifact) {
  const jsCode = await artifact.text();
  const purged = await new PurgeCSS().purge({
    content: [{ extension: '.js', raw: jsCode }],
    css: [{ raw: css }],
    safelist: ['html', 'body'],
    blocklist: [
      'article',
      'aside',
      'blockquote',
      'break',
      // 'button',
      'canvas',
      'dd',
      'disabled',
      'dt',
      'embed',
      'figcaption',
      'figure',
      'footer',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'header',
      'hgroup',
      'hr',
      'iframe',
      'img',
      // 'input',
      // 'label',
      'link',
      'main',
      'nav',
      'ol',
      'pre',
      'section',
      // 'select',
      'source',
      'svg',
      'table',
      'textarea',
      'ul',
      ':disabled',
    ],
  });
  const minified = lightningcss.transform({
    filename: 'popup.css',
    code: Buffer.from(purged[0].css),
    minify: true,
    // Firefox ESR and Chrome stable
    targets: firefox ? { firefox: 115 << 16 } : { chrome: 117 << 16 }, // eslint-disable-line no-bitwise
  });

  for (const warning of minified.warnings) {
    console.error('CSS:', warning.message);
  }

  await Bun.write('dist/popup.css', minified.code);
}

async function minifyJS(artifact: BuildArtifact, nameCache: object) {
  let source = await artifact.text();

  // Improve joining vars; terser doesn't do this so we do it manually
  source = source.replaceAll('const ', 'let ');

  const result = await terser.minify(source, {
    ecma: 2020,
    module: true,
    nameCache,
    compress: {
      // Prevent functions being inlined
      reduce_funcs: false,
      hoist_funs: true,
      // XXX: Comment out to keep performance markers in non-dev builds for debugging
      pure_funcs: ['performance.mark', 'performance.measure'],
      passes: 2,
    },
    mangle: {
      properties: {
        regex: /^\$\$|^(__click)$/,
      },
    },
    format: {
      // Nice for debugging with no discernible difference in size or perf
      semicolons: false,
    },
  });

  await Bun.write(artifact.path, result.code ?? '');
}

console.time('prebuild');
await Bun.$`rm -rf dist`;
await Bun.$`cp -r static dist`;
console.timeEnd('prebuild');

// Extension manifest
console.time('manifest');
const manifest = createManifest();
const release = manifest.version_name ?? manifest.version;
if (firefox) {
  manifest.version_name = undefined;
  manifest.key = undefined;
}
await Bun.write('dist/manifest.json', JSON.stringify(manifest));
console.timeEnd('manifest');

// Popup app HTML
console.time('html');
await Bun.write('dist/popup.html', makeHTML('popup.js', 'popup.css'));
console.timeEnd('html');

// Popup app
console.time('build');
const out = await Bun.build({
  entrypoints: ['src/popup.ts', 'src/content.ts'],
  outdir: 'dist',
  target: 'browser',
  define: {
    'process.env.APP_RELEASE': JSON.stringify(release),
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
  loader: {
    '.svg': 'text',
  },
  plugins: [extractCSS],
  minify: !dev,
  sourcemap: dev ? 'external' : 'none',
});
console.timeEnd('build');
console.log(out);

// Background service worker
console.time('build2');
const out2 = await Bun.build({
  entrypoints: ['src/sw.ts'],
  outdir: 'dist',
  target: 'browser',
  define: {
    'process.env.APP_RELEASE': JSON.stringify(release),
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
  minify: !dev,
});
console.timeEnd('build2');
console.log(out2);

// Error tracking
console.time('build3');
const out3 = await Bun.build({
  entrypoints: ['src/health.ts'],
  outdir: 'dist',
  target: 'browser',
  define: {
    'process.env.APP_RELEASE': JSON.stringify(release),
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
  minify: !dev,
});
console.timeEnd('build3');
console.log(out3);

if (dev) {
  console.time('css');
  await Bun.write('dist/popup.css', css);
  console.timeEnd('css');
} else {
  console.time('minify:css');
  await minifyCSS(out.outputs[0]);
  console.timeEnd('minify:css');

  console.time('minify:js');
  const nameCache = {};
  await minifyJS(out.outputs[0], nameCache);
  await minifyJS(out.outputs[1], nameCache);
  await minifyJS(out2.outputs[0], nameCache);
  console.timeEnd('minify:js');
  console.log('## nameCache', nameCache);
}
