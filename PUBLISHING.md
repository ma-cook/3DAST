# Publishing 3D-AST-Generator to NPM

Follow these steps to publish your package to npm and make it installable via `npm install`.

## Prerequisites

1. **npm account**: Create an account at [npmjs.com](https://www.npmjs.com/)
2. **Git repository**: Push your code to GitHub (optional but recommended)
3. **Node.js**: Ensure you have Node.js 16+ installed

## Step 1: Update Package Information

1. **Update author info** in `package.json`:

   ```json
   "author": "Your Name <your.email@example.com>",
   ```

2. **Update repository URLs** (replace `yourusername` with your GitHub username):

   ```json
   "repository": {
     "type": "git",
     "url": "git+https://github.com/yourusername/3d-ast-generator.git"
   },
   "bugs": {
     "url": "https://github.com/yourusername/3d-ast-generator/issues"
   },
   "homepage": "https://github.com/yourusername/3d-ast-generator#readme"
   ```

3. **Choose a unique package name** if `3d-ast-generator` is taken:
   ```json
   "name": "@yourusername/3d-ast-generator",
   ```
   or
   ```json
   "name": "merfolk-3d-diagrams",
   ```

## Step 2: Build and Test

```bash
# Clean previous builds
npm run clean

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Test the CLI locally
node dist/cli.js --help
```

## Step 3: Login to NPM

```bash
# Login to npm (you'll be prompted for username, password, email)
npm login

# Verify you're logged in
npm whoami
```

## Step 4: Check Package Before Publishing

```bash
# See what files will be included in the package
npm pack --dry-run

# This shows you exactly what will be published
# Make sure dist/ folder and README.md are included
```

## Step 5: Publish to NPM

```bash
# For first-time publishing
npm publish

# For scoped packages (if using @yourusername/package-name)
npm publish --access public
```

## Step 6: Verify Publication

1. **Check npm website**: Visit `https://www.npmjs.com/package/your-package-name`
2. **Test installation**:

   ```bash
   # Create a test project
   mkdir test-install
   cd test-install
   npm init -y

   # Install your published package
   npm install 3d-ast-generator

   # Test import
   node -e "console.log(require('3d-ast-generator'))"
   ```

## Step 7: Using in Your 3D Application

Once published, users can install it:

```bash
# Install your package
npm install 3d-ast-generator

# If you published as scoped package
npm install @yourusername/3d-ast-generator

# Install with Three.js for 3D functionality
npm install 3d-ast-generator three @types/three
```

## Usage in Applications

```typescript
// Import the package
import { MerfolkDiagramBuilder, AST3DGenerator } from '3d-ast-generator';
import * as THREE from 'three';

// Use in your 3D application
const scene = new THREE.Scene();
const builder = new MerfolkDiagramBuilder(scene);

// Upload and process markdown files
const result = await builder.uploadMarkdownFile(file);
```

## Version Updates

For future updates:

```bash
# Update version
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0

# Publish updated version
npm publish
```

## Troubleshooting

### Package Name Already Taken

If `3d-ast-generator` is taken, try:

- `@yourusername/3d-ast-generator` (scoped package)
- `merfolk-diagrams`
- `3d-merfolk-ast`
- `spatial-ast-generator`

### Publishing Errors

```bash
# Check if you're logged in
npm whoami

# Check package name availability
npm view your-package-name

# Force publish if needed (not recommended)
npm publish --force
```

### Build Errors

```bash
# Clean and rebuild
npm run clean
npm run build

# Check TypeScript compilation
npx tsc --noEmit
```

## Alternative: GitHub Packages

You can also publish to GitHub Packages instead of npm:

```bash
# Login to GitHub Packages
npm login --registry=https://npm.pkg.github.com

# Update package.json
"publishConfig": {
  "registry": "https://npm.pkg.github.com"
}

# Publish
npm publish
```

## Example Complete Workflow

```bash
# 1. Final check
npm run build
npm test

# 2. Login to npm
npm login

# 3. Publish
npm publish

# 4. Test installation
mkdir ../test-project
cd ../test-project
npm init -y
npm install 3d-ast-generator
node -e "console.log(require('3d-ast-generator'))"

# Success! Your package is now available via npm install
```

Your package will then be available at `https://www.npmjs.com/package/3d-ast-generator` and anyone can install it with `npm install 3d-ast-generator`!
