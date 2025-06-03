# PageWrapper HOC

A Higher-Order Component (HOC) that provides consistent page layout structure across all admin pages, based on the menu page design for UI consistency.

## Features

- **Consistent Layout**: Provides standardized page header with title, description, and action buttons
- **Flexible Button System**: Support for primary button, secondary buttons, and refresh functionality
- **Statistics Cards**: Optional statistics section with customizable cards
- **Responsive Design**: Mobile-friendly layout following Ant Design principles
- **Full Customization**: Extensive props for customizing appearance and behavior
- **TypeScript Support**: Complete PropTypes validation for better development experience

## Installation

```javascript
import withPageWrapper from "../components/common/PageWrapper";
```

## Basic Usage

### Simple Page

```javascript
import React from "react";
import { PlusOutlined } from "@ant-design/icons";
import withPageWrapper from "../components/common/PageWrapper";

// Your page component
const MyPageComponent = ({ children }) => {
  return (
    <div style={{ padding: "24px", background: "#fff", borderRadius: "8px" }}>
      <h3>My Page Content</h3>
      {children}
    </div>
  );
};

// Wrap with PageWrapper HOC
const MyPage = withPageWrapper(MyPageComponent);

// Use the wrapped component
const MyPageContainer = () => {
  const handleCreate = () => {
    console.log("Create button clicked");
  };

  const handleRefresh = () => {
    console.log("Refresh clicked");
  };

  return (
    <MyPage
      pageTitle="My Page"
      pageDescription="This is my page description"
      pageIcon="📄"
      primaryButton={{
        text: "Create New",
        icon: <PlusOutlined />,
        onClick: handleCreate,
      }}
      onRefresh={handleRefresh}
    />
  );
};
```

### Advanced Page with Statistics

```javascript
import React, { useState } from "react";
import {
  PlusOutlined,
  ExportOutlined,
  UserOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import withPageWrapper from "../components/common/PageWrapper";

const AdvancedPageComponent = () => {
  // Your page content here
  return <div>Advanced page content</div>;
};

const AdvancedPage = withPageWrapper(AdvancedPageComponent);

const AdvancedPageContainer = () => {
  const [loading, setLoading] = useState(false);

  return (
    <AdvancedPage
      pageTitle="Advanced Management"
      pageDescription="Complete example with statistics and multiple buttons"
      pageIcon="🚀"
      loading={loading}
      // Primary button
      primaryButton={{
        text: "Create New Item",
        icon: <PlusOutlined />,
        onClick: () => console.log("Create clicked"),
        loading: loading,
      }}
      // Secondary buttons
      secondaryButtons={[
        {
          text: "Export Data",
          icon: <ExportOutlined />,
          onClick: () => console.log("Export clicked"),
        },
        {
          text: "Delete Selected",
          onClick: () => console.log("Delete clicked"),
          danger: true,
        },
      ]}
      // Statistics
      showStatistics={true}
      statistics={[
        {
          title: "Total Items",
          value: 1234,
          icon: <ShoppingCartOutlined />,
          color: "#1890ff",
        },
        {
          title: "Active Users",
          value: 987,
          icon: <UserOutlined />,
          color: "#52c41a",
        },
      ]}
      onRefresh={() => setLoading(true)}
    />
  );
};
```

## API Reference

### Props

| Prop               | Type     | Required | Default   | Description                                     |
| ------------------ | -------- | -------- | --------- | ----------------------------------------------- |
| `pageTitle`        | string   | ✅       | -         | The main title of the page                      |
| `pageDescription`  | string   | ❌       | -         | Subtitle/description text                       |
| `pageIcon`         | string   | ❌       | '📄'      | Emoji or icon to display before title           |
| `primaryButton`    | object   | ❌       | -         | Configuration for main action button            |
| `secondaryButtons` | array    | ❌       | []        | Array of secondary action buttons               |
| `loading`          | boolean  | ❌       | false     | Global loading state for the page               |
| `onRefresh`        | function | ❌       | -         | Callback for refresh button                     |
| `refreshText`      | string   | ❌       | 'Làm mới' | Text for refresh button                         |
| `showRefresh`      | boolean  | ❌       | true      | Whether to show refresh button                  |
| `containerStyle`   | object   | ❌       | {}        | Custom styles for page container                |
| `statistics`       | array    | ❌       | []        | Array of statistic card configurations          |
| `showStatistics`   | boolean  | ❌       | false     | Whether to display statistics section           |
| `children`         | node     | ❌       | -         | Additional content to pass to wrapped component |

### Primary Button Configuration

```javascript
primaryButton: {
    text: string,           // Required: Button text
    icon: ReactNode,        // Optional: Icon component
    onClick: function,      // Required: Click handler
    loading: boolean,       // Optional: Loading state
    disabled: boolean,      // Optional: Disabled state
    style: object,          // Optional: Custom styles
    props: object          // Optional: Additional props
}
```

### Secondary Button Configuration

```javascript
secondaryButtons: [
    {
        text: string,           // Required: Button text
        icon: ReactNode,        // Optional: Icon component
        onClick: function,      // Required: Click handler
        loading: boolean,       // Optional: Loading state
        disabled: boolean,      // Optional: Disabled state
        type: string,          // Optional: Button type ('default', 'primary', etc.)
        danger: boolean,       // Optional: Danger style
        style: object,         // Optional: Custom styles
        props: object         // Optional: Additional props
    }
]
```

### Statistics Configuration

```javascript
statistics: [
    {
        title: string,              // Required: Statistic title
        value: string|number,       // Required: Statistic value
        icon: ReactNode,           // Optional: Icon component
        suffix: string,            // Optional: Value suffix
        color: string,             // Optional: Value color
        precision: number,         // Optional: Decimal precision
        formatter: function,       // Optional: Custom formatter
        valueStyle: object,        // Optional: Value styling
        props: object             // Optional: Additional Statistic props
    }
]
```

