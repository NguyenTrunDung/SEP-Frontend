# CreateFoodsMenu Component - API Integration

## Overview

The `CreateFoodsMenu` component has been successfully integrated with real API data using React Query hooks. This component now automatically fetches both food categories and foods from the backend APIs, providing a seamless experience for creating menus.

## API Integration

### Integrated Hooks

1. **`useFoodCategories`** - Fetches food categories from `/api/v1/foodcategories`
2. **`useFoods`** - Fetches foods from `/api/v1/foods`

### Data Flow

1. Component mounts and automatically triggers API calls via React Query hooks
2. Categories are fetched and transformed to component format with `category_${id}` keys
3. Foods are fetched and mapped to categories using `categoryId` field
4. Both data sources support multi-tenant architecture with automatic branch context

### Data Structure Mapping

#### Categories (API → Component)

```javascript
// API Response
{
  id: 1,
  name: "Điểm tâm",
  sort: 1,
  imageUrl: "https://example.com/image.jpg"
}

// Component Format
{
  key: "category_1",
  id: 1,
  label: "Điểm tâm",
  color: "#52c41a",
  sort: 1,
  imageUrl: "https://example.com/image.jpg"
}
```

#### Foods (API → Component)

```javascript
// API Response
{
  id: 1,
  name: "Bánh mì",
  categoryId: 1,
  priceForGuest: 25000,
  priceForPatient: 20000,
  priceForStaff: 20000,
  description: "Bánh mì đặc biệt"
}

// Component Usage
// Used directly - no transformation needed
```

## Component Features

### Real-time Data Loading

- Automatic loading states with Spin component
- Comprehensive error handling with Alert component
- Smart loading messages based on which APIs are loading

### Backward Compatibility

- Still accepts `availableDishes` prop for testing/fallback scenarios
- API data takes priority when available
- Maintains same PropTypes interface

### Enhanced Debugging

- Development mode console logging for data flow
- Category-dish mapping visualization
- Sample data structure logging

## Usage

### Basic Usage (Recommended)

```javascript
import CreateFoodsMenu from "./CreateFoodsMenu";

// Component automatically fetches API data
<CreateFoodsMenu
  open={modalOpen}
  onCancel={handleCancel}
  onSubmit={handleSubmit}
  initialValues={{ serviceTime: false }}
/>;
```

### With Fallback Data (Optional)

```javascript
// Only needed for testing or when API is unavailable
<CreateFoodsMenu
  open={modalOpen}
  onCancel={handleCancel}
  onSubmit={handleSubmit}
  availableDishes={mockDishes} // Fallback data
  initialValues={{ serviceTime: false }}
/>
```

## Data Requirements

### Food Categories

- Must have `id`, `name`, `sort` fields
- Categories are sorted by `sort` field
- Each category becomes `category_${id}` in component

### Foods

- Must have `id`, `name`, `categoryId` fields
- Price fields: `priceForGuest`, `priceForPatient`, `priceForStaff`
- Foods are filtered by `categoryId` to match categories

## Error Handling

### API Errors

- Network errors show user-friendly messages
- Specific error messages from API responses
- Reload button for easy recovery

### Data Validation

- Missing categories: Shows "No categories available"
- Missing foods: Shows "No foods available"
- Search with no results: Shows appropriate message

## Performance Optimizations

### React Query Features

- Automatic caching with 5-minute stale time
- Background refetching disabled on window focus
- Efficient re-renders with proper dependency arrays

### Component Optimizations

- `useMemo` for expensive category transformations
- Conditional rendering based on data availability
- Smart loading state management

## Branch Context (Multi-Tenancy)

### Automatic Handling

- API interceptor adds `X-Branch-Id` header
- Query parameters include `branchId`
- No manual branch management needed

### Cache Isolation

- Separate query keys ensure proper data isolation
- Branch switching automatically refetches data
- No cross-tenant data pollution

## Development Mode Features

### Console Logging

```javascript
// Example console output
🍽️ Using API dishes data: 15 items
📋 Sample dish structure: { id: 1, name: "Bánh mì", categoryId: 1, ... }
🔗 Category-Dish mapping:
  Điểm tâm (ID: 1): 5 dishes
    Sample dishes: Bánh mì, Phở bò, Cháo gà
```

### Debug Information

- Data source identification (API vs props)
- Category-dish relationship mapping
- Sample data structure visualization

## Migration Notes

### From Mock Data

1. Remove `availableDishes` prop passing
2. Component automatically uses API data
3. Mock data can be kept as fallback if needed

### Benefits

- Real-time data synchronization
- Automatic multi-tenant support
- Reduced component complexity
- Better error handling
- Performance optimizations

## Troubleshooting

### Common Issues

1. **Empty Categories**: Check if food categories API is returning data
2. **No Foods**: Verify foods API and category mapping
3. **Loading Forever**: Check network and API endpoints
4. **Wrong Branch Data**: Verify branch context and headers

### Debug Steps

1. Open browser console in development mode
2. Check API network requests in DevTools
3. Verify console logging output
4. Check React Query DevTools (if enabled)

## API Dependencies

### Required Endpoints

- `GET /api/v1/foodcategories?branchId={branchId}`
- `GET /api/v1/foods?branchId={branchId}`

### Authentication

- JWT token via Authorization header
- Branch context via X-Branch-Id header
- Handled automatically by API interceptor

### Response Format

Both endpoints should return `ApiResponseBase<T>` format:

```javascript
{
  status: "success",
  message: "Data retrieved successfully",
  data: [...] // Array of categories or foods
}
```
