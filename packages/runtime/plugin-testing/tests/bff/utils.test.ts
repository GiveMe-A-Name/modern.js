/**
 * @jest-environment node
 */
import * as path from 'path';
import mockAPI from '../../src/cli/bff/mockAPI';
import { isBFFProject } from '../../src/cli/bff/utils';

describe('testing-plugin-bff utils', () => {
  test('isBFFProject', () => {
    const appDir = path.resolve(__dirname, './fixtures/bff1');
    expect(isBFFProject(appDir)).toBe(true);
    expect(mockAPI).toBeInstanceOf(Function);
  });
});
