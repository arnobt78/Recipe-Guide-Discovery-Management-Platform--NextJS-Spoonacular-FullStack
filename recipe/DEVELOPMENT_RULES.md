# Development Rules & Standards

> **⚠️ CRITICAL**: These rules must be followed strictly throughout the project. Any deviation must be explicitly approved.

---

## 🚫 Core Rules - DO NOT VIOLATE

### 1. Preserve Existing Code

- ❌ **NEVER** remove or modify existing code unless explicitly instructed
- ✅ **ALWAYS** preserve all current workflow logic, structure, and reusable components
- ✅ **ALWAYS** maintain folder structure, naming conventions, hooks patterns, component composition, state flow, and shared utils
- ✅ **ALWAYS** stay fully consistent with the project architecture

### 2. No Breaking Changes

- ❌ **NEVER** introduce regressions or break existing behavior or hydration errors
- ✅ **ALWAYS** test existing features after making changes and ensure no hydration errors
- ✅ **ALWAYS** maintain backward compatibility

---

## 📐 Code Standards

### API Design

#### Endpoints

- ✅ **DO**: Ensure proper handling of:
  - Data sync
  - Partial updates
  - Cache invalidation
  - Aggregation
  - Pagination
  - Internal routing logic

### State Management

#### React Query (TanStack Query)

- ✅ **MUST** use TanStack React Query for:
  - All queries and mutations
  - Caching strategies
  - Cache invalidation
  - Background refetching
  - Request deduplication

#### Query Parameters

- ✅ **MUST** use search params + query params for:
  - Filters
  - Sorting
  - Pagination
  - State persistence

#### Example

```javascript
// ✅ GOOD: Using React Query with query params
const { data, isLoading } = useQuery({
  queryKey: ["products", { page, limit, search }],
  queryFn: () => fetchProducts({ page, limit, search }),
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// ❌ BAD: Using useState/useEffect
const [products, setProducts] = useState([]);
useEffect(() => {
  fetchProducts().then(setProducts);
}, []);
```

### Rendering Strategy

#### Hybrid Rendering

- ✅ **MUST** support SSR + CSR + SSE simultaneously
- ✅ **MUST** ensure components correctly handle all rendering modes

#### SSE Implementation

- ✅ **MUST** add proper event streams
- ✅ **MUST** revalidate caches cleanly
- ❌ **NEVER** create memory leaks or duplicate event listeners

#### Example

```javascript
// ✅ GOOD: Proper SSE handling
useEffect(() => {
  const eventSource = new EventSource("/api/events");

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    queryClient.invalidateQueries(["orders"]);
  };

  return () => {
    eventSource.close(); // Cleanup
  };
}, []);

// ❌ BAD: Missing cleanup
useEffect(() => {
  const eventSource = new EventSource("/api/events");
  eventSource.onmessage = (event) => {
    // No cleanup - memory leak!
  };
}, []);
```

### Type Safety

#### TypeScript (When Migrating)

- ✅ **MUST** use strict TypeScript
- ✅ **MUST** generate/update proper types for:
  - API responses
  - Form values
  - Component props
  - Reusable hooks
  - Server actions
  - Config objects

#### Example

```typescript
// ✅ GOOD: Explicit types
interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: Product) => void;
  onCancel: () => void;
}

// ❌ BAD: Using 'any'
function ProductForm(props: any) {
  // No type safety
}
```

### UI Components

#### ShadCN UI

- ✅ **MUST** use ShadCN UI and Daisy UI components consistently across the application
- ✅ **MUST** maintain consistent UI interactions

#### Dynamic Toaster

- ✅ **MUST** use dynamic toaster for all success/error/info messages
- ❌ **NEVER** use inline alerts unless specifically required

#### Example

```javascript
// ✅ GOOD: Using toast
import { toast } from "react-toastify";

const handleSubmit = async () => {
  try {
    await createProduct(data);
    toast.success("Product created successfully!");
  } catch (error) {
    toast.error("Failed to create product");
  }
};

// ❌ BAD: Inline alert
const handleSubmit = async () => {
  try {
    await createProduct(data);
    alert("Product created!"); // Don't use alert
  } catch (error) {
    alert("Error!"); // Don't use alert
  }
};
```

