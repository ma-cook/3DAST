# Hook Support - Implementation Summary

## Overview

Added full support for React hooks and custom hooks as a new node type in the 3D AST Generator.

## Changes Made

### 1. NodeType Enum (`src/types/ast.ts`)

- Added `HOOK = 'hook'` to the NodeType enum
- Hooks are now a first-class node type alongside Functions, Components, etc.

### 2. Parser (`src/parser/mermaid-parser.ts`)

- Added hook parsing in `parseNodeType()` method
- Syntax: `[Hook: hookName]` uses square brackets like functions
- Parser automatically detects "Hook:" label and assigns HOOK type

### 3. Node Model (`src/models/node.ts`)

- Added hook color mapping: `#E91E63` (pink/magenta)
- Hooks render as cubes (same geometry as functions)

### 4. Helpers (`src/utils/helpers.ts`)

- Added "Hook" to display name mappings
- Proper TypeScript type safety for all node types

### 5. Documentation (`README.md`)

- Added Hook syntax to Node Types & Geometries table
- Updated comprehensive examples to include hooks
- Added hook usage to "Generated 3D Objects" section

### 6. Examples

- Created `examples/react-hooks-architecture.md` with:
  - Complete React app with hooks
  - E-commerce app with hooks
  - Form management with hooks
  - Best practices for hook visualization

### 7. Tests

- Created `test-hooks.js` demonstrating hook parsing
- Verified hooks are correctly identified as cubes
- Verified hook color is #E91E63 (pink)

## Syntax

### Basic Hook Definition

```merfolk
useAuth[Hook: useAuth]
useUser[Hook: useUser]
useTheme[Hook: useTheme]
```

### Hook Connections

```merfolk
%% Hook to component
useAuth --> LoginForm : "provides auth state"

%% Hook composition
useUser --> useAuth : "requires auth"

%% Hook to store
useAuth --> AuthStore : "reads/writes"
```

## Geometry & Color Mapping

| Node Type | Syntax              | Geometry     | Color  | Hex Code |
| --------- | ------------------- | ------------ | ------ | -------- |
| Hook      | `[Hook: name]`      | Cube         | Pink   | #E91E63  |
| Function  | `[Function: name]`  | Cube         | Green  | #4CAF50  |
| Component | `{Component: name}` | Dodecahedron | Blue   | #2196F3  |
| Store     | `[[Store: name]]`   | Cube         | Purple | #9C27B0  |
| Service   | `((Service: name))` | Tetrahedron  | Orange | #FF9800  |
| Library   | `<Library: name>`   | Cube         | Cyan   | #00BCD4  |

## Use Cases

### 1. React Custom Hooks

```merfolk
useAuth[Hook: useAuth]
useLocalStorage[Hook: useLocalStorage]
useDebounce[Hook: useDebounce]
```

### 2. Hook Composition

```merfolk
useAuth[Hook: useAuth]
useLocalStorage[Hook: useLocalStorage]
useAuth --> useLocalStorage : "persists token"
```

### 3. Component Integration

```merfolk
LoginForm{Component: Login Form}
useAuth[Hook: useAuth]
handleLogin[Function: Handle Login]

useAuth --> LoginForm : "provides auth state"
handleLogin --> LoginForm : "handles submit"
```

### 4. State Management

```merfolk
useCart[Hook: useCart]
CartStore[[Store: Cart Store]]
useCart --> CartStore : "manages cart state"
```

## Test Results

```
✓ useAuth: geometry=cube, color=#E91E63
✓ useUser: geometry=cube, color=#E91E63
✓ useLocalStorage: geometry=cube, color=#E91E63
✓ useTheme: geometry=cube, color=#E91E63

✅ All hooks correctly identified as cubes with pink color
```

## Breaking Changes

None - this is a backward-compatible addition.

## Future Enhancements

- Add automatic hook nesting in components (similar to function nesting)
- Add hook dependency visualization
- Add React built-in hooks (useState, useEffect, etc.) as library hooks

## Version

Added in version 1.0.15+
