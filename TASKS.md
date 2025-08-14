# oRPC Conversion Plan for ethscriptions-core

## Overview
Convert the existing ethscriptions-core functions into a type-safe oRPC router with isomorphic client support. The conversion will maintain all existing functionality while adding robust input validation, better error handling, and end-to-end type safety.

## Notes

- Stop after each procedure is converted. I will tell you to continue after i review it.
- merge all arguments of functions into a single orpc/zod `input` object schema, eg. do not make `z.object({ mainArg: foo, options: bar })` kind of things. Merge them.
- Keep existing functions, do not touch or change them, work only on the separate new directory `new_src`
- Do NOT use the OpenAPI feature and RPCHandler/RPCLinks of orpc.

## Architecture Goals
- **Procedures**: Convert all 11 functions to oRPC procedures with Zod validation
- **Isomorphic Client**: Server-side calls (no network) on server, oRPC client with TanStack Query on client
- **Type Safety**: End-to-end TypeScript safety from router to client
- **Error Handling**: Consistent error responses across all procedures (use orpc Typed Errors)
- **Backward Compatibility**: Maintain existing function signatures and behavior

## Dependencies to Install
```bash
npm install @orpc/server@latest @orpc/client@latest @orpc/tanstack-query@latest
npm install zod @tanstack/react-query # if not already installed
```

## Project Structure

Do not touch/change the original files, start in a fresh directory `new_src`.
For the server use the orpc fetch adapter handler.

```
ethscriptions-core/
├── new_src/
│   ├── router/           # oRPC router and procedures
│   │   ├── index.ts      # Main router export
│   │   ├── procedures/   # Individual procedure definitions in separate files
│   │   └── schemas/      # Zod input/output schemas
│   ├── client/           # Client-side setup
│   │   ├── index.ts      # Isomorphic client setup
│   │   └── types.ts      # Client type definitions
│   ├── server/           # Server-side setup
│   │   └── index.ts      # Server router client setup
│   └── index.ts          # Main exports (router + createSafeClient)
```

---

## Task Breakdown

### Phase 1: Infrastructure Setup

#### Task 1.1: Setup Basic oRPC Infrastructure ✅
**Status**: Completed
**Priority**: High
**Estimated Time**: 2 hours

**Acceptance Criteria**:
- [x] Install required oRPC packages
- [x] Create basic router structure in `new_src/router/index.ts`
- [x] Create Zod schemas directory structure (Zod v4)
- [x] Setup basic client infrastructure
- [x] Create isomorphic client pattern

**Files to Create/Modify**:
- `new_src/router/index.ts`
- `new_src/router/schemas/index.ts`
- `new_src/client/index.ts`
- `new_src/server/index.ts`
- `new_src/index.ts` (update exports)

---

### Phase 2: Procedure Conversions

#### Task 2.1: Convert `getPrices()` ✅
**Status**: Completed
**Priority**: High
**Estimated Time**: 1.5 hours

**Current Function**:
```typescript
async function getPrices(speed: 'slow' | 'normal' | 'fast' = 'normal'): Promise<OkShape<PricesResult> | NotOkShape>
```

**Acceptance Criteria**:
- [x] Create Zod schema for input (speed parameter)
- [x] Create Zod schema for output
- [x] Convert function to oRPC procedure with proper error handling
- [x] Add procedure to router
- [x] Test procedure works with existing logic
- [x] Update progress in this file

**Files to Create/Modify**:
- `new_src/router/schemas/prices.ts`
- `new_src/router/procedures/prices.ts`
- `new_src/router/index.ts` (add to router)

#### Task 2.2: Convert `multiCheckExists()` ✅
**Status**: Completed
**Priority**: High
**Estimated Time**: 2 hours

**Current Function**:
```typescript
async function multiCheckExists(shas: string | `0x${string}` | (string | `0x${string}`)[],options?: any): Promise<Result<CheckExistResult>>
```

**Acceptance Criteria**:
- [x] Create Zod schema for shas input (handle string/array union)
- [x] Create Zod schema for options parameter
- [x] Create Zod schema for CheckExistResult output
- [x] Convert function to oRPC procedure
- [x] Handle array normalization in procedure
- [x] Add procedure to router
- [x] Test with various input formats
- [x] Update progress in this file

**Files to Create/Modify**:
- `new_src/router/schemas/check-exists.ts`
- `new_src/router/procedures/check-exists.ts`
- `new_src/router/index.ts` (add to router)

#### Task 2.3: Convert `resolveUser()` ✅
**Status**: Completed
**Priority**: Medium
**Estimated Time**: 1 hour

**Current Function**:
```typescript
async function resolveUser(val: string, options?: any): Promise<Result<ResolveUserResult>>
```

**Acceptance Criteria**:
- [x] Create Zod schema for val input (string validation)
- [x] Create Zod schema for options parameter
- [x] Create Zod schema for ResolveUserResult output
- [x] Convert function to oRPC procedure
- [x] Handle address/name resolution logic
- [x] Add procedure to router
- [x] Update progress in this file

