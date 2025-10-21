# SaranOS Build Guide

This document provides comprehensive information about building SaranOS and troubleshooting common build issues.

## Prerequisites

- **Node.js**: Version 18.0.0 or higher (recommended: 20.x)
- **npm**: Version 8.0.0 or higher
- **Memory**: At least 4GB RAM recommended for builds
- **Disk Space**: At least 2GB free space

## Build Commands

### Development Build

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### CI/CD Build (optimized for GitHub Actions)

```bash
npm run build:ci
```

### Simple Build (without comprehensive checks)

```bash
npm run build:simple
```

## Build Process

The build process includes the following steps:

1. **Prerequisites Check**: Verifies Node.js version and dependencies
2. **Type Checking**: Runs TypeScript type checking
3. **Linting**: Runs ESLint and Stylelint (non-blocking)
4. **Testing**: Runs test suite (non-blocking)
5. **Prebuild**: Generates static files and indexes
6. **Build**: Creates optimized production build
7. **Verification**: Validates build output

## Environment Variables

Set these environment variables for optimal builds:

```bash
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
NODE_OPTIONS=--max-old-space-size=4096
```

## Common Build Issues

### 1. Memory Issues

**Error**: `JavaScript heap out of memory`

**Solution**:

```bash
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

### 2. TypeScript Errors

**Error**: Type checking failures

**Solution**:

```bash
npm run typecheck
# Fix the reported errors
npm run build
```

### 3. Dependency Issues

**Error**: Package installation failures

**Solution**:

```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### 4. Next.js Export Warnings

**Warning**: Headers not supported with static export

**Solution**: These warnings are expected and don't affect the build. The configuration has been optimized to minimize warnings.

## GitHub Actions

The project includes a comprehensive CI/CD pipeline:

- **Automatic builds** on push to main/master/develop branches
- **Pull request validation** with type checking, linting, and testing
- **Multi-Node.js version testing** (currently optimized for Node.js 20.x)
- **Build artifact upload** for deployment
- **Automatic deployment** to Vercel (when configured)

## Docker Build

For containerized builds:

```bash
docker build -t saranos .
docker run -p 3000:3000 saranos
```

## Performance Optimization

### Build Performance

- Uses `npm ci` for faster, reliable installs
- Implements dependency caching in CI/CD
- Optimized webpack configuration
- Parallel processing where possible

### Runtime Performance

- Static export for optimal performance
- Optimized bundle sizes
- Tree shaking enabled
- Code splitting implemented

## Troubleshooting

### Build Fails in GitHub Actions

1. **Check Node.js version**: Ensure using Node.js 20.x
2. **Memory issues**: Increase memory allocation
3. **Dependency conflicts**: Use `--legacy-peer-deps` flag
4. **Timeout issues**: Increase build timeout in workflow

### Local Build Issues

1. **Clear caches**:

   ```bash
   rm -rf .next out node_modules
   npm install --legacy-peer-deps
   ```

2. **Check system resources**:

   ```bash
   node --version
   npm --version
   free -h  # Linux/Mac
   ```

3. **Run individual steps**:
   ```bash
   npm run typecheck
   npm run lint
   npm run test
   npm run build:prebuild
   ```

## Build Output

Successful builds create:

- `out/` directory with static files
- `out/index.html` as the main entry point
- Optimized JavaScript and CSS bundles
- Static assets in `out/_next/static/`

## Support

For build issues:

1. Check this guide first
2. Review GitHub Actions logs
3. Check Node.js and npm versions
4. Verify system resources
5. Try the troubleshooting steps above

## Contributing

When contributing:

1. Ensure builds pass locally
2. Run `npm run build` before committing
3. Check that all tests pass
4. Verify type checking passes
5. Follow the established build process
