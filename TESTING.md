# Testing Guide for Flex Living Reviews Dashboard

## Overview

This document provides comprehensive guidance on testing the Flex Living Reviews Dashboard. Our testing strategy focuses on critical functionality, performance, and user experience to ensure production-ready quality.

## Testing Stack

- **Test Runner**: Vitest (fast, ESM-native, Vite-compatible)
- **Testing Library**: React Testing Library (user-centric testing)
- **Mocking**: MSW (Mock Service Worker) for API mocking
- **Coverage**: V8 coverage provider
- **UI Testing**: Vitest UI for visual test running

## Test Structure

```
src/test/
├── setup.ts                 # Global test configuration
├── utils.tsx                # Test utilities and helpers
└── integration/             # Critical integration tests
    ├── api-reviews-hostaway.test.ts
    ├── dashboard-store.test.ts
    ├── review-filtering.test.tsx
    ├── property-details.test.tsx
    └── dashboard-e2e.test.tsx
```

## Running Tests

### Quick Start
```bash
# Install dependencies
npm install

# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui
```

### Using Test Script
```bash
# Make script executable (first time only)
chmod +x scripts/test.sh

# Run all tests
./scripts/test.sh all

# Run in watch mode
./scripts/test.sh watch

# Run specific tests
./scripts/test.sh specific "dashboard-store"

# Run critical tests only
./scripts/test.sh critical

# Setup tests (first time)
./scripts/test.sh setup
```

## Critical Test Categories

### 1. API Route Testing (`api-reviews-hostaway.test.ts`)

**Purpose**: Ensures the core API endpoint works correctly with various parameters and edge cases.

**Key Test Areas**:
- ✅ Default parameter handling
- ✅ Filter by status (published, pending, draft)
- ✅ Filter by listing name
- ✅ Statistics calculation
- ✅ Error handling and graceful failures
- ✅ Parameter validation
- ✅ Result limiting and pagination

**Why Critical**: This API is the foundation of the entire dashboard and will be directly tested in the assessment.

```typescript
// Example test
it('should return reviews with default parameters', async () => {
  const request = new NextRequest('http://localhost:3000/api/reviews/hostaway')
  const response = await GET(request)
  const data = await response.json()

  expect(response.status).toBe(200)
  expect(data.success).toBe(true)
  expect(Array.isArray(data.reviews)).toBe(true)
})
```

### 2. State Management Testing (`dashboard-store.test.ts`)

**Purpose**: Validates the Zustand store implementation works correctly across all scenarios.

**Key Test Areas**:
- ✅ Filter state initialization and updates
- ✅ UI state management (view modes, sidebar, toasts)
- ✅ Bulk action selection and execution
- ✅ Computed values calculation
- ✅ Concurrent state updates
- ✅ State persistence across re-renders

**Why Critical**: The Zustand implementation is a key architectural decision that improves the entire application.

```typescript
// Example test
it('should update individual filter values', () => {
  const { result } = renderHook(() => useFilterActions())
  
  act(() => {
    result.current.setFilters({
      searchTerm: 'test search',
      status: 'published',
    })
  })

  expect(useFilters().searchTerm).toBe('test search')
})
```

### 3. Review Filtering Testing (`review-filtering.test.tsx`)

**Purpose**: Ensures all filtering and search functionality works correctly from UI to state.

**Key Test Areas**:
- ✅ Search input updates store state
- ✅ Status filter dropdown functionality
- ✅ Type filter selection
- ✅ Property filter selection
- ✅ Filter clearing and reset
- ✅ Multiple filter combinations
- ✅ Performance with large datasets
- ✅ Debounced search input

**Why Critical**: Filtering is the primary way managers interact with reviews in the dashboard.

```typescript
// Example test
it('should update search term when user types', async () => {
  const user = userEvent.setup()
  render(<DashboardFilters properties={[]} />)
  
  const searchInput = screen.getByPlaceholderText(/search reviews/i)
  await user.type(searchInput, 'excellent stay')
  
  await waitFor(() => {
    expect(useDashboardStore.getState().filters.searchTerm).toBe('excellent stay')
  })
})
```

### 4. Property Details Testing (`property-details.test.tsx`)

**Purpose**: Validates the property-specific analytics and review management functionality.

**Key Test Areas**:
- ✅ Property data loading and error states
- ✅ Metrics calculation (ratings, counts, trends)
- ✅ Chart rendering and data visualization
- ✅ Property-specific review filtering
- ✅ CSV export functionality
- ✅ Navigation and breadcrumbs
- ✅ Responsive design and accessibility

**Why Critical**: Property details is a key feature that demonstrates advanced analytics capabilities.

```typescript
// Example test
it('should calculate and display correct average rating', () => {
  const reviewsWithRatings = [
    { ...mockReview, overallRating: 8 },
    { ...mockReview, overallRating: 9 },
    { ...mockReview, overallRating: 7 },
  ]
  
  render(<PropertyDetailsContent user={user} propertyName="Test Property" />)
  
  expect(screen.getByText('8.0/10')).toBeInTheDocument()
})
```

### 5. End-to-End Flow Testing (`dashboard-e2e.test.tsx`)

**Purpose**: Validates complete user workflows and component integration.

**Key Test Areas**:
- ✅ Complete review management workflow
- ✅ View mode switching
- ✅ Error handling and loading states
- ✅ URL parameter synchronization
- ✅ Bulk operations workflow
- ✅ Toast notifications
- ✅ Data consistency across re-renders
- ✅ Performance with large datasets
- ✅ Accessibility and keyboard navigation

**Why Critical**: Ensures all components work together correctly in real user scenarios.