## Layout Structure

The PageWrapper HOC creates the following layout structure:

```
┌─────────────────────────────────────────────────────┐
│ Container (max-width: 1600px, centered)            │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Header Card                                     │ │
│ │ ┌─────────────────┐ ┌─────────────────────────┐ │ │
│ │ │ Title & Desc    │ │ Buttons (Refresh + Pri) │ │ │
│ │ │ 📄 Page Title   │ │ [Secondary] [Refresh]   │ │ │
│ │ │ Description     │ │ [Primary]               │ │ │
│ │ └─────────────────┘ └─────────────────────────┘ │ │
│ └─────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Statistics Cards (if enabled)                   │ │
│ │ [Stat 1] [Stat 2] [Stat 3] [Stat 4]            │ │
│ └─────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Wrapped Component Content                       │ │
│ │ (Your actual page content goes here)            │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

## Styling

### Default Styles

The HOC applies consistent styling that matches the menu page:

- **Container**: Max-width 1600px, centered, light background
- **Header Card**: Rounded corners (12px), white background
- **Title**: 2.2rem font size, bold weight
- **Description**: 1.1rem font size, muted color
- **Buttons**: 48px height, rounded corners (8px)
- **Statistics**: Centered cards with large values

### Customization

You can customize the appearance using the provided style props:

```javascript
<MyPage
  containerStyle={{
    background: "linear-gradient(to bottom, #f0f2f5, #e6f7ff)",
    maxWidth: "1200px",
  }}
  primaryButton={{
    text: "Custom Action",
    onClick: handleAction,
    style: {
      background: "#722ed1",
      borderColor: "#722ed1",
    },
  }}
/>
```

## Best Practices

### 1. Component Organization

```javascript
// ✅ Good: Separate your page logic from the wrapper
const MyPageLogic = ({ data, onAction }) => {
  // Page-specific logic and rendering
  return <div>Content</div>;
};

const MyPage = withPageWrapper(MyPageLogic);

// ✅ Good: Keep wrapper configuration in container
const MyPageContainer = () => {
  return (
    <MyPage
      pageTitle="My Page"
      primaryButton={
        {
          /* config */
        }
      }
      // ... other props
    />
  );
};
```

### 2. State Management

```javascript
// ✅ Good: Manage loading state properly
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  try {
    await someAsyncAction();
  } finally {
    setLoading(false);
  }
};

return (
  <MyPage
    loading={loading}
    primaryButton={{
      onClick: handleAction,
      loading: loading, // This will show button loading state
    }}
  />
);
```

### 3. Error Handling

```javascript
// ✅ Good: Handle errors gracefully
const handleAction = async () => {
  try {
    await someAction();
    message.success("Action completed successfully!");
  } catch (error) {
    message.error("Action failed. Please try again.");
  }
};
```

### 4. Responsive Design

The HOC automatically handles responsive design, but ensure your wrapped component is also responsive:

```javascript
// ✅ Good: Responsive content
const ResponsiveContent = () => (
  <Row gutter={[16, 16]}>
    <Col xs={24} sm={12} lg={8}>
      Content 1
    </Col>
    <Col xs={24} sm={12} lg={8}>
      Content 2
    </Col>
  </Row>
);
```

## Examples

See `PageWrapper.example.js` for comprehensive usage examples including:

1. **Simple Page**: Basic configuration with title and primary button
2. **Advanced Page**: Full features with statistics and multiple buttons
3. **Custom Styled Page**: Custom styling and theming
4. **Minimal Page**: Minimal configuration without refresh button

## Migration Guide

### From existing pages to PageWrapper

1. **Extract your page content** into a separate component
2. **Wrap with PageWrapper HOC**
3. **Move header elements** to PageWrapper props
4. **Update button handlers** to use PageWrapper button configuration

```javascript
// Before
const OldPage = () => (
  <div>
    <h1>My Page</h1>
    <Button onClick={handleAction}>Action</Button>
    <div>Content</div>
  </div>
);

// After
const PageContent = () => <div>Content</div>;
const NewPage = withPageWrapper(PageContent);

const NewPageContainer = () => (
  <NewPage
    pageTitle="My Page"
    primaryButton={{
      text: "Action",
      onClick: handleAction,
    }}
  />
);
```

## TypeScript Support

The HOC includes comprehensive PropTypes validation. For TypeScript projects, you can create interface definitions:

```typescript
interface PageWrapperProps {
  pageTitle: string;
  pageDescription?: string;
  pageIcon?: string;
  primaryButton?: {
    text: string;
    icon?: React.ReactNode;
    onClick: () => void;
    loading?: boolean;
    disabled?: boolean;
    style?: React.CSSProperties;
    props?: any;
  };
  // ... other props
}
```

## Troubleshooting

### Common Issues

1. **Buttons not appearing**: Ensure `onClick` handlers are provided
2. **Statistics not showing**: Set `showStatistics={true}`
3. **Content not responsive**: Use Ant Design's Grid system in wrapped component
4. **Styling conflicts**: Use `containerStyle` prop instead of direct styling

### Performance Considerations

- The HOC uses React.memo internally for optimal performance
- Avoid creating new objects in render for button configs
- Use useCallback for event handlers when necessary

```javascript
// ✅ Good: Memoized handlers
const handleCreate = useCallback(() => {
  // action logic
}, [dependencies]);

const buttonConfig = useMemo(
  () => ({
    text: "Create",
    onClick: handleCreate,
  }),
  [handleCreate]
);
```