**Files to Create/Modify**:
- `new_src/router/schemas/resolve-user.ts`
- `new_src/router/procedures/resolve-user.ts`
- `new_src/router/index.ts` (add to router)

#### Task 2.4: Convert `getUserProfile()` ⏳
**Status**: Not Started
**Priority**: Medium
**Estimated Time**: 1.5 hours

**Current Function**:
```typescript
async function getUserProfile(val: string, options?: any): Promise<Result<UserProfileResult | UserProfileResult['latest']>>
```

**Acceptance Criteria**:
- [ ] Create Zod schema for val input
- [ ] Create Zod schema for options parameter (including latest flag)
- [ ] Create Zod schema for UserProfileResult output (handle union type)
- [ ] Convert function to oRPC procedure
- [ ] Handle conditional return type based on options.latest
- [ ] Add procedure to router
- [ ] Update progress in this file

**Files to Create/Modify**:
- `new_src/router/schemas/user-profile.ts`
- `new_src/router/procedures/user-profile.ts`
- `new_src/router/index.ts` (add to router)

#### Task 2.5: Convert `getDigestForData()` ⏳
**Status**: Not Started
**Priority**: High
**Estimated Time**: 2 hours

**Current Function**:
```typescript
async function getDigestForData(input: `data:${string}` | `0x${string}` | Uint8Array | string, options?: any): Promise<Result<DigestResult | DigestResultWithCheck>>
```

**Acceptance Criteria**:
- [ ] Create Zod schema for complex input union type
- [ ] Create Zod schema for options parameter (including checkExists flag)
- [ ] Create Zod schemas for DigestResult and DigestResultWithCheck outputs
- [ ] Convert function to oRPC procedure
- [ ] Handle Uint8Array serialization/deserialization
- [ ] Handle conditional return type based on options.checkExists
- [ ] Add procedure to router
- [ ] Update progress in this file

**Files to Create/Modify**:
- `new_src/router/schemas/digest.ts`
- `new_src/router/procedures/digest.ts`
- `new_src/router/index.ts` (add to router)

#### Task 2.6: Convert `getUserCreatedEthscritions()` ⏳
**Status**: Not Started
**Priority**: Medium
**Estimated Time**: 1 hour

**Current Function**:
```typescript
async function getUserCreatedEthscritions(val: string, options?: any): Promise<Result<EthscriptionBase[]>>
```

**Acceptance Criteria**:
- [ ] Create Zod schema for val input
- [ ] Create Zod schema for options parameter
- [ ] Create Zod schema for EthscriptionBase[] output
- [ ] Convert function to oRPC procedure
- [ ] Delegate to getAllEthscriptions with creator filter
- [ ] Add procedure to router
- [ ] Update progress in this file

**Files to Create/Modify**:
- `new_src/router/schemas/user-created.ts`
- `new_src/router/procedures/user-created.ts`
- `new_src/router/index.ts` (add to router)

#### Task 2.7: Convert `getUserOwnedEthscriptions()` ⏳
**Status**: Not Started
**Priority**: Medium
**Estimated Time**: 1 hour

**Current Function**:
```typescript
async function getUserOwnedEthscriptions(val: string, options?: any): Promise<Result<EthscriptionBase[]>>
```

**Acceptance Criteria**:
- [ ] Create Zod schema for val input
- [ ] Create Zod schema for options parameter
- [ ] Create Zod schema for EthscriptionBase[] output
- [ ] Convert function to oRPC procedure
- [ ] Delegate to getAllEthscriptions with current_owner filter
- [ ] Add procedure to router
- [ ] Update progress in this file

**Files to Create/Modify**:
- `new_src/router/schemas/user-owned.ts`
- `new_src/router/procedures/user-owned.ts`
- `new_src/router/index.ts` (add to router)

#### Task 2.8: Convert `getAllEthscriptions()` ⏳
**Status**: Not Started
**Priority**: High
**Estimated Time**: 2 hours

**Current Function**:
```typescript
async function getAllEthscriptions(options: any): Promise<Result<EthscriptionBase[]>>
```

**Acceptance Criteria**:
- [ ] Create comprehensive Zod schema for all filter options
- [ ] Create Zod schema for pagination parameters
- [ ] Create Zod schema for EthscriptionBase[] output
- [ ] Convert function to oRPC procedure
- [ ] Handle all filtering and pagination logic
- [ ] Add procedure to router
- [ ] Update progress in this file

**Files to Create/Modify**:
- `new_src/router/schemas/all-ethscriptions.ts`
- `new_src/router/procedures/all-ethscriptions.ts`
- `new_src/router/index.ts` (add to router)

#### Task 2.9: Convert `getEthscriptionById()` ⏳
**Status**: Not Started
**Priority**: Medium
**Estimated Time**: 1 hour

**Current Function**:
```typescript
async function getEthscriptionById(id: string, options?: any): Promise<Result<EthscriptionBase>>
```