```typescript
// Example test
it('should handle full review management workflow', async () => {
  const user = userEvent.setup()
  render(<DashboardContent user={mockUser} />)
  
  // Apply filters
  await user.type(screen.getByTestId('search-input'), 'excellent')
  await user.selectOptions(screen.getByTestId('status-filter'), 'published')
  
  // Change review status
  await user.click(screen.getByTestId('status-btn-1'))
  
  // Clear filters
  await user.click(screen.getByTestId('clear-filters'))
  
  // Verify state is reset
  expect(useDashboardStore.getState().filters.searchTerm).toBe('')
})
```

## Test Utilities and Helpers

### Custom Render Function
```typescript
export const renderWithProviders = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { queryClient = createTestQueryClient(), ...renderOptions } = options
  
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
  
  return render(ui, { wrapper: Wrapper, ...renderOptions })
}
```

### Mock Data Factories
```typescript
export const createMockReview = (overrides = {}): NormalizedReview => ({
  id: 1,
  type: 'guest-to-host',
  status: 'published',
  overallRating: 8.5,
  comment: 'Great stay! Clean and well-maintained.',
  // ... other properties
  ...overrides,
})

export const createMockReviews = (count: number = 5): NormalizedReview[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockReview({ id: index + 1 })
  )
}
```

### API Mocking Utilities
```typescript
export const mockFetchSuccess = (data: any) => {
  (global.fetch as any).mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => data,
  })
}

export const mockFetchError = (error: string, status: number = 500) => {
  (global.fetch as any).mockRejectedValueOnce({
    ok: false,
    status,
    message: error,
  })
}
```

## Performance Testing

### Large Dataset Testing
Our tests include performance validation for large datasets:

```typescript
it('should handle large datasets efficiently', () => {
  const largeDataset = createMockReviews(1000)
  
  const startTime = performance.now()
  render(<DashboardContent reviews={largeDataset} />)
  const endTime = performance.now()
  
  expect(endTime - startTime).toBeLessThan(1000) // < 1 second
})
```

### Memory Leak Prevention
Tests verify proper cleanup and resource management:

```typescript
it('should cleanup resources properly', () => {
  const { unmount } = render(<Component />)
  
  // Apply state changes
  applyChanges()
  
  // Unmount and verify no memory leaks
  unmount()
  expect(getResourceCount()).toBe(initialResourceCount)
})
```

## Coverage Goals

- **Overall Coverage**: > 80%
- **Critical Functions**: > 95%
- **API Routes**: 100%
- **Store Logic**: 100%
- **UI Components**: > 85%

### Viewing Coverage Reports
```bash
npm run test:coverage
open coverage/index.html
```

## Debugging Tests

### Running Single Test
```bash
npm run test -- --run "dashboard-store"
```

### Debugging in VSCode
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
  "args": ["--run", "--threads", "false"],
  "console": "integratedTerminal"
}
```

### Verbose Output
```bash
npm run test -- --reporter=verbose
```

## Continuous Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run lint
```

## Best Practices

### Test Organization
- ✅ Group related tests with `describe` blocks
- ✅ Use descriptive test names that explain the scenario
- ✅ Follow AAA pattern: Arrange, Act, Assert
- ✅ Keep tests focused and independent

### Mocking Strategy
- ✅ Mock external dependencies (APIs, databases)
- ✅ Use MSW for HTTP mocking when possible
- ✅ Mock at the boundary, not implementation details
- ✅ Reset mocks between tests

### Assertions
- ✅ Use semantic matchers (`toBeInTheDocument`, `toHaveValue`)
- ✅ Test user-visible behavior, not implementation
- ✅ Include both positive and negative test cases
- ✅ Test error states and edge cases

### Performance
- ✅ Use `renderHook` for testing custom hooks
- ✅ Avoid unnecessary re-renders in tests
- ✅ Use `waitFor` for async operations
- ✅ Clean up after each test

## Troubleshooting

### Common Issues

**Issue**: Tests timeout or hang
```bash
# Solution: Check for unresolved promises
npm run test -- --reporter=verbose --timeout=10000
```

**Issue**: Mock not working
```typescript
// Solution: Ensure mocks are reset
beforeEach(() => {
  vi.clearAllMocks()
})
```

**Issue**: Component not rendering
```typescript
// Solution: Use proper providers
renderWithProviders(<Component />)
```

**Issue**: State not updating
```typescript
// Solution: Use act() for state updates
act(() => {
  updateState()
})
```

## Extending Tests

### Adding New Tests
1. Create test file in appropriate directory
2. Import required utilities from `test/utils`
3. Follow existing patterns for consistency
4. Add both happy path and error cases
5. Update this documentation if needed

### Test Naming Convention
- Files: `*.test.ts` or `*.test.tsx`
- Describe blocks: Feature or component name
- Test cases: "should [expected behavior] when [condition]"

Example:
```typescript
describe('DashboardFilters', () => {
  describe('Search functionality', () => {
    it('should update search term when user types in input', () => {
      // test implementation
    })
  })
})
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [MSW Documentation](https://mswjs.io/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

## Maintenance

### Regular Tasks
- [ ] Run full test suite before releases
- [ ] Update mocks when API changes
- [ ] Review and update test coverage goals
- [ ] Clean up deprecated test patterns
- [ ] Update documentation for new features

### Monitoring
- Test execution time trends
- Coverage percentage changes
- Flaky test identification
- Performance regression detection

---

**Note**: These tests are designed to validate the core functionality that will be evaluated in the Flex Living developer assessment. Focus on ensuring these critical tests pass before submission.