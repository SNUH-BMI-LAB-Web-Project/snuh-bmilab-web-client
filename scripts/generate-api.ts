// eslint-disable-next-line @typescript-eslint/no-var-requires
const { execSync } = require('child_process');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { config } = require('dotenv');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

// CommonJS는 __dirname 그대로 사용 가능
config({ path: path.resolve(__dirname, '../.env.local') });

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is not set in .env.local');
}

const command = `openapi-generator-cli generate -i ${apiBaseUrl}/api-docs -g typescript-fetch -o src/generated-api --skip-validate-spec`;

console.log(`Running: ${command}`);
execSync(command, { stdio: 'inherit' });
