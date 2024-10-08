import {spawn} from 'child_process';
import path from 'path';

import '..';

import '../../../runtime/__tests__/all.test';
import {runTests, E2eTestEnvironment} from '../../__e2etests__/e2e-runner.test';

const webApiAppPort = '8888';
// This value must match the one in ./wrangler.toml
const dummyServerPort = '8889';

// We should also try running this on a different environment that implements the Web API for better coverage.
const webApiEnvironment: E2eTestEnvironment = {
  name: 'Web API',
  domain: `http://localhost:${webApiAppPort}`,
  dummyServerPort,
  process: spawn(
    'pnpm',
    [
      'wrangler',
      'dev',
      '-c',
      path.join(__dirname, './wrangler.toml'),
      '--port',
      `${webApiAppPort}`,
      '--inspector-port',
      '9259',
      'bundle/test-web-api-app.mjs',
    ],
    {
      detached: true,
      stdio: process.env.SHOPIFY_E2E_TEST_DEBUG ? 'inherit' : undefined, // eslint-disable-line no-process-env
    },
  ),
  testable: true,
  ready: false,
};

runTests(webApiEnvironment);
