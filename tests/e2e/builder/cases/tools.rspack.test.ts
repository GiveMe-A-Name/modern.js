import { join } from 'path';
import { expect, test } from '@modern-js/e2e/playwright';
import { build, getHrefByEntryName } from '../scripts/shared';

const fixtures = __dirname;

test('tools.rspack', async ({ page }) => {
  const builder = await build({
    cwd: join(fixtures, 'source/global-vars'),
    entry: {
      main: join(fixtures, 'source/global-vars/src/index.ts'),
    },
    runServer: true,
    builderConfig: {
      source: {
        define: {
          ENABLE_TEST: JSON.stringify(true),
        },
      },
    },
  });

  await page.goto(getHrefByEntryName('main', builder.port));

  const testEl = page.locator('#test-el');
  await expect(testEl).toHaveText('aaaaa');

  builder.close();
});
