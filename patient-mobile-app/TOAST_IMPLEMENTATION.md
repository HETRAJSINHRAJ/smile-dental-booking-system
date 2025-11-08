# Toast Notification System

## Overview
Replaced all `Alert.alert()` messages with beautiful, modern toast notifications throughout the app.

## Features

### Toast Types
- **Success** ✅ - Green background with checkmark icon
- **Error** ❌ - Red background with close-circle icon
- **Warning** ⚠️ - Orange background with warning icon
- **Info** ℹ️ - Blue background with information icon

### Animations
- Smooth slide-down entrance
- Fade-in effect
- Auto-dismiss after 3 seconds (customizable)
- Manual dismiss by tapping
- Close button

### Design
- Rounded corners (16px)
- Shadow elevation
- Icon + Message + Close button
- Responsive width
- Top positioning (safe area aware)
- Multiple toasts support (stacked)

## Usage

### Basic Usage

```typescript
import { useToast } from '../contexts/ToastContext';

const MyComponent = () => {
  const toast = useToast();

  const handleSuccess = () => {
    toast.showSuccess('Operation completed successfully!');
  };

  const handleError = () => {
    toast.showError('Something went wrong!');
  };

  const handleWarning = () => {
    toast.showWarning('Please check your input!');
  };

  const handleInfo = () => {
    toast.showInfo('Here is some information.');
  };

  return (
    // Your component JSX
  );
};
```

### Custom Duration

```typescript
// Show toast for 5 seconds
toast.showToast('Custom message', 'success', 5000);
```

### Toast Methods

```typescript
// Generic method
toast.showToast(message: string, type?: ToastType, duration?: number)

// Convenience methods
toast.showSuccess(message: string)
toast.showError(message: string)
toast.showWarning(message: string)
toast.showInfo(message: string)
```

## Implementation Locations

### AuthContext
All authentication-related messages now use toast:

**Sign Up:**
- ✅ Success: "Account created successfully! 🎉"
- ❌ Error: "Email already in use. Please login instead."
- ❌ Error: "Password should be at least 6 characters."
- ❌ Error: "Failed to create account. Please try again."

**Sign In:**
- ✅ Success: "Welcome back! 👋"
- ❌ Error: "Invalid email or password. Please try again."
- ❌ Error: "Failed to sign in. Please try again."

**Sign Out:**
- ✅ Success: "Signed out successfully 👋"
- ❌ Error: "Failed to sign out"

**Reset Password:**
- ✅ Success: "Password reset email sent! 📧"
- ❌ Error: "No account found with this email."
- ❌ Error: "Failed to send reset email. Please try again."

### Where to Add Toast

#### Booking Screens
```typescript
// In booking confirmation
toast.showSuccess('Appointment booked successfully! 🎉');

// In booking cancellation
toast.showWarning('Appointment cancelled');

// In booking error
toast.showError('Failed to book appointment. Please try again.');
```

#### Profile Screen
```typescript
// Profile update success
toast.showSuccess('Profile updated successfully! ✨');

// Profile update error
toast.showError('Failed to update profile');

// Password change
toast.showSuccess('Password changed successfully! 🔒');
```

#### Services Screen
```typescript
// Service selection
toast.showInfo('Service selected');

// Service unavailable
toast.showWarning('This service is currently unavailable');
```

#### Appointments Screen
```typescript
// Appointment cancelled
toast.showSuccess('Appointment cancelled successfully');

// Appointment rescheduled
toast.showSuccess('Appointment rescheduled! 📅');

// Reminder set
toast.showInfo('Reminder set for your appointment');
```

## File Structure

```
src/
├── components/
│   └── Toast.tsx              # Toast component
├── contexts/
│   ├── ToastContext.tsx       # Toast provider & hook
│   └── AuthContextWithToast.tsx  # Auth with toast integration
└── App.tsx                    # ToastProvider wrapper
```

## Component Architecture

