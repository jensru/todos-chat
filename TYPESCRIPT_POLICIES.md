# TypeScript Quality Policies

## 🎯 Overview
This document outlines our TypeScript quality policies to prevent build failures and maintain code quality.

## 🔧 Implemented Policies

### 1. Pre-Commit Hooks (Husky + lint-staged)
- **Location**: `package.json` → `husky` & `lint-staged`
- **What it does**: Runs TypeScript checks before every commit
- **Prevents**: Committing code with TypeScript errors

```bash
# Automatic checks on git commit:
- ESLint fixes
- TypeScript type checking (tsc --noEmit)
- Auto-fixes and re-adds files
```

### 2. Stricte TypeScript Configuration
- **Location**: `tsconfig.json`
- **What it does**: Enforces strict type checking
- **Rules**:
  - `noUnusedLocals`: No unused local variables
  - `noUnusedParameters`: No unused function parameters
  - `exactOptionalPropertyTypes`: Strict optional property types
  - `noImplicitReturns`: All code paths must return
  - `noFallthroughCasesInSwitch`: No fallthrough in switch cases

### 3. GitHub Actions CI/CD
- **Location**: `.github/workflows/typecheck.yml`
- **What it does**: Automatic checks on every push/PR
- **Checks**:
  - TypeScript compilation
  - ESLint validation
  - Build test

### 4. NPM Scripts
- **Location**: `package.json` → `scripts`
- **Available commands**:
  - `npm run typecheck`: Manual TypeScript check
  - `npm run pre-commit`: Run lint-staged manually

## 🚀 How to Use

### Development Workflow
1. **Write code** as usual
2. **Commit changes**: `git commit -m "your message"`
3. **Automatic checks** run before commit
4. **If errors**: Fix them and commit again
5. **If clean**: Commit succeeds

### Manual Checks
```bash
# Check TypeScript types
npm run typecheck

# Run linting
npm run lint

# Run pre-commit checks manually
npm run pre-commit
```

## 🎯 Benefits

### Prevents These Issues:
- ❌ TypeScript compilation errors in production
- ❌ Unused variables and parameters
- ❌ Missing return statements
- ❌ Implicit any types
- ❌ Build failures on Vercel

### Ensures:
- ✅ Clean, type-safe code
- ✅ Consistent code quality
- ✅ No build surprises
- ✅ Better developer experience

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Husky hooks, lint-staged config, npm scripts |
| `tsconfig.json` | Stricte TypeScript compiler options |
| `.github/workflows/typecheck.yml` | CI/CD pipeline |
| `TYPESCRIPT_POLICIES.md` | This documentation |

## 🚨 Troubleshooting

### If Pre-Commit Hooks Don't Work:
```bash
# Reinstall husky
npm install --save-dev husky
npx husky install
```

### If TypeScript Errors Appear:
1. Check the error message
2. Fix the type issues
3. Run `npm run typecheck` to verify
4. Commit again

### If GitHub Actions Fail:
1. Check the Actions tab in GitHub
2. Review the error logs
3. Fix issues locally
4. Push again

## 📝 Best Practices

1. **Always run typecheck locally** before pushing
2. **Fix TypeScript errors immediately** - don't ignore them
3. **Use proper types** instead of `any`
4. **Keep dependencies updated** for better type support
5. **Review CI/CD results** after pushing

## 🎯 Development Checklist

### Before Every Code Change:
- [ ] **Unused Parameters**: Prefix with `_` (e.g., `_request: NextRequest`)
- [ ] **Optional Boolean Props**: Use nullish coalescing (`prop ?? false`)
- [ ] **Function Return Types**: Always specify explicit return types
- [ ] **Interface Definitions**: Use `I` prefix for interfaces

### Common Patterns:
```typescript
// Unused parameters
function handler(_request: NextRequest) { ... }

// Optional boolean props
isNewTask={isNewTask ?? false}

// Proper function signatures
function updateTask(id: string, updates: Partial<Task>): Promise<void> { ... }
```

### Strict Rules:
- `noUnusedParameters: true` - Prefix unused params with `_`
- `exactOptionalPropertyTypes: true` - Optional props cannot be `undefined`
- `noImplicitReturns: true` - All code paths must return
- `noUnusedLocals: true` - No unused variables

---

**These policies ensure our codebase maintains high quality and prevents production build failures!** 🎯✨
