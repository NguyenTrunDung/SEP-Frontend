# Food Menu Creation Components - Enhanced Version

This directory contains components for creating and managing food menus with a Vietnamese interface, featuring advanced dish configuration options.

## 🚀 Recent Enhancements

### Modal Improvements

- **Larger Modal Size**: Increased from 600px to 1000px width for better visibility
- **Enhanced Height**: Increased modal height (70vh to 80vh) for more content
- **Responsive Design**: Optimized for tablets and mobile devices

### Advanced Dish Configuration

- **Detailed Pricing Options**: Configure prices for different user types (Guests, Patients, Staff)
- **Auto-fill Pricing**: Prices automatically populate based on selected dish with smart defaults
- **Quantity Management**: Set specific quantities with "large quantity" option
- **Discount System**: Configure fixed discounts and maximum discount limits
- **Enhanced Validation**: Comprehensive validation for all pricing fields

### Improved UX

- **Better Visual Design**: Enhanced styling with animations and hover effects
- **Grid Layout**: Organized pricing inputs in responsive grid layout
- **Smart Defaults**: Auto-calculated discounts (20% for patients and staff)
- **Progress Indicators**: Better loading states and user feedback

## Components Overview

### 1. CreateFoodsMenu Component

A complete modal component for creating daily food menus with advanced configuration options.

#### Features

- Date selection for menu planning
- Service time checkbox option
- Search functionality for dishes
- Dynamic menu categories:
  - Điểm tâm (Breakfast)
  - Món chính (Main Dish)
  - Món Khác (Other Dishes)
  - Nước giải khát (Beverages)
  - Tráng miệng (Dessert)
  - Món Chay (Vegetarian)
- **Enhanced dish configuration per item:**
  - Quantity settings with "large quantity" option
  - Separate pricing for Guests, Patients, and Staff
  - Discount management with auto-discount option
  - Maximum discount limits
- Form validation and error handling
- Responsive design with improved mobile experience
- Loading states and animations

#### Usage

```javascript
import CreateFoodsMenu from "../features/CreateFoodsMenu";
import { useAntModal } from "../../hooks/useAntModal";

const MyComponent = () => {
  const { open, showModal, handleCancel } = useAntModal();

  const availableDishes = [
    { id: 1, name: "Bánh mì thịt", category: "breakfast", price: 25000 },
    { id: 2, name: "Cơm sườn nướng", category: "mainDish", price: 55000 },
    // ... more dishes
  ];

  const handleSubmit = async (formData) => {
    // Process enhanced form data with detailed dish configurations
    console.log("Enhanced menu data:", formData);
  };

  return (
    <>
      <Button onClick={showModal}>Create Menu</Button>
      <CreateFoodsMenu
        open={open}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        availableDishes={availableDishes}
      />
    </>
  );
};
```

#### Props

| Prop              | Type     | Required | Default | Description                    |
| ----------------- | -------- | -------- | ------- | ------------------------------ |
| `open`            | boolean  | Yes      | -       | Controls modal visibility      |
| `onCancel`        | function | Yes      | -       | Called when modal is cancelled |
| `onSubmit`        | function | No       | -       | Called when form is submitted  |
| `initialValues`   | object   | No       | `{}`    | Initial form values            |
| `availableDishes` | array    | No       | `[]`    | Array of available dishes      |
| `loading`         | boolean  | No       | `false` | Shows loading state            |

#### Available Dishes Structure

```javascript
{
  id: string | number,        // Unique identifier
  name: string,              // Dish name
  category: string,          // Category key (breakfast, mainDish, etc.)
  price: number             // Base price in VND (used for auto-fill)
}
```

#### Enhanced Form Data Structure

```javascript
{
  date: "2024-01-15",           // Selected date
  serviceTime: true,            // Service time checkbox
  search: "phở",               // Search term
  breakfast: [                 // Array of configured breakfast items
    {
      dishId: 2,               // Selected dish ID
      quantity: 1,             // Item quantity
      largeQuantity: false,    // Large quantity checkbox
      guestPrice: 45000,       // Price for guests
      patientPrice: 36000,     // Price for patients (auto-calculated 20% discount)
      staffPrice: 36000,       // Price for staff (auto-calculated 20% discount)
      discount: 0,             // Fixed discount amount
      autoDiscount: false,     // Auto-discount checkbox
      maxDiscount: 0           // Maximum discount limit
    }
  ],
  mainDish: [                  // Array of configured main dishes
    {
      dishId: 6,
      quantity: 2,
      largeQuantity: true,
      guestPrice: 55000,
      patientPrice: 44000,
      staffPrice: 44000,
      discount: 5000,
      autoDiscount: true,
      maxDiscount: 10000
    }
  ],
  // ... other categories with similar enhanced structure
}
```

