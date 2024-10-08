import * as path from 'path';
import { expect, test } from '@modern-js/e2e/playwright';
import { pluginSwc } from '@rsbuild/plugin-webpack-swc';
import { build, getHrefByEntryName } from '@scripts/shared';

test('should run top level await correctly when using SWC', async ({
  page,
}) => {
  const builder = await build({
    cwd: __dirname,
    entry: {
      index: path.resolve(__dirname, './src/index.ts'),
    },
    builderConfig: {
      output: {
        distPath: {
          root: 'dist-swc',
        },
      },
    },
    plugins: [pluginSwc()],
    runServer: true,
  });

  await page.goto(getHrefByEntryName('index', builder.port));

  expect(await page.evaluate('window.foo')).toEqual('hello');

  builder.close();
});
