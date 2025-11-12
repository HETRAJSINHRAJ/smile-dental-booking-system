# Custom Alert System

A beautiful, themed alert system that replaces React Native's default `Alert.alert()` with a custom modal that matches your app's design system.

## Features

- ✨ Beautiful UI matching app theme
- 🎨 Icon support with color customization
- 🎯 Convenience methods for common alert types (success, error, warning, info)
- 📱 Responsive design
- 🔄 Smooth animations
- 💪 TypeScript support

## Setup

The `AlertProvider` is already configured in `App.tsx`. No additional setup needed!

## Usage

### Basic Alert

```typescript
import { Alert } from '../utils/alert';

// Simple alert
Alert.alert('Title', 'Message');

// Alert with custom buttons
Alert.alert('Title', 'Message', [
  { text: 'Cancel', style: 'cancel' },
  { text: 'OK', onPress: () => console.log('OK pressed') }
]);
```

### Success Alert

```typescript
Alert.success('Success!', 'Your appointment has been booked successfully.');
```

### Error Alert

```typescript
Alert.error('Error', 'Something went wrong. Please try again.');
```

### Warning Alert

```typescript
Alert.warning('Warning', 'Please check your internet connection.');
```

### Info Alert

```typescript
Alert.info('Information', 'Your session will expire in 5 minutes.');
```

### Confirmation Dialog

```typescript
Alert.confirm(
  'Delete Appointment',
  'Are you sure you want to delete this appointment?',
  () => {
    // User confirmed
    deleteAppointment();
  },
  () => {
    // User cancelled
    console.log('Cancelled');
  }
);
```

## Button Styles

- `'default'` - Primary button (teal background, white text)
- `'cancel'` - Cancel button (light gray background, dark text)
- `'destructive'` - Destructive button (red background, white text)

## Custom Icons

You can use any Ionicons icon:

```typescript
import { showAlert } from '../utils/alert';

showAlert(
  'Custom Alert',
  'This is a custom alert with a custom icon',
  [{ text: 'OK' }],
  'heart', // Ionicons name
  '#FF6B6B' // Custom color
);
```

## Available Icons

Common icons used in the app:
- `checkmark-circle` - Success (green)
- `alert-circle` - Error (red)
- `warning` - Warning (orange)
- `information-circle` - Info (blue)
- `help-circle` - Question/Confirm

## Migration from React Native Alert

### Before
```typescript
import { Alert } from 'react-native';

Alert.alert('Title', 'Message');
```

### After
```typescript
import { Alert } from '../utils/alert';

Alert.alert('Title', 'Message');
```

The API is the same, so migration is seamless!

## Customization

To customize the alert appearance, edit:
- `src/components/CustomAlert.tsx` - Component styles
- `src/theme/colors.ts` - Color palette
- `src/theme/typography.ts` - Typography styles

## Examples

### Download Complete
```typescript
Alert.success(
  'Download Complete',
  'Receipt has been saved successfully!',
  [
    { text: 'OK', style: 'cancel' },
    { text: 'Open', onPress: () => openFile() }
  ]
);
```

### Permission Required
```typescript
Alert.warning(
  'Permission Required',
  'Calendar permission is required to add appointments.',
  [{ text: 'OK' }]
);
```

### Delete Confirmation
```typescript
Alert.confirm(
  'Delete Account',
  'This action cannot be undone.',
  () => deleteAccount(),
  () => console.log('Cancelled')
);
```