## Advanced Features

### Auto-fill Pricing System

When a dish is selected, the system automatically:

- Sets guest price to the dish's base price
- Calculates patient price with 20% discount
- Calculates staff price with 20% discount
- Maintains all other fields as configured

### Responsive Grid Layout

- **Desktop (1200px+)**: 4-column grid for pricing inputs
- **Tablet (768-1199px)**: 2-column responsive grid
- **Mobile (<768px)**: Single column layout

### Enhanced Validation

All pricing fields include:

- Required field validation for essential fields
- Number formatting with thousand separators
- Min/max value constraints
- Real-time validation feedback

### Smart UX Features

1. **Progressive Disclosure**: Detailed options only appear after dish selection
2. **Visual Feedback**: Hover effects and smooth animations
3. **Smart Defaults**: Intelligent auto-calculation of pricing
4. **Contextual Help**: Tooltips and clear labeling
5. **Error Prevention**: Input constraints and validation

## Styling Enhancements

### New CSS Classes

- `.dish-item-container`: Enhanced dish item styling with shadows
- `.dish-details-section`: Detailed configuration area
- `.price-inputs-grid`: Responsive grid for pricing inputs
- `.discount-inputs-grid`: Grid layout for discount options
- `.quantity-checkbox`: Styling for quantity options

### Animation Features

- Smooth slide-in animations for new dish items
- Hover effects on interactive elements
- Loading state transitions
- Responsive transform effects

### Color-coded Categories

Each category has distinct visual identity:

- Breakfast: Green (#52c41a)
- Main Dish: Blue (#1890ff)
- Other Dishes: Purple (#722ed1)
- Beverages: Orange (#fa541c)
- Desserts: Pink (#eb2f96)
- Vegetarian: Cyan (#13c2c2)

## Performance Optimizations

1. **Smart Re-rendering**: Only affected form sections update on changes
2. **Efficient Validation**: Debounced validation for better performance
3. **Memory Management**: Proper cleanup on modal close
4. **Responsive Images**: Optimized for different screen sizes

## Best Practices for Enhanced Features

1. **Data Validation**: Always validate pricing data on both client and server
2. **User Experience**: Provide clear feedback for all user actions
3. **Accessibility**: Ensure all inputs are keyboard navigable
4. **Error Handling**: Implement comprehensive error handling for pricing calculations
5. **Testing**: Test all pricing calculations and discount scenarios
6. **Mobile Optimization**: Ensure touch-friendly interfaces on mobile devices

## API Integration Example

```javascript
const handleEnhancedSubmit = async (formData) => {
  try {
    // Transform data for API
    const menuData = {
      date: formData.date,
      serviceTime: formData.serviceTime,
      categories: Object.keys(formData)
        .filter((key) => !["date", "serviceTime", "search"].includes(key))
        .reduce((acc, category) => {
          acc[category] = formData[category].map((item) => ({
            dishId: item.dishId,
            configuration: {
              quantity: item.quantity,
              pricing: {
                guest: item.guestPrice,
                patient: item.patientPrice,
                staff: item.staffPrice,
              },
              discounts: {
                fixed: item.discount,
                auto: item.autoDiscount,
                maximum: item.maxDiscount,
              },
              options: {
                largeQuantity: item.largeQuantity,
              },
            },
          }));
          return acc;
        }, {}),
    };

    // Send to API
    await menuService.createEnhancedMenu(menuData);
  } catch (error) {
    // Handle errors
    console.error("Failed to create menu:", error);
  }
};
```

## Dependencies

- React 18+
- Ant Design 5+ (InputNumber, enhanced Form components)
- PropTypes for type checking
- Enhanced CSS with CSS Grid and Flexbox
- Modern JavaScript features (optional chaining, nullish coalescing)

## Migration from Basic Version

If upgrading from the basic version:

1. Update form data handlers to expect enhanced structure
2. Modify API integration to handle detailed dish configurations
3. Update any existing validation logic
4. Test responsive design on all target devices
5. Verify accessibility compliance with new features
