import { assertEnv, env } from './config/env.js';
import { createApp } from './app.js';

assertEnv();

const app = createApp();

app.listen(env.port, () => {
  console.log(`ME2U API listening on http://localhost:${env.port}`);
  console.log(`  Health:  GET /health`);
  console.log(`  Dev users: GET /api/dev/users`);
});