**Acceptance Criteria**:
- [ ] Create Zod schema for id input
- [ ] Create Zod schema for options parameter
- [ ] Create Zod schema for EthscriptionBase output
- [ ] Convert function to oRPC procedure
- [ ] Delegate to `getEthscriptionDetailed` with 'meta' type (use the `call` helper of orpc to call a procedure, from `import { call } from '@orpc/server'`)
- [ ] Add procedure to router
- [ ] Update progress in this file

**Files to Create/Modify**:
- `new_src/router/schemas/ethscription-by-id.ts`
- `new_src/router/procedures/ethscription-by-id.ts`
- `new_src/router/index.ts` (add to router)

#### Task 2.10: Convert `getEthscriptionDetailed()` ⏳
**Status**: Not Started
**Priority**: High
**Estimated Time**: 3 hours

**Current Function**:
```typescript
async function getEthscriptionDetailed<T extends EnumAllDetailed>(id: string, type: T, options?: any): Promise<ResultDetailed<T>>
```

**Acceptance Criteria**:
- [ ] Create Zod schema for id input
- [ ] Create Zod schema for type parameter (EnumAllDetailed)
- [ ] Create Zod schemas for all possible return types (ResultDetailed<T>)
- [ ] Convert function to oRPC procedure with generic handling
- [ ] Handle complex conditional return types
- [ ] Handle Uint8Array serialization for content/attachment
- [ ] Add procedure to router
- [ ] Update progress in this file

**Files to Create/Modify**:
- `new_src/router/schemas/ethscription-detailed.ts`
- `new_src/router/procedures/ethscription-detailed.ts`
- `new_src/router/index.ts` (add to router)

#### Task 2.11: Convert `estimateDataCost()` ⏳
**Status**: Not Started
**Priority**: Medium
**Estimated Time**: 1.5 hours

**Current Function**:
```typescript
async function estimateDataCost(input: `data:${string}` | `0x${string}` | Uint8Array | string, options?: BaseCostOpts): Promise<Result<EstimateCostResult>>
```

**Acceptance Criteria**:
- [ ] Create Zod schema for complex input union type
- [ ] Create Zod schema for BaseCostOpts parameter
- [ ] Create Zod schema for EstimateCostResult output
- [ ] Convert function to oRPC procedure
- [ ] Handle Uint8Array serialization/deserialization
- [ ] Add procedure to router
- [ ] Update progress in this file

**Files to Create/Modify**:
- `new_src/router/schemas/estimate-cost.ts`
- `new_src/router/procedures/estimate-cost.ts`
- `new_src/router/index.ts` (add to router)

---

### Phase 3: Client Integration

#### Task 3.1: Setup Isomorphic Client ⏳
**Status**: Not Started
**Priority**: High
**Estimated Time**: 2 hours

**Acceptance Criteria**:
- [ ] Create `createSafeClient` function using `createRouterClient` for server-side
- [ ] Create `createORPCClient` with RPCLink for client-side
- [ ] Setup TanStack Query integration for client-side
- [ ] Handle server/client detection properly
- [ ] Export isomorphic client from main index
- [ ] Update progress in this file

**Files to Create/Modify**:
- `new_src/client/index.ts`
- `new_src/server/index.ts`
- `new_src/index.ts` (export createSafeClient)

#### Task 3.2: Add TanStack Query Utils ⏳
**Status**: Not Started
**Priority**: Medium
**Estimated Time**: 1 hour

**Acceptance Criteria**:
- [ ] Setup `createTanstackQueryUtils` for client-side
- [ ] Create query/mutation options for all procedures
- [ ] Handle query keys and caching strategies
- [ ] Export query utils from client
- [ ] Update progress in this file

**Files to Create/Modify**:
- `new_src/client/query-utils.ts`
- `new_src/client/index.ts` (export query utils)


---

## Progress Tracking

### Completed Tasks: 4/15 (26.7%)
- Task 1.1: Setup Basic oRPC Infrastructure ✅
- Task 2.1: Convert `getPrices()` ✅
- Task 2.2: Convert `multiCheckExists()` ✅
- Task 2.3: Convert `resolveUser()` ✅

### Current Task: Task 2.4 - Convert `getUserProfile()`

### Next Up: Task 2.5 - Convert `getDigestForData()`

---

## Notes & Considerations

### Technical Decisions
1. **Error Handling**: use the typed errors feature, eg. `os.errors({ ... })`
2. **Serialization**: use hex to serialize Uint8Array and deserialize it back to Uint8Array when it's needed
3. **Caching**: Do not deal with caching, defaults are good. Do not take into account the current caching strategy and values.
4. **Types**: Preserve all existing TypeScript types and make them oRPC-compatible. Preserve most of all schemas too.

### Potential Challenges
2. **Generic Types**: `getEthscriptionDetailed<T>` might need special handling
3. **Union Return Types**: Some functions return different types based on options

---

## Final Checklist (Complete When All Tasks Done)
- [ ] All 11 functions converted to oRPC procedures
- [ ] Isomorphic client working (server + client)
- [ ] TanStack Query integration complete
- [ ] Type safety verified end-to-end
- [ ] Examples and documentation updated
- [ ] Backward compatibility maintained
- [ ] Performance testing completed
- [ ] Ready for production use
