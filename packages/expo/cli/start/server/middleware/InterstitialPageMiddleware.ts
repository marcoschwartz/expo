import { ExpoConfig, getConfig, getNameFromConfig } from '@expo/config';
import { getRuntimeVersionNullable } from '@expo/config-plugins/build/utils/Updates';
import { readFile } from 'fs/promises';
import resolveFrom from 'resolve-from';

import { disableResponseCache, ExpoMiddleware } from './ExpoMiddleware';
import { assertRuntimePlatform, parsePlatformHeader, RuntimePlatform } from './resolvePlatform';
import { ServerRequest, ServerResponse } from './server.types';

export const LoadingEndpoint = '/_expo/loading';

function getRuntimeVersion(exp: ExpoConfig, platform: 'android' | 'ios' | null) {
  if (!platform) {
    return 'Undetected';
  }

  return getRuntimeVersionNullable(exp, platform) ?? 'Undetected';
}

export class InterstitialPageMiddleware extends ExpoMiddleware {
  constructor(projectRoot: string) {
    super(projectRoot, [LoadingEndpoint]);
  }

  /** Get the template HTML page and inject values. */
  async _getPageAsync({
    appName,
    runtimeVersion,
  }: {
    appName: string;
    runtimeVersion: string | null;
  }) {
    let content = (
      await readFile(resolveFrom(this.projectRoot, 'expo/static/loading-page/index.html'))
    ).toString('utf-8');

    content = content.replace(/{{\s*AppName\s*}}/, appName ?? 'App');
    content = content.replace(/{{\s*RuntimeVersion\s*}}/, runtimeVersion);
    content = content.replace(/{{\s*Path\s*}}/, this.projectRoot);

    return content;
  }

  /** Get settings for the page from the project config. */
  _getProjectOptions(platform: RuntimePlatform): {
    appName: string;
    runtimeVersion: string | null;
  } {
    assertRuntimePlatform(platform);

    const { exp } = getConfig(this.projectRoot);
    const { appName } = getNameFromConfig(exp);
    const runtimeVersion = getRuntimeVersion(exp, platform);

    return {
      appName,
      runtimeVersion,
    };
  }

  async handleRequestAsync(req: ServerRequest, res: ServerResponse): Promise<void> {
    res = disableResponseCache(res);
    res.setHeader('Content-Type', 'text/html');

    const platform = parsePlatformHeader(req) || 'ios';
    assertRuntimePlatform(platform);

    const { appName, runtimeVersion } = this._getProjectOptions(platform);
    const content = await this._getPageAsync({ appName, runtimeVersion });
    res.end(content);
  }
}
