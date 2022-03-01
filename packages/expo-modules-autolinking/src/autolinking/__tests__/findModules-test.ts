import glob from 'fast-glob';
import findUp from 'find-up';
import fs from 'fs-extra';
import path from 'path';

import type { findModulesAsync as findModulesAsyncType } from '../findModules';

const expoRoot = path.join(__dirname, '..', '..', '..', '..', '..');

jest.mock('fast-glob');
jest.mock('find-up');
jest.mock('fs-extra');
(findUp.sync as jest.MockedFunction<any>).mockReturnValueOnce(path.join(expoRoot, 'package.json'));

const {
  findModulesAsync,
}: { findModulesAsync: typeof findModulesAsyncType } = require('../findModules');

describe(findModulesAsync, () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should link top level package', async () => {
    (fs.realpath as jest.MockedFunction<any>).mockImplementation((path) => Promise.resolve(path));

    const libPkgDir = path.join('node_modules', 'react-native-third-party');
    jest.doMock(
      path.join(expoRoot, libPkgDir, 'package.json'),
      () => ({
        name: 'react-native-third-party',
        version: '0.0.1',
      }),
      { virtual: true }
    );

    jest.doMock(
      path.join(expoRoot, libPkgDir, 'expo-module.config.json'),
      () => ({
        platforms: ['ios'],
      }),
      { virtual: true }
    );
    (glob as jest.MockedFunction<any>).mockReturnValueOnce(
      Promise.resolve(['react-native-third-party/expo-module.config.json'])
    );

    const result = await findModulesAsync({
      searchPaths: [path.join(expoRoot, 'node_modules')],
      platform: 'ios',
    });
    expect(result['react-native-third-party']).toBeTruthy();
  });

  it('should link scoped level package', async () => {
    (fs.realpath as jest.MockedFunction<any>).mockImplementation((path) => Promise.resolve(path));

    // react-native-third-party
    const libPkgDir1 = path.join('node_modules', 'react-native-third-party');
    jest.doMock(
      path.join(expoRoot, libPkgDir1, 'package.json'),
      () => ({
        name: 'react-native-third-party',
        version: '0.0.1',
      }),
      { virtual: true }
    );
    jest.doMock(
      path.join(expoRoot, libPkgDir1, 'expo-module.config.json'),
      () => ({
        platforms: ['ios'],
      }),
      { virtual: true }
    );

    // @expo/expo-test
    const libPkgDir2 = path.join('node_modules', '@expo', 'expo-test');
    jest.doMock(
      path.join(expoRoot, libPkgDir2, 'package.json'),
      () => ({
        name: '@expo/expo-test',
        version: '0.0.1',
      }),
      { virtual: true }
    );
    jest.doMock(
      path.join(expoRoot, libPkgDir2, 'expo-module.config.json'),
      () => ({
        platforms: ['ios'],
      }),
      { virtual: true }
    );

    (glob as jest.MockedFunction<any>).mockReturnValueOnce(
      Promise.resolve([
        'react-native-third-party/expo-module.config.json',
        '@expo/expo-test/expo-module.config.json',
      ])
    );

    const result = await findModulesAsync({
      searchPaths: [path.join(expoRoot, 'node_modules')],
      platform: 'ios',
    });
    expect(Object.keys(result).length).toBe(2);
  });
});
