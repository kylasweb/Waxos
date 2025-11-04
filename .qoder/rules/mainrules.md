Project Structure: This is a monorepo.

apps/my-next-app is a Next.js 14 frontend.

apps/my-electron-app is the Electron.js desktop wrapper.

services/my-python-service is a Python/Flask API backend.

services/my-go-service is a Go microservice for high-performance tasks.

Code Style:

For all JavaScript/TypeScript, run npx eslint . --fix before committing.

For Python, run npx black . to format.

For Go, run go fmt ./... to format.

Dependencies:

Always use npm for Node.js packages.

Always add new Python packages to requirements.txt.

Testing:

Any new backend feature (Python or Go) must include a corresponding unit test.

Run tests using the npm run test:* scripts in the root package.json.