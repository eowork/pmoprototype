# Repairs Module: Why Fields Are Blank (Beginner-Friendly Summary)

**Last Updated:** 2026-02-04  
**Research Status:** ✅ COMPLETE  
**Implementation Status:** ⏳ AWAITING OPERATOR APPROVAL

---

## The Problem (In Plain English)

You open a Repairs edit form. The database has all the data. But the form shows **blank fields**. When you try to save, you get validation errors.

**What's weird:** COI module works perfectly fine. Same type of form. Same type of data.

---

## Root Cause #1: Wrong Field Names 🔴

### The Issue

The frontend code is looking for field names that don't exist in the backend response.

**Think of it like this:**
- The backend says: "Here's your `project_code`"
- The frontend asks: "Where's my `repair_code`?"
- Backend: "I don't have that. I gave you `project_code`."
- Frontend: "Okay, I'll just show a blank field then."

### What Actually Happens

**Database column name:** `project_code`  
**Backend sends:** `{ project_code: "RP-2026-001" }`  
**Frontend looks for:** `backend.repair_code`  
**Frontend finds:** `undefined`  
**Form displays:** (blank)

**Same problem for:**
- `budget` (frontend looks for `estimated_cost`)
- `assigned_technician` (frontend looks for `assigned_to`)
- `end_date` (frontend looks for `completion_date`)

### Why COI Works

COI adapter says:
```typescript
projectCode: backend.project_code  // ✅ CORRECT - reads the right field
```

Repairs adapter says:
```typescript
project_code: backend.repair_code  // ❌ WRONG - that field doesn't exist
```

---

## Root Cause #2: Missing Field in DTO 🔴

### The Issue

The backend has a "bouncer" (called a DTO) that checks what data is allowed in. The frontend tries to send `actual_cost`, but the bouncer says "Sorry, that's not on my list."

**Think of it like this:**
- Frontend: "I need to save actual_cost = 45000"
- Backend DTO (bouncer): "Sorry, 'actual_cost' is not on my approved list"
- Frontend: "But the database has a column for it!"
- Backend DTO: "I don't care. I only let in what's on MY list."
- Result: Validation error

### What Actually Happens

**Database has column:** `actual_cost`  
**Frontend sends:** `{ actual_cost: 45000 }`  
**Backend DTO defines:** (no actual_cost field)  
**class-validator says:** "property actual_cost should not exist"  
**Request:** REJECTED ❌

---

## Root Cause #3: Wrong TypeScript Interfaces 🟡

### The Issue

TypeScript thinks the field names are correct because the interface says they exist. But at runtime, they don't actually exist.

**Think of it like this:**
- Interface is like a map
- The map says "There's a field called `repair_code`"
- TypeScript trusts the map
- At runtime, you look for `repair_code`
- It doesn't exist (the map was wrong!)

TypeScript can only check the map, not the actual data.

---

## The Fix (Conceptual)

### Fix #1: Update Field Names (Frontend)
Change the adapter to read the correct field names that the backend actually returns.

**File:** `pmo-frontend/utils/adapters.ts`

**Change:**
- `backend.repair_code` → `backend.project_code`
- `backend.estimated_cost` → `backend.budget`
- `backend.assigned_to` → `backend.assigned_technician`
- `backend.completion_date` → `backend.end_date`

### Fix #2: Add actual_cost to DTO (Backend)
Tell the "bouncer" (DTO) that `actual_cost` is allowed.

**File:** `pmo-backend/src/repair-projects/dto/create-repair-project.dto.ts`

**Add:**
```typescript
@IsOptional()
@IsNumber()
actual_cost?: number;
```

---

## Why This Happened

1. Repairs module was built before field naming was standardized
2. Someone guessed the field names would be `repair_code`, `estimated_cost`, etc.
3. TypeScript didn't catch it because the interface matched the wrong guess
4. COI was fixed recently, but Repairs was never updated
5. `actual_cost` was added to the database later but never added to the DTO

---

## What Won't Change

✅ **Database** - Already correct, columns exist  
✅ **COI Module** - Already working perfectly  
✅ **Routing** - Already stable  
✅ **Backend queries** - Already returning the right data

Only changing:
- 4 field name reads in frontend adapter
- 1 field definition in backend DTO

---

## Expected Outcome

After fixes:
- ✅ Repair code field shows: "RP-2026-001" (not blank)
- ✅ Budget field shows: "50000" (not blank)
- ✅ Assigned tech shows: "Juan dela Cruz" (not blank)
- ✅ Actual cost saves without error
- ✅ Form works exactly like COI form

---

## Files Changed

**Frontend:**
- `pmo-frontend/utils/adapters.ts` (8 line changes)

**Backend:**
- `pmo-backend/src/repair-projects/dto/create-repair-project.dto.ts` (3 line addition)

**Total:** ~11 lines of code

---

**For detailed technical analysis, see:** `docs/research_repairs_module_failures.md`

---

**END OF SUMMARY**
