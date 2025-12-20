// Verifies native Firebase config files exist and are not placeholders.
// Fails the build fast so you don't ship without push/Firestore credentials.
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const files = [
  path.join(projectRoot, 'android', 'app', 'google-services.json'),
  path.join(projectRoot, 'ios', 'GoogleService-Info.plist'),
];

function fail(msg) {
  console.error(`\n[firebase-check] ${msg}\n`);
  process.exit(1);
}

files.forEach((file) => {
  if (!fs.existsSync(file)) {
    fail(`Missing required Firebase config: ${file}`);
  }
  const content = fs.readFileSync(file, 'utf8');
  if (!content || content.includes('REPLACE_ME') || content.length < 20) {
    fail(`Firebase config looks like a placeholder. Replace it: ${file}`);
  }
});

console.log('[firebase-check] Firebase configs present.');
