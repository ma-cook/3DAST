# Bracket-Based Type Detection Fix

## Issue
The parser was incorrectly identifying node types for bracket-based syntax, causing nodes to fall back to `type: component` instead of their correct types.

## Root Cause
The regex pattern matching order in `parseNodeDefinition()` and `parseGeometry()` was incorrect:
- Single bracket patterns `[...]` were checked **before** double bracket patterns `[[...]]`
- Single parenthesis patterns `(...)` were checked **before** double parenthesis patterns `((...))` 
- Since `[[Store: name]]` contains `[` and `]`, it matched the single bracket pattern first
- Similarly, `((Service: name))` matched single parenthesis patterns first

## Solution
Reordered the regex patterns to check double brackets **before** single brackets:

### Before (incorrect order):
```typescript
const patterns = [
  /^([A-Za-z0-9_]+)\[([^:]+):\s*([^\]]+)\]/,        // Single [ ] - checked FIRST ❌
  /^([A-Za-z0-9_]+)\{([^:]+):\s*([^\}]+)\}/,
  /^([A-Za-z0-9_]+)\(\(([^:]+):\s*([^\)]+)\)\)/,
  /^([A-Za-z0-9_]+)<([^:]+):\s*([^>]+)>/,
  /^([A-Za-z0-9_]+)\[\[([^:]+):\s*([^\]]+)\]\]/,    // Double [[ ]] - checked LAST ❌
];
```

### After (correct order):
```typescript
const patterns = [
  /^([A-Za-z0-9_]+)\[\[([^:]+):\s*([^\]]+)\]\]/,    // Double [[ ]] - checked FIRST ✅
  /^([A-Za-z0-9_]+)\(\(([^:]+):\s*([^\)]+)\)\)/,    // Double (( )) - checked SECOND ✅
  /^([A-Za-z0-9_]+)\[([^:]+):\s*([^\]]+)\]/,        // Single [ ]
  /^([A-Za-z0-9_]+)\{([^:]+):\s*([^\}]+)\}/,
  /^([A-Za-z0-9_]+)<([^:]+):\s*([^>]+)>/,
];
```

## Files Modified
1. **src/parser/mermaid-parser.ts**
   - `parseNodeDefinition()` - Reordered regex patterns
   - `parseGeometry()` - Reordered bracket checks with comments

## Test Results
All node types now correctly detected:

| Input | Type | Geometry | Status |
|-------|------|----------|--------|
| `{Component: ...}` | component | dodecahedron | ✅ |
| `[Function: ...]` | function | cube | ✅ |
| `[Hook: ...]` | hook | cube | ✅ |
| `[[Store: ...]]` | store | cube | ✅ **FIXED** |
| `((Service: ...))` | service | tetrahedron | ✅ **FIXED** |
| `<Library: ...>` | library | cube | ✅ |

## Verification
Run the test file to verify:
```bash
npm run build
node test-node-detection.js
```

All 6 tests should pass.

## Impact
- **Stores** (`[[Store: ...]]`) now correctly identified as `type: store` instead of `type: component`
- **Services** (`((Service: ...))`) now correctly identified as `type: service` instead of `type: component`
- Geometry detection was already working but is now more efficient with proper ordering
- All bracket-based syntax patterns work as documented in README.md

## Version
Fixed in version 1.0.17
