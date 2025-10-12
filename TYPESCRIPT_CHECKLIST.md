# TypeScript Development Checklist

## 🎯 Before Every Code Change

### 1. Parameter Handling
- [ ] **Unused Parameters**: Prefix with `_` (e.g., `_request: NextRequest`)
- [ ] **Optional Parameters**: Use proper types (`param?: Type` not `param: Type | undefined`)
- [ ] **Boolean Props**: Use nullish coalescing (`prop ?? false`) for optional booleans

### 2. Function Signatures
- [ ] **Return Types**: Always specify explicit return types
- [ ] **Parameter Types**: Use proper TypeScript types, not `any`
- [ ] **Optional Parameters**: Mark as optional with `?` when not required

### 3. Component Props
- [ ] **Interface Definitions**: Use `I` prefix for interfaces (`ITaskCardProps`)
- [ ] **Optional Props**: Mark with `?` and handle `undefined` cases
- [ ] **Boolean Props**: Ensure they're always `boolean`, never `boolean | undefined`

### 4. API Routes
- [ ] **Request Parameters**: Prefix unused with `_` (`_request: NextRequest`)
- [ ] **Response Types**: Use `NextResponse` with proper typing
- [ ] **Error Handling**: Proper error types and responses

## 🔧 Common Patterns

### Unused Parameters
```typescript
// ❌ Wrong
function handler(request: NextRequest) { ... }

// ✅ Correct
function handler(_request: NextRequest) { ... }
```

### Optional Boolean Props
```typescript
// ❌ Wrong
isNewTask={isNewTask}  // can be undefined

// ✅ Correct
isNewTask={isNewTask ?? false}  // always boolean
```

### Function Parameters
```typescript
// ❌ Wrong
function updateTask(id: string, updates: any) { ... }

// ✅ Correct
function updateTask(id: string, updates: Partial<Task>): Promise<void> { ... }
```

## 🚨 Strict Rules to Remember

1. **`noUnusedParameters: true`** - All unused parameters must be prefixed with `_`
2. **`exactOptionalPropertyTypes: true`** - Optional props cannot be `undefined`
3. **`noImplicitReturns: true`** - All code paths must return
4. **`noUnusedLocals: true`** - No unused variables

## 🔍 Pre-Commit Checklist

Before every commit, run:
```bash
npm run typecheck  # Check TypeScript
npm run lint       # Check ESLint
```

## 🎯 Vercel Build Requirements

Vercel uses the same strict TypeScript rules:
- All TypeScript errors must be fixed
- No unused parameters or variables
- Proper optional property handling
- Explicit return types

---

**Follow this checklist to prevent build failures!** 🎯✨
