# UserHeader Component - Usage Examples for Guest and Authenticated Users

## Enhanced Features

The UserHeader component now supports:

- **Guest Mode** - Shows login/register buttons for non-authenticated users
- **Authentication Detection** - Automatically detects user authentication state
- **Role-based Features** - Shows different menu items based on user role
- **Management Role Detection** - Adds dashboard link for admin/staff users

## Props Reference

| Prop                  | Type          | Default     | Description                                       |
| --------------------- | ------------- | ----------- | ------------------------------------------------- |
| `guestMode`           | Boolean       | `false`     | Force guest mode (shows login/register buttons)   |
| `showGuestButtons`    | Boolean       | `true`      | Whether to show login/register buttons for guests |
| `guestButtonStyle`    | String        | `'button'`  | Style for guest buttons: `'button'` or `'link'`   |
| `style`               | Object        | `{}`        | Custom styles for container                       |
| `avatarSize`          | String/Number | `"default"` | Avatar size                                       |
| `showGreeting`        | Boolean       | `true`      | Show greeting text for authenticated users        |
| `greetingStyle`       | Object        | `{}`        | Custom greeting text styles                       |
| `onLogout`            | Function      | `undefined` | Additional logout callback                        |
| `additionalMenuItems` | Array         | `[]`        | Extra menu items                                  |

## Usage Examples

### 1. Guest Layout (DefaultLayout.js)

```jsx
import UserHeader from "../components/common/UserHeader";

const DefaultLayout = () => {
  return (
    <Layout>
      <Header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Logo />
        {/* Guest mode - shows login/register buttons */}
        <UserHeader
          guestMode={true}
          showGuestButtons={true}
          guestButtonStyle="button"
        />
      </Header>
      {/* Rest of layout */}
    </Layout>
  );
};
```

### 2. Auto-Detection Mode

```jsx
// Automatically detects authentication state
<UserHeader />

// For guests: Shows login/register buttons
// For authenticated users: Shows avatar and dropdown
```

### 3. Guest with Link Style

```jsx
<UserHeader
  guestMode={true}
  guestButtonStyle="link"
  style={{ fontSize: "16px" }}
/>
```

### 4. Patient Layout (Authenticated User)

```jsx
const PatientLayout = () => {
  const patientMenuItems = [
    {
      key: "my-orders",
      icon: <ShoppingCartOutlined />,
      label: "Đơn hàng của tôi",
      onClick: () => navigate("/patient/orders"),
    },
  ];

  return (
    <Header>
      <UserHeader additionalMenuItems={patientMenuItems} avatarSize="large" />
    </Header>
  );
};
```

### 5. Admin Layout (Management Role)

```jsx
// Automatically adds "Bảng điều khiển" link for admin/staff/doctor roles
<UserHeader onLogout={() => navigate("/login")} />
```

## Integration with Navbar Component

To use UserHeader in your existing Navbar component, you can modify it to accept a `rightContent` prop:

```jsx
// src/components/Navbar.js
const Navbar = ({ rightContent, ...props }) => {
  return (
    <Header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* Left side - Logo, menu items */}
      <div>
        <Logo />
        <Menu items={menuItems} />
      </div>

      {/* Right side - User header or other content */}
      <div>{rightContent}</div>
    </Header>
  );
};

// Usage in DefaultLayout
<Navbar
  rightContent={<UserHeader guestMode={true} guestButtonStyle="button" />}
/>;
```

## Behavior by User State

### Guest Users (Not Authenticated)

- Shows login and register buttons
- No avatar or dropdown menu
- Can be forced with `guestMode={true}`

### Authenticated Regular Users (Patient)

- Shows greeting with user name
- Avatar with dropdown containing:
  - Profile link (`/profile`)
  - Additional menu items (if provided)
  - Logout option

### Management Users (Admin/Doctor/Staff)

- Shows greeting with user name
- Avatar with dropdown containing:
  - Profile link (role-specific route)
  - Dashboard link (`/dashboard`)
  - Additional menu items (if provided)
  - Logout option

## Styling Examples

### Compact Header

```jsx
<UserHeader
  showGreeting={false}
  avatarSize="small"
  guestButtonStyle="link"
  style={{ gap: "8px" }}
/>
```

### Large Header

```jsx
<UserHeader
  avatarSize="large"
  greetingStyle={{ fontSize: "18px", fontWeight: "bold" }}
  style={{ padding: "8px 16px", background: "#f0f2f5", borderRadius: "8px" }}
/>
```

### Mobile-Friendly

```jsx
<UserHeader
  showGreeting={false}
  avatarSize="small"
  guestButtonStyle="link"
  showGuestButtons={window.innerWidth > 768}
/>
```

## Error Handling

The component gracefully handles:

- Missing authentication context
- Invalid user roles
- Network errors during logout
- Missing user information

## Testing

Test different states:

```jsx
// Test guest mode
<UserHeader guestMode={true} />

// Test authenticated user
<UserHeader /> // with mocked auth context

// Test management user
<UserHeader /> // with admin role in auth context
```

## Migration from Old Implementation

### Before (AdminLayout only)

```jsx
const userMenu = (
  <Menu>
    <Menu.Item>Profile</Menu.Item>
    <Menu.Item onClick={logout}>Logout</Menu.Item>
  </Menu>
);

<Dropdown overlay={userMenu}>
  <Avatar />
</Dropdown>;
```

### After (Reusable)

```jsx
<UserHeader onLogout={handleLogout} />
```

This enhanced UserHeader component now works seamlessly across all layout types, automatically adapting to user authentication state and roles!
