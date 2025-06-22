# Food Categories API Integration

## Overview

Complete implementation of Food Categories CRUD operations with real API integration to the backend `FoodCategoriesController.cs`.

## Backend API Structure

The `FoodCategoriesController.cs` provides these endpoints:

### GET /api/v1/foodcategories?branchId={branchId}

- **Purpose**: Get all categories for a specific branch
- **Authorization**: `Permission:foodcategories:view`
- **Response**: `ApiResponseBase<IEnumerable<FoodCategoryDto>>`

### GET /api/v1/foodcategories/{id}

- **Purpose**: Get specific category by ID
- **Authorization**: `Permission:foodcategories:view`
- **Response**: `ApiResponseBase<FoodCategoryDto>`

### POST /api/v1/foodcategories

- **Purpose**: Create new category
- **Authorization**: `Permission:foodcategories:add`
- **Body**: `FoodCategoryDto`
- **Response**: `ApiResponseBase<FoodCategoryDto>`

### PUT /api/v1/foodcategories/{id}

- **Purpose**: Update existing category
- **Authorization**: `Permission:foodcategories:edit`
- **Body**: `FoodCategoryDto`
- **Response**: `ApiResponseBase<FoodCategoryDto>`

### DELETE /api/v1/foodcategories/{id}

- **Purpose**: Delete category
- **Authorization**: `Permission:foodcategories:delete`
- **Response**: `ApiResponseBase<object>`

## Frontend Implementation

### 1. Updated Service (`src/services/foodCategoryService.js`)

#### Key Features:

- Direct API endpoint mapping
- ApiResponseBase response handling
- Branch context via query parameters
- Comprehensive error handling
- Form data helper utilities

#### Core Methods:

```javascript
// Fetch categories by branch
const categories = await foodCategoryService.getFoodCategories(branchId);

// Get single category
const category = await foodCategoryService.getFoodCategoryById(categoryId);

// Create category
const result = await foodCategoryService.createFoodCategory({
  name: "New Category",
  sort: 1,
  imageUrl: "image.jpg",
  branchId: 1,
});

// Update category
const result = await foodCategoryService.updateFoodCategory(id, categoryData);

// Delete category
const result = await foodCategoryService.deleteFoodCategory(id);
```

### 2. React Query Hooks (`src/hooks/queries/useFoodCategories.js`)

#### Branch-Aware Query Keys:

```javascript
export const FOOD_CATEGORY_QUERY_KEYS = {
  all: ["foodCategories"],
  lists: () => [...FOOD_CATEGORY_QUERY_KEYS.all, "list"],
  list: (branchId) => [...FOOD_CATEGORY_QUERY_KEYS.lists(), { branchId }],
  details: () => [...FOOD_CATEGORY_QUERY_KEYS.all, "detail"],
  detail: (id, branchId) => [
    ...FOOD_CATEGORY_QUERY_KEYS.details(),
    id,
    { branchId },
  ],
};
```

#### Available Hooks:

**Query Hooks:**

- `useFoodCategories(branchId, options)` - Get all categories
- `useFoodCategory(categoryId, branchId, options)` - Get single category

**Mutation Hooks:**

- `useCreateFoodCategory(options)` - Create category
- `useUpdateFoodCategory(options)` - Update category
- `useDeleteFoodCategory(options)` - Delete category

**Convenience Hooks:**

- `useCreateFoodCategoryFromForm(branchId, options)` - Create from form
- `useUpdateFoodCategoryFromForm(branchId, options)` - Update from form
- `useBulkFoodCategoryOperations(options)` - Bulk operations

### 3. Component Integration (`src/modules/Admin/FoodCategories/index.js`)

#### Modern React Query Pattern:

```javascript
const FoodCategories = () => {
  const branchId = environment.multiTenant.getCurrentBranchId() || "1";

  // React Query hooks
  const { categories, isLoading, error, refetch } = useFoodCategories(branchId);
  const createCategoryMutation = useCreateFoodCategory();
  const updateCategoryMutation = useUpdateFoodCategory();
  const deleteCategoryMutation = useDeleteFoodCategory();

  const handleCreateOrUpdate = async (formData) => {
    const payload = {
      name: formData.name,
      sort: parseInt(formData.sort, 10) || 0,
      imageUrl: formData.imageUrl || "",
      branchId: parseInt(branchId, 10),
    };

    if (formData.id) {
      await updateCategoryMutation.mutateAsync({
        categoryId: formData.id,
        categoryData: payload,
      });
    } else {
      await createCategoryMutation.mutateAsync(payload);
    }
  };
};
```

### 4. Enhanced Table with Images (`src/modules/Admin/FoodCategories/FoodCategoriesTable.js`)

