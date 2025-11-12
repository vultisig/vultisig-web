# Vultisig Web App - Review

**Review Date:** 2025-11-01  
**Reviewer:** mvpcrazy  
**Project:** Vultisig Web App (React + TypeScript)

---

## Summary

This is a **functional React/TypeScript application** with a solid foundation, but it has several areas that need improvement in terms of code quality, maintainability, and best practices. The project demonstrates good use of modern tooling (Vite, TypeScript, SCSS) but suffers from inconsistent patterns, missing error handling, and lack of testing infrastructure.

## Strengths (PROS)

- Clear separation of concerns
- Easy to navigate and find files
- Scalable architecture
- Consistent file organization
- Comprehensive TypeScript interfaces defined
- Strict mode enabled in tsconfig
- Type definitions for external libraries
- Proper use of enums and constants
- Centralized API module with axios

---

## Issues (CONS)

### 1. **State Management Issues**

**Problems:**
- Large, complex state variables in layouts (vault layout has 600+ lines)
- Prop drilling through multiple levels
- Difficult to track state changes

**Example:**
```typescript
// layouts/vault/index.tsx - 642 lines!
const Component: FC = () => {
  const initialState: InitialState = {
    tokens: defTokens,
    vaults: [],
  };
  const [state, setState] = useState(initialState);
  // 600+ lines of logic mixing:
  // - State management
  // - API calls
  // - Business logic
  // - Side effects
  // - Event handlers
};
```

**Solution: Refactored and committed** 
I'm a big fan of creating custom hooks to separate out state management logic(data processing layer) from the rendering logic.
So, here's my suggested solution:
- Refactored src/layouts/vault/index.tsx and pushed the changes.
- Refactored src/components/header/index.tsx and pushed the changes.
As a result, refactored LOC of the vault/index.tsx file is now 108(previously was over 600+).

---

### 2. ** NO TESTING INFRASTRUCTURE** (Critical Priority)

**Problem:** No test framework, no test files, no test scripts

```json
// package.json - Missing test scripts
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
    // No "test" script
  }
}
```

**Missing:**
- No Jest, Vitest, or React Testing Library
- No unit tests for utilities, components, or hooks
- No integration tests for critical flows
- No E2E tests for user journeys

**Impact:** 
- High risk for regressions
- No confidence when refactoring
- Bugs discovered only in production
- Difficult to onboard new developers

### 3. **Poor Error Handling**

**Problem:** Missing error handlers on promises and no error boundaries

```typescript
// BAD: No error handling 
// src/context/index.tsx:106-121
const componentDidMount = () => {
  i18n.changeLanguage(language);

  api.seasons.get().then((data) => {
    setState((prevState) => ({
      ...prevState,
      loaded: true,
      seasonInfo: data,
    }));
  }); // No .catch()

  api.coin.value(825, currency).then((baseValue) => {
    setState((prevState) => ({ ...prevState, baseValue }));
  }); // No .catch()
};
```

**Issues:**
- Missing `.catch()` handlers on promises
- No error boundaries for React component errors
- Silent failures in API calls
- No user feedback when critical data fails to load
- Application may crash without graceful degradation

**Solution: Fix Error Handling**

```typescript
// ✅ GOOD: Proper error handling
const componentDidMount = async () => {
  try {
    i18n.changeLanguage(language);

    const [seasonData, baseValue] = await Promise.all([
      api.seasons.get(),
      api.coin.value(COIN_IDS.VULT, currency),
    ]);

    setState((prevState) => ({
      ...prevState,
      loaded: true,
      seasonInfo: seasonData,
      baseValue,
    }));
  } catch (error) {
    console.error('Failed to initialize app:', error);
    setState((prevState) => ({
      ...prevState,
      loaded: true,
      error: 'Failed to load initial data',
    }));
    // Show user-friendly error message
  }
};
```

---

### 4. **Duplicated Codebase as well as redundant switch/case**

**Problem:** Duplicated case statement causing unreachable code

