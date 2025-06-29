# Food Category Sort Management - Implementation Guide

## Problem Statement

The current Food Category creation form requires users to manually input sort order numbers, which leads to:

- Poor user experience (users shouldn't need to know sort numbers)
- Potential conflicts (duplicate sort numbers)
- Manual effort in determining correct sort order
- No visual way to reorder categories

## Solution Overview

Implement automatic sort handling with drag-and-drop reordering capabilities:

1. **Remove sort field from create form** - Backend auto-assigns sort order
2. **Keep sort field in edit form** - For manual fine-tuning if needed
3. **Add drag-and-drop reordering** - Visual reordering in the table
4. **Backend API for bulk reordering** - Efficient sort order updates

## Frontend Implementation

### 1. Create Form Changes ✅

**File**: `src/modules/Admin/FoodCategories/CreateFoodCategory.js`

- Removed sort field from create form
- Backend will auto-assign sort order (next available number)

### 2. Edit Form (Kept for Manual Adjustment)

**File**: `src/modules/Admin/FoodCategories/EditFoodCategory.js`

- Keep sort field for manual adjustment when needed
- Users can still manually set specific sort orders during editing

### 3. Drag-and-Drop Table Component

**File**: `src/components/common/DragDropTable.js` (to be created)

Features:

- Drag handle icon in first column
- Real-time visual feedback during dragging
- Optimistic UI updates
- Error handling with rollback
- Automatic sort number recalculation

### 4. Updated Food Categories Table

**File**: `src/modules/Admin/FoodCategories/FoodCategoriesTable.js` (to be updated)

- Replace ReusableTable with DragDropTable
- Add reorder functionality
- Integrate with backend reorder API

## Backend Implementation Requirements

### 1. Auto-Sort Assignment

**Create Food Category API**:

```csharp
// In FoodCategoryService.CreateFoodCategory
var maxSort = await _context.FoodCategories
    .Where(fc => fc.BranchId == branchId)
    .MaxAsync(fc => (int?)fc.Sort) ?? 0;

newCategory.Sort = maxSort + 1;
```

### 2. Bulk Reorder API

**New Endpoint**: `PUT /api/v1/foodcategories/reorder`

```csharp
[HttpPut("reorder")]
public async Task<ApiResponseBase<bool>> ReorderCategories([FromBody] ReorderCategoriesRequest request)
{
    var reorderItems = request.ReorderItems; // List<{CategoryId, NewSort}>

    // Update all categories in a transaction
    using var transaction = await _context.Database.BeginTransactionAsync();
    try
    {
        foreach (var item in reorderItems)
        {
            var category = await _context.FoodCategories.FindAsync(item.CategoryId);
            if (category != null)
            {
                category.Sort = item.NewSort;
            }
        }

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        return new ApiResponseBase<bool> { Data = true, Message = "Reorder successful" };
    }
    catch (Exception ex)
    {
        await transaction.RollbackAsync();
        throw;
    }
}
```

### 3. DTO Classes

```csharp
public class ReorderCategoriesRequest
{
    public List<ReorderItem> ReorderItems { get; set; }
}

public class ReorderItem
{
    public int CategoryId { get; set; }
    public int NewSort { get; set; }
}
```

## Dependencies Required

### Frontend Dependencies

Add to `package.json`:

```json
{
  "@dnd-kit/core": "^6.0.0",
  "@dnd-kit/sortable": "^7.0.0",
  "@dnd-kit/utilities": "^3.2.0",
  "@dnd-kit/modifiers": "^6.0.0"
}
```

Install command:

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities @dnd-kit/modifiers
```

## Implementation Steps

### Phase 1: Basic Auto-Sort ✅

- [x] Remove sort field from create form
- [ ] Update backend to auto-assign sort numbers
- [ ] Update frontend service calls

### Phase 2: Drag-and-Drop (Optional Enhancement)

- [ ] Create DragDropTable component
- [ ] Update FoodCategoriesTable to use drag-drop
- [ ] Add reorder API endpoint
- [ ] Add reorder service function
- [ ] Update React Query hooks for reordering

### Phase 3: Enhanced UX (Future)

- [ ] Add bulk move operations (move to top/bottom)
- [ ] Add insertion point indicators
- [ ] Add keyboard shortcuts for reordering
- [ ] Add undo functionality

## Usage Examples

### 1. Create Category (Simplified)

```jsx
// No sort field needed - auto-handled by backend
<Form.Item name="name" label="Category Name">
  <Input placeholder="Enter category name" />
</Form.Item>
```

### 2. Drag-and-Drop Table

```jsx
import DragDropTable from "../../../components/common/DragDropTable";

const FoodCategoriesTable = ({ dataSource, onReorder, ...props }) => {
  return (
    <DragDropTable
      dataSource={dataSource}
      columns={columns}
      onReorder={onReorder}
      rowKey="id"
      {...props}
    />
  );
};
```

### 3. Reorder Handler

```jsx
const handleReorder = async (reorderItems, newData) => {
  await foodCategoryService.reorderCategories(reorderItems);
  // React Query will automatically refetch and update cache
};
```

## Benefits

### User Experience

- ✅ **Simplified creation**: No need to think about sort numbers
- ✅ **Visual reordering**: Drag-and-drop is intuitive
- ✅ **Immediate feedback**: Real-time visual updates
- ✅ **Error recovery**: Automatic rollback on failures

### Developer Experience

- ✅ **Reduced complexity**: No manual sort number management
- ✅ **Consistent ordering**: Backend ensures no conflicts
- ✅ **Reusable component**: DragDropTable can be used elsewhere
- ✅ **Type safety**: Proper TypeScript/PropTypes

### System Benefits

- ✅ **Data integrity**: No duplicate or conflicting sort numbers
- ✅ **Performance**: Bulk updates in single transaction
- ✅ **Scalability**: Efficient reordering for large lists
- ✅ **Maintainability**: Clear separation of concerns

## Testing Strategy

### Unit Tests

- Test auto-sort assignment in backend
- Test drag-drop component behavior
- Test reorder API endpoint

### Integration Tests

- Test create category with auto-sort
- Test bulk reorder operations
- Test error handling and rollback

### User Acceptance Tests

- Create category without specifying sort
- Reorder categories using drag-and-drop
- Verify sort order persists after page refresh
- Test error scenarios (network failures, etc.)

## Migration Plan

### Existing Data

- All existing categories already have sort numbers
- No migration needed for data
- Remove sort requirement from create forms only

### Rollback Plan

- Keep edit form sort field for manual adjustment
- Backend can still accept manual sort numbers
- Easy to revert frontend changes if needed

## Future Enhancements

1. **Multi-level Sorting**: Sub-categories with nested drag-drop
2. **Batch Operations**: Move multiple items at once
3. **Sort Templates**: Predefined sorting patterns
4. **History Tracking**: Audit trail for sort changes
5. **Performance Optimization**: Virtual scrolling for large lists

This implementation provides a much better user experience while maintaining flexibility and system integrity.
