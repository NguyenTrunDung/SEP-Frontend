# UserHeader Component

A reusable header component that displays user information, avatar, and dropdown menu with profile and logout options. This component automatically handles user authentication state and role-based routing.

## Features

- **User greeting display** with name or email
- **Avatar with dropdown menu** containing profile and logout options
- **Role-based profile routing** (Admin, Doctor, Patient, Staff)
- **Customizable styling** and configuration
- **Additional menu items** support
- **Responsive design** with configurable avatar sizes

## Props

| Prop                  | Type     | Default     | Description                                                       |
| --------------------- | -------- | ----------- | ----------------------------------------------------------------- |
| `style`               | Object   | `{}`        | Custom styles for the container div                               |
| `avatarSize`          | String   | `"default"` | Size of the avatar (`"small"`, `"default"`, `"large"`, or number) |
| `showGreeting`        | Boolean  | `true`      | Whether to show the greeting text                                 |
| `greetingStyle`       | Object   | `{}`        | Custom styles for the greeting text                               |
| `onLogout`            | Function | `undefined` | Additional callback function called after logout                  |
| `additionalMenuItems` | Array    | `[]`        | Additional menu items to display in dropdown                      |

## Usage Examples

### Basic Usage (Admin Layout)

```jsx
import UserHeader from "../components/common/UserHeader";

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <Header>
      <UserHeader onLogout={handleLogout} />
    </Header>
  );
};
```

### Advanced Usage (Patient Layout)

```jsx
import UserHeader from "../components/common/UserHeader";
import { ShoppingCartOutlined, CalendarOutlined } from "@ant-design/icons";

const PatientLayout = ({ children }) => {
  const handlePatientLogout = () => {
    // Custom logout logic
    window.location.href = "/login";
  };

  // Additional menu items specific to patient
  const patientMenuItems = [
    {
      key: "my-orders",
      icon: <ShoppingCartOutlined />,
      label: "Đơn hàng của tôi",
      onClick: () => (window.location.href = "/patient/orders"),
    },
    {
      key: "appointments",
      icon: <CalendarOutlined />,
      label: "Lịch khám",
      onClick: () => (window.location.href = "/patient/appointments"),
    },
  ];

  return (
    <Header>
      <UserHeader
        onLogout={handlePatientLogout}
        additionalMenuItems={patientMenuItems}
        avatarSize="large"
        greetingStyle={{ fontSize: "16px", fontWeight: "500" }}
      />
    </Header>
  );
};
```

### Minimal Usage (No Greeting)

```jsx
<UserHeader
  showGreeting={false}
  avatarSize="small"
  style={{ justifyContent: "flex-end" }}
/>
```

### Custom Styling

```jsx
<UserHeader
  style={{
    background: "#f0f2f5",
    padding: "8px 16px",
    borderRadius: "4px",
  }}
  greetingStyle={{
    color: "#1890ff",
    fontWeight: "bold",
  }}
  avatarSize={32}
/>
```

## Menu Items Structure

Additional menu items should follow this structure:

```jsx
const additionalMenuItems = [
  {
    key: "unique-key",
    icon: <IconComponent />,
    label: "Menu Item Text",
    onClick: () => {
      // Handle click
    },
    // Optional: additional props
    style: { color: "red" },
    disabled: false,
  },
  {
    type: "divider", // For separators
  },
];
```

## Automatic Features

### Role-Based Profile Routing

The component automatically routes to the correct profile page based on user role:

- **ADMIN** → `/admin/profile`
- **DOCTOR** → `/doctor/profile`
- **PATIENT** → `/patient/profile`
- **STAFF** → `/staff/profile`

### User Display Priority

The greeting displays user information in this priority:

1. `user.firstName`
2. `user.lastName`
3. `user.email`

### Authentication Integration

The component automatically:

- Uses `useAuth()` hook for user state
- Calls `logout()` function on logout
- Handles authentication state changes

## Styling Guidelines

### Default Styles

- Container: `display: flex, alignItems: center, gap: 12px`
- Greeting: `fontSize: 15px, color: #666`
- Avatar: `backgroundColor: #1890ff, cursor: pointer`

### Responsive Considerations

- Use `avatarSize="small"` for mobile layouts
- Adjust `greetingStyle.fontSize` for different screen sizes
- Consider `showGreeting={false}` for very narrow screens

## Integration with Different Layouts

### In Sidebar Layouts

```jsx
<Sider>
  <div style={{ padding: "16px", borderBottom: "1px solid #f0f0f0" }}>
    <UserHeader showGreeting={false} style={{ justifyContent: "center" }} />
  </div>
</Sider>
```

### In Top Navigation

```jsx
<Header style={{ display: "flex", justifyContent: "space-between" }}>
  <Logo />
  <UserHeader />
</Header>
```

### In Mobile Layouts

```jsx
<UserHeader
  avatarSize="small"
  greetingStyle={{ fontSize: "14px" }}
  showGreeting={false} // Hide on very small screens
/>
```

## Dependencies

- `antd` - Avatar, Dropdown, Typography components
- `react-router-dom` - Link component for navigation
- `@ant-design/icons` - UserOutlined, LogoutOutlined icons
- `../../context/AuthContext` - Authentication context
- `../../constants/roles` - Role constants

## Notes

- Component requires `AuthContext` to be available in the React tree
- Profile routes should be defined in your routing configuration
- Additional menu items are inserted before the logout option
- Logout function from `useAuth()` is called automatically
- Custom `onLogout` callback is called after the auth logout