### ToastProvider
Wraps the entire app and manages toast state:
```typescript
<ToastProvider>
  <AuthProvider>
    <AppNavigator />
  </AuthProvider>
</ToastProvider>
```

### Toast Component
Individual toast notification with:
- Animated entrance/exit
- Icon based on type
- Message text
- Close button
- Auto-dismiss timer

### useToast Hook
Provides toast methods to any component:
```typescript
const toast = useToast();
```

## Styling

### Colors
- Success: `colors.success.main` (#4CAF50)
- Error: `colors.error.main` (#F44336)
- Warning: `colors.warning.main` (#FF9800)
- Info: `colors.info.main` (#2196F3)

### Typography
- Font: `typography.bodyMedium`
- Color: White
- Weight: 500

### Layout
- Position: Absolute top
- Margin: 16px horizontal
- Padding: 16px
- Border Radius: 16px
- Shadow: Large elevation

## Best Practices

### 1. Use Appropriate Types
```typescript
// Success for completed actions
toast.showSuccess('Saved!');

// Error for failures
toast.showError('Failed to save');

// Warning for cautions
toast.showWarning('Please fill all fields');

// Info for neutral messages
toast.showInfo('Loading...');
```

### 2. Keep Messages Short
```typescript
// Good ✅
toast.showSuccess('Profile updated!');

// Too long ❌
toast.showSuccess('Your profile has been successfully updated with all the new information you provided.');
```

### 3. Add Emojis for Personality
```typescript
toast.showSuccess('Booking confirmed! 🎉');
toast.showSuccess('Welcome back! 👋');
toast.showSuccess('Email sent! 📧');
```

### 4. Use Consistent Messaging
```typescript
// Pattern: Action + Result
toast.showSuccess('Appointment booked successfully!');
toast.showSuccess('Profile updated successfully!');
toast.showSuccess('Password changed successfully!');
```

## Migration from Alert

### Before (Alert)
```typescript
Alert.alert('Success', 'Account created successfully!');
Alert.alert('Error', 'Failed to sign in');
```

### After (Toast)
```typescript
toast.showSuccess('Account created successfully! 🎉');
toast.showError('Failed to sign in');
```

## Advantages Over Alert

1. **Non-Blocking**: Doesn't interrupt user flow
2. **Modern Design**: Matches app aesthetic
3. **Animated**: Smooth entrance/exit
4. **Customizable**: Duration, type, message
5. **Multiple Toasts**: Can show multiple at once
6. **Auto-Dismiss**: Automatically hides
7. **Manual Dismiss**: Tap to close
8. **Consistent**: Same style throughout app

## Testing

### Test Success Toast
```typescript
toast.showSuccess('This is a success message!');
```

### Test Error Toast
```typescript
toast.showError('This is an error message!');
```

### Test Warning Toast
```typescript
toast.showWarning('This is a warning message!');
```

### Test Info Toast
```typescript
toast.showInfo('This is an info message!');
```

### Test Multiple Toasts
```typescript
toast.showSuccess('First message');
setTimeout(() => toast.showInfo('Second message'), 500);
setTimeout(() => toast.showWarning('Third message'), 1000);
```

## Troubleshooting

### Toast Not Showing
1. Ensure `ToastProvider` wraps your app
2. Check that `useToast()` is called inside a component
3. Verify the component is within `ToastProvider`

### Toast Appears Behind Content
1. Check z-index values
2. Ensure `pointerEvents="box-none"` on container
3. Verify absolute positioning

### Multiple Toasts Overlap
- This is expected behavior
- Toasts stack vertically
- Each has its own timer

## Future Enhancements

- [ ] Toast queue system
- [ ] Swipe to dismiss
- [ ] Custom icons
- [ ] Custom colors
- [ ] Sound effects
- [ ] Haptic feedback
- [ ] Bottom positioning option
- [ ] Action buttons in toast
- [ ] Progress bar for duration
- [ ] Persistent toasts (no auto-dismiss)
