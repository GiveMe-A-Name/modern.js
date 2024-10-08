import { join } from 'path';
import { type RsbuildPlugin, logger } from '@rsbuild/core';
import type {
  UniBuilderContext,
  UniBuilderPlugin,
  UniBuilderPluginAPI,
} from '../types';

function addDeprecatedWarning(
  pluginName: string,
  name: string,
  newName?: string,
) {
  logger.warn(
    `Plugin(${pluginName})'s api '${name}' is deprecated${
      newName ? `, please use '${newName}' instead.` : '.'
    }`,
  );
}
export function compatLegacyPlugin(
  plugin: UniBuilderPlugin,
  extraInfo: {
    cwd: string;
  },
): RsbuildPlugin {
  return {
    ...plugin,
    setup: api => {
      const builderContext = new Proxy(api.context, {
        get(target, prop: keyof UniBuilderContext) {
          switch (prop) {
            case 'target':
              throw new Error(
                `Plugin(${plugin.name})'s api 'target' is deprecated, please use 'environment.config.output.target' instead.`,
              );
            case 'srcPath':
              addDeprecatedWarning(plugin.name, 'context.srcPath');
              return join(extraInfo.cwd, 'src');
            case 'framework':
              addDeprecatedWarning(plugin.name, 'context.framework');
              return '';
            case 'entry':
              throw new Error(
                `Plugin(${plugin.name})'s api 'entry' is deprecated, please use 'environment.entry' instead.`,
              );
            default: {
              if (prop in target) {
                return target[prop];
              } else {
                return undefined;
              }
            }
          }
        },
        set(_target, prop: keyof UniBuilderContext) {
          logger.error(
            `Context is readonly, you can not assign to the "context.${prop}" prop.`,
          );
          return true;
        },
      }) as UniBuilderContext;

      const legacyAPI: UniBuilderPluginAPI = {
        ...api,
        context: builderContext,
        getBuilderConfig: () => {
          addDeprecatedWarning(
            plugin.name,
            'getBuilderConfig',
            'getRsbuildConfig',
          );
          return api.getRsbuildConfig();
        },
        modifyBuilderConfig: fn => {
          api.modifyRsbuildConfig((config, { mergeRsbuildConfig }) => {
            addDeprecatedWarning(
              plugin.name,
              'modifyBuilderConfig',
              'modifyRsbuildConfig',
            );
            // @ts-expect-error
            // rsbuild is not completely consistent with modern.js builder config type
            return fn(config, { mergeBuilderConfig: mergeRsbuildConfig });
          });
        },
      };
      return plugin.setup(legacyAPI);
    },
  };
}