#### Image Column Implementation:

```javascript
{
  title: 'HÌNH ẢNH',
  dataIndex: 'imageUrl',
  key: 'imageUrl',
  width: 100,
  align: 'center',
  render: (url, record) => (
    <FoodImage
      src={url}
      alt={record.name}
      size="small"
      preview={true}
    />
  ),
}
```

## Key Benefits

### ✅ Real API Integration

- Direct connection to backend controller
- Proper authentication and authorization
- Real data persistence

### ✅ Multi-Tenant Support

- Branch-specific category management
- Isolated cache per branch
- Proper branch context handling

### ✅ Modern State Management

- React Query for server state
- Automatic cache management
- Optimistic updates
- Built-in error handling

### ✅ Enhanced User Experience

- Loading states during operations
- Success/error notifications
- Image preview functionality
- Responsive design

### ✅ Developer Experience

- Type-safe hooks
- Comprehensive error handling
- Debugging support
- Clear separation of concerns

## Cache Management

### Automatic Invalidation:

- **Create**: Invalidates category list
- **Update**: Updates specific category + invalidates list
- **Delete**: Removes from cache + invalidates list

### Branch Isolation:

- Each branch has separate cache keys
- Switching branches loads correct data
- No cross-contamination between branches

## Error Handling

### Service Level:

```javascript
try {
  const categories = await foodCategoryService.getFoodCategories(branchId);
} catch (error) {
  console.error(
    "Failed to fetch categories:",
    error.response?.data || error.message
  );
  throw error;
}
```

### Hook Level:

```javascript
const createMutation = useCreateFoodCategory({
  onSuccess: (response) => {
    message.success(response.message || "Tạo danh mục thành công!");
  },
  onError: (error) => {
    message.error(error.response?.data?.message || "Không thể tạo danh mục!");
  },
});
```

## Testing

### Basic API Testing:

```javascript
// Test in browser console
import { foodCategoryService } from "./src/services/foodCategoryService";

// Create test category
const result = await foodCategoryService.createFoodCategory({
  name: "Test Category",
  sort: 1,
  imageUrl: "",
  branchId: 1,
});

// Fetch categories
const categories = await foodCategoryService.getFoodCategories(1);
console.log("Categories:", categories);
```

### Hook Testing:

```javascript
// Test React Query integration
const { categories, isLoading, error } = useFoodCategories(1);
console.log("Hook result:", { categories, isLoading, error });
```

## Migration Guide

### From Old Implementation:

1. Replace direct service calls with hooks
2. Remove manual state management
3. Let React Query handle caching
4. Use mutation hooks for CRUD operations

### Example Migration:

```javascript
// Before
const [categories, setCategories] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  foodCategoryService
    .getFoodCategories(branchId)
    .then(setCategories)
    .finally(() => setLoading(false));
}, [branchId]);

// After
const { categories, isLoading } = useFoodCategories(branchId);
```

## Troubleshooting

### Common Issues:

#### Categories not loading:

1. Check branchId value
2. Verify backend API is running
3. Check network requests in browser dev tools
4. Verify authentication token

#### Cache not updating:

1. Check mutation success handlers
2. Verify query key consistency
3. Force refetch if needed: `refetch()`

#### Images not displaying:

1. Verify static files configuration in backend
2. Check image URL format
3. Test direct image URL access

### Debug Commands:

```javascript
// Check React Query cache
import { queryClient } from "../lib/reactQuery";
queryClient.getQueryCache().getAll();

// Force category refetch
const { refetch } = useFoodCategories(branchId);
refetch();
```

## Best Practices

### 1. Always use hooks for data operations

```javascript
// ✅ Recommended
const { categories, isLoading } = useFoodCategories(branchId);

// ❌ Avoid
const [categories, setCategories] = useState([]);
// Manual API calls...
```

### 2. Handle loading and error states

```javascript
if (isLoading) return <Spin spinning />;
if (error) return <Alert message="Error loading data" type="error" />;
```

### 3. Use proper mutation patterns

```javascript
const createMutation = useCreateFoodCategory();

const handleSubmit = async (formData) => {
  try {
    await createMutation.mutateAsync(formData);
    // Success handling automatic
  } catch (error) {
    // Error handling automatic
  }
};
```

## Future Enhancements

1. **Bulk Operations**: Multi-select and batch operations
2. **Advanced Filtering**: Search, sort, filter categories
3. **Image Management**: Upload, crop, optimize images
4. **Import/Export**: CSV import/export functionality
5. **Audit Trail**: Track category changes
6. **Category Hierarchy**: Parent-child category relationships

This implementation provides a solid foundation for food category management with real API integration, proper state management, and excellent user experience.
