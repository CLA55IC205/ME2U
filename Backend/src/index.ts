import { assertEnv, env } from './config/env.js';
import { createApp } from './app.js';

assertEnv();

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`ME2U API listening on http://localhost:${env.port}`);
  console.log(`  Health:  GET /health`);
  console.log(`  Dev users: GET /api/dev/users`);
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `\nPort ${env.port} is already in use. Stop the other API process:\n` +
        `  fuser -k ${env.port}/tcp\n` +
        `Or set PORT=3002 in Backend/.env\n`,
    );
  } else {
    console.error(err);
  }
  process.exit(1);
});
