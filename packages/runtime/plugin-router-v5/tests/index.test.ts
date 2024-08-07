import { AppContext, manager } from '@modern-js/core';
import RuntimePlugin from '@modern-js/runtime/cli';
import plugin, { useHistory, useParams } from '../src';
import cliPlugin from '../src/cli';

describe('plugin-router-legacy', () => {
  it('default', () => {
    expect(plugin).toBeDefined();
    expect(useHistory).toBeDefined();
    expect(useParams).toBeDefined();
  });
});

describe('cli-router-legacy', () => {
  const main = manager.clone().usePlugin(RuntimePlugin, cliPlugin as any);
  let runner: any;

  beforeAll(async () => {
    runner = await main.init();
  });

  test('should plugin-router-legacy defined', async () => {
    expect(cliPlugin).toBeDefined();
  });

  it('plugin-router-legacy cli config is defined', async () => {
    AppContext.set({ metaName: 'modern-js' } as any);
    const config = await runner.config();
    expect(
      config.find(
        (item: any) => item.source.alias['@modern-js/runtime/plugins'],
      ),
    ).toBeTruthy();
  });
});