### Performance Optimization

#### Memoization

- ✅ **DO** memoize where needed (useMemo, useCallback)
- ✅ **DO** reduce duplication
- ✅ **DO** clean up unused imports
- ✅ **DO** reduce unnecessary rerenders
- ✅ **DO** ensure caching layers are efficient

#### Example

```javascript
// ✅ GOOD: Memoized expensive computation
const sortedProducts = useMemo(() => {
  return products.sort((a, b) => a.price - b.price);
}, [products]);

// ✅ GOOD: Memoized callback
const handleClick = useCallback(
  (id) => {
    navigate(`/products/${id}`);
  },
  [navigate]
);

// ❌ BAD: Recomputing on every render
const sortedProducts = products.sort((a, b) => a.price - b.price);
```

---

## ✅ Pre-Commit Checklist

Before committing any change, verify:

- [ ] No missing imports
- [ ] Types are correct (if using TypeScript)
- [ ] UI matches the design system
- [ ] Endpoints are unified and optimized
- [ ] Logic is consistent, reusable, and stable
- [ ] No introduced bugs or broken flows
- [ ] All existing tests pass
- [ ] New features are tested
- [ ] Code follows existing patterns
- [ ] No console.logs left in code
- [ ] Environment variables are properly configured
- [ ] Documentation is updated (if needed)

---

## 📋 Component Development Checklist

When creating a new component:

- [ ] Follow existing component structure
- [ ] Use ShadCN UI components where possible
- [ ] Implement proper TypeScript types (if using TS)
- [ ] Add proper error handling
- [ ] Implement loading states
- [ ] Add proper accessibility (ARIA labels, etc.)
- [ ] Ensure responsive design
- [ ] Support dark/light mode
- [ ] Use React Query for data fetching
- [ ] Implement proper cleanup in useEffect
- [ ] Add proper prop validation
- [ ] Write unit tests

---

## 🔍 Code Review Guidelines

### What to Look For

1. **Consistency**

   - Does the code follow existing patterns?
   - Are naming conventions consistent?
   - Is the structure similar to other components?

2. **Performance**

   - Are there unnecessary rerenders?
   - Is memoization used appropriately?
   - Are queries optimized?

3. **Security**

   - Are inputs validated?
   - Are API keys properly secured?
   - Is authentication/authorization correct?

4. **Error Handling**

   - Are errors properly caught and handled?
   - Are user-friendly error messages shown?
   - Is logging appropriate?

5. **Testing**
   - Are there tests for new functionality?
   - Do existing tests still pass?
   - Is test coverage maintained?

---

## 🚨 Common Mistakes to Avoid

### ❌ Don't Do This

```javascript
// ❌ Removing existing code
- function oldFunction() { ... }

// ❌ Breaking existing patterns
const NewComponent = () => {
  // Different structure than other components
};

// ❌ Not using React Query
const [data, setData] = useState([]);
useEffect(() => {
  fetchData().then(setData);
}, []);

// ❌ Inline alerts
alert('Success!');

// ❌ Missing cleanup
useEffect(() => {
  const timer = setInterval(() => {
    // No cleanup
  }, 1000);
}, []);

// ❌ Not handling errors
const handleSubmit = async () => {
  await createProduct(data); // No try/catch
};
```

### ✅ Do This Instead

```javascript
// ✅ Preserving existing code
function oldFunction() { ... } // Keep it

// ✅ Following existing patterns
const NewComponent = () => {
  // Same structure as other components
};

// ✅ Using React Query
const { data, isLoading } = useQuery({
  queryKey: ['products'],
  queryFn: fetchProducts,
});

// ✅ Using toast
toast.success('Success!');

// ✅ Proper cleanup
useEffect(() => {
  const timer = setInterval(() => {
    // ...
  }, 1000);
  return () => clearInterval(timer);
}, []);

// ✅ Proper error handling
const handleSubmit = async () => {
  try {
    await createProduct(data);
    toast.success('Product created!');
  } catch (error) {
    toast.error('Failed to create product');
    console.error(error);
  }
};
```
