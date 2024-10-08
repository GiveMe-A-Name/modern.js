import { pluginSwc } from '@rsbuild/plugin-webpack-swc';
import { describe, expect, it } from 'vitest';
import { createUniBuilder } from '../src';
import { matchRules, unwrapConfig } from './helper';

describe('plugins/styled-components', () => {
  it('should enable ssr when target contain node', async () => {
    const rsbuild = await createUniBuilder({
      bundlerType: 'webpack',
      cwd: '',
      config: {
        environments: {
          node: {
            output: {
              target: 'node',
            },
          },
          web: {
            output: {
              target: 'web',
            },
          },
        },
      },
    });

    const configs = await rsbuild.initConfigs();

    for (const config of configs) {
      expect(
        matchRules({
          config,
          testFile: 'a.js',
        }),
      ).toMatchSnapshot();
    }
  });

  it('should works in webpack babel mode', async () => {
    const rsbuild = await createUniBuilder({
      bundlerType: 'webpack',
      cwd: '',
      config: {},
    });

    const config = await unwrapConfig(rsbuild);

    expect(
      matchRules({
        config,
        testFile: 'a.js',
      }),
    ).toMatchSnapshot();
  });

  it('should works in webpack swc mode', async () => {
    const rsbuild = await createUniBuilder({
      bundlerType: 'webpack',
      cwd: '',
      config: {},
    });

    rsbuild.addPlugins([pluginSwc()]);
    const config = await unwrapConfig(rsbuild);

    expect(
      matchRules({
        config,
        testFile: 'a.js',
      }),
    ).toMatchSnapshot();
  });
});
