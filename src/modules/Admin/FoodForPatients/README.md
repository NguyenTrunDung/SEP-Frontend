# FoodForPatients Management System

## Overview

The FoodForPatients management system allows administrators to manage food restrictions for patients based on their disease categories. This system helps ensure that patients with specific medical conditions receive appropriate dietary guidance and restrictions.

## Features

### 1. Disease Category Food Restrictions Management

- **List View**: Display all food restrictions with filtering and search capabilities
- **Create**: Add new food restrictions for specific disease categories
- **Edit**: Modify existing food restrictions
- **Delete**: Remove food restrictions
- **View Details**: Detailed view of each restriction with all information

### 2. Advanced Filtering

- **Search**: Search by food name, disease category name, or reason
- **Disease Category Filter**: Filter by specific disease categories
- **Restriction Level Filter**: Filter by restriction level (Warning, Restricted, Forbidden)
- **Clear Filters**: Reset all filters with one click

### 3. Restriction Levels

- **Warning (Level 1)**: Yellow - Caution advised
- **Restricted (Level 2)**: Red - Should be limited
- **Forbidden (Level 3)**: Dark Red - Completely prohibited

## Components

### Main Components

1. **FoodForPatientPage.js** - Main page component with PageWrapperV2
2. **DiseaseCategoryFoodRestrictionsTable.js** - Table component with filtering and search
3. **CreateDiseaseCategoryFoodRestriction.js** - Form for creating new restrictions
4. **EditDiseaseCategoryFoodRestriction.js** - Form for editing existing restrictions

### Services and Hooks

1. **diseaseCategoryFoodRestrictionService.js** - API service for CRUD operations
2. **useDiseaseCategoryFoodRestrictions.js** - React Query hooks for data management

## API Endpoints

### Disease Category Food Restrictions

- `GET /api/v1/DiseaseCategoryFoodRestrictions?branchId=1` - List all restrictions
- `POST /api/v1/DiseaseCategoryFoodRestrictions` - Create new restriction
- `PUT /api/v1/DiseaseCategoryFoodRestrictions/{id}` - Update restriction
- `DELETE /api/v1/DiseaseCategoryFoodRestrictions/{id}` - Delete restriction
- `GET /api/v1/DiseaseCategoryFoodRestrictions/{id}` - Get specific restriction

### Disease Categories

- `GET /api/v1/DiseaseCategories?branchId=1` - List all disease categories

## Data Structure

### Disease Category Food Restriction

```javascript
{
  id: number,
  branchId: number,
  diseaseCategoryId: number,
  foodId: number,
  restrictionLevel: number, // 1=Warning, 2=Restricted, 3=Forbidden
  reason: string,
  alternativeRecommendations: string,
  isActive: boolean,
  requiresPhysicianOverride: boolean,
  createdAt: string,
  createdBy: string,
  lastModifiedAt: string,
  lastModifiedBy: string,
  branchName: string,
  diseaseCategoryName: string,
  diseaseCategoryCode: string,
  foodName: string,
  foodPrice: number,
  restrictionLevelName: string,
  restrictionLevelColor: string,
  restrictionLevelDisplay: string,
  restrictionLevelColorCode: string
}
```

### Disease Category

```javascript
{
  id: number,
  branchId: number,
  name: string,
  code: string,
  description: string,
  dietaryRestrictions: string,
  recommendedFoods: string,
  isActive: boolean,
  severityLevel: number,
  requiresApproval: boolean,
  colorCode: string,
  sortOrder: number,
  createdAt: string,
  createdBy: string,
  lastModifiedAt: string,
  lastModifiedBy: string,
  branchName: string,
  totalPatients: number,
  totalFoodRestrictions: number
}
```

## Usage

### Accessing the Page

Navigate to `/food-for-patients` in the admin interface.

### Adding a New Restriction

1. Click "Thêm Hạn Chế Mới" button
2. Select disease category from dropdown
3. Select food from dropdown
4. Choose restriction level
5. Enter reason for restriction
6. Add alternative recommendations (optional)
7. Set physician override requirement
8. Set active status
9. Click "Lưu Hạn Chế"

### Editing a Restriction

1. Click the edit icon on any row
2. Modify the form fields as needed
3. Click "Cập nhật hạn chế"

### Deleting a Restriction

1. Click the delete icon on any row
2. Confirm deletion in the popup

### Filtering and Searching

- Use the search box to find specific restrictions
- Use the disease category filter to show restrictions for specific conditions
- Use the restriction level filter to show restrictions by severity
- Click "Xóa tất cả bộ lọc" to reset all filters

## Permissions

The following roles have access to this feature:

- SYSTEM_ADMIN
- ADMIN
- BRANCH_MANAGER
- MANAGER
- STAFF
- DOCTOR

## Technical Implementation

### React Query Integration

- Uses React Query for efficient data fetching and caching
- Automatic cache invalidation on mutations
- Optimistic updates for better UX

### Multi-Tenant Support

- Branch-aware data fetching
- Proper branch context in all API calls
- Branch-specific filtering and permissions

### Error Handling

- Comprehensive error handling with user-friendly messages
- Automatic retry logic for failed requests
- Graceful fallbacks for missing data

### Performance

- Debounced search to reduce API calls
- Efficient filtering and pagination
- Optimized re-renders with React.memo

## Future Enhancements

1. **Bulk Operations**: Add bulk create/edit/delete functionality
2. **Import/Export**: CSV import/export for restrictions
3. **Audit Trail**: Track changes to restrictions
4. **Advanced Search**: Full-text search across all fields
5. **Reports**: Generate reports on restriction patterns
6. **Patient Integration**: Link restrictions to patient records
7. **Notification System**: Alert when restrictions are modified

## Testing

Use the test component `FoodForPatientPage.test.js` to verify the page loads correctly:

```javascript
import FoodForPatientPageTest from "./FoodForPatientPage.test.js";
```

## Dependencies

- React Query for data management
- Ant Design for UI components
- React Router for navigation
- Custom hooks for form management and modals