```typescript
// src/utils/vault-provider.ts:664-677
switch (coin.ticker) {
  // Temporary solution for Coingecko CACAO price issue
  case TickerKey.CACAO:
    return api.coin
      .mayachainValue()
      .then((value) => (coin.value = value));
  case TickerKey.CACAO:  // DUPLICATED! This is unreachable
  case TickerKey.RUJI:
  case TickerKey.KWEEN:
  case TickerKey.CFGI:  
    return api.coin
      .coingeckoValue(coin.ticker, currency)
      .then((value) => (coin.value = value));
```

**Impact:** 
- CACAO tokens may get incorrect pricing
- Potential financial calculation issue

**Solution: Fix Duplicated CACAO Case**

```typescript
// FIXED: Remove duplicate
switch (coin.ticker) {
  case TickerKey.CACAO:
    return api.coin
      .mayachainValue()
      .then((value) => (coin.value = value));
  // Removed duplicate case
  case TickerKey.RUJI:
  case TickerKey.KWEEN:
  case TickerKey.CFGI:  
    return api.coin
      .coingeckoValue(coin.ticker, currency)
      .then((value) => (coin.value = value));
```

---

### 5. **Performance issues by creating class instances in every re-renders**

```typescript
// BAD: Created on every render!
// src/layouts/vault/index.tsx:59
  const vaultProvider = new VaultProvider(); // New instance every render
```

**Impact:**
- Performance degradation
- Memory leaks
- Unnecessary re-initialization and re-renders

**Solution:**
```typescript
// GOOD: Memoize the instance or use singleton paradigm
const vaultProvider = useMemo(() => new VaultProvider(), []);

const vaultProvider = new ValutProvider();
export { vaultProvider }
...
import { vaultProvider } from "...";

```

---

### 6. **Hardcoded Values & Magic Numbers**

**Problems:**
- Magic numbers scattered throughout code
- No constants for important values
- Difficult to maintain and update

**Examples:**
```typescript
// What is 825?
//src/context/index.tsx:81
api.coin.value(825, currency)

// Why multiply by 40?
//src/utils/vault-provider.ts:684
coin.value = value * 40;

```

**Solution: Add Constants for Magic Numbers**

```typescript
// utils/constants.ts
export const COIN_IDS = {
  VULT: 825,
  // ... others
} as const;

export const MULTIPLIERS = {
  MAYA_PRICE: 40,
  // ... others
} as const;

// Usage
api.coin.value(COIN_IDS.VULT, currency);
coin.value = value * MULTIPLIERS.MAYA_PRICE;
```

---

### 7. **Limited Custom Hooks**

**Problem:** Only 1 custom hook (`useGoBack`) for the entire application

**Missing Hooks:**
- `useVaultData` - Fetch and manage vault data
- `useChainBalance` - Fetch chain balances
- `useTokenPrices` - Fetch token prices
- `useLocalStorage` - Manage localStorage
- `useDebounce` - Debounce values
- `useAsync` - Handle async operations

**Impact:**
- Business logic mixed with component code
- Code duplication
- Difficult to test
- Poor reusability

**Solution: Refactor hook functions**
- Introduce and refactor core functionality into dedicated custom hooks.
---

### 8. **Repeated Html Tags Markup**

**Problem:** `Multiple components directly use raw HTML tags such as <a /> and <img /> with repeated attributes and logic.`

**Example:**

```typescript
// src/pages/nft-assets:90-95
<a
  href={`${exploreNFT[chain.name]}${chain.address}`}
  rel="noopener noreferrer"
  target="_blank"
  className="action"
>
```

```typescript
// src/pages/swap/index.tsx:246-248
<img src="/avatar/1.png" className="main" />
<img src="/avatar/2.png" className="bottom" />
<img src="/avatar/3.png" className="top" />
```

**Impact:**

- Duplicated markup and logic across components
- Hard to maintain (e.g., updating classes, attributes, security rules)
- No centralized styling or behavior
- Increased risk of inconsistent UI/UX
- More verbose, less readable component files

**Solution: Create reusable UI components such as:**
```typescript
// wraps all external anchor behavior
<ExternalLink />

// wraps all image rendering logic, fallbacks and styling
<ChainIcon /> or <Image /> 

```

This improves consistency, reduces duplication, and centralizes any future changes.
