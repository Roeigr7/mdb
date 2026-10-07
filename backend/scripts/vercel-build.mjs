import { spawn } from 'node:child_process';

const env = { ...process.env };
const directUrl =
  env.DATABASE_URL_UNPOOLED ||
  env.POSTGRES_URL_NON_POOLING ||
  env.DATABASE_URL;

if (directUrl) {
  env.DATABASE_URL = directUrl;
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', env });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} ${args.join(' ')} exited with ${code}`));
    });
  });
}

await run('npx', ['prisma', 'migrate', 'deploy']);
await run('npx', ['nest', 'build']);
