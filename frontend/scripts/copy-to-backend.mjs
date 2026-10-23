// Copies the built frontend (dist/) into the Spring Boot app's static folder, so a single
// `mvn package` produces one jar that serves both the API and the UI.
import { cpSync, existsSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const from = resolve(root, 'dist');
const to = resolve(root, '..', 'backend', 'src', 'main', 'resources', 'static');

if (!existsSync(from)) {
  console.error('dist/ not found. The build did not produce any files.');
  process.exit(1);
}
if (!existsSync(resolve(root, '..', 'backend', 'src', 'main', 'resources'))) {
  console.error('Could not find ../backend/src/main/resources. Run this from the project\'s frontend/ folder.');
  process.exit(1);
}

rmSync(to, { recursive: true, force: true });
cpSync(from, to, { recursive: true });
console.log(`Copied the built frontend to ${to}`);
