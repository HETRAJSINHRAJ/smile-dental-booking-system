# Modern Design System - Dental Booking App

## Overview
This document outlines the modern design system implemented for the dental booking mobile application, inspired by contemporary healthcare app designs.

## Design Principles

### 1. **Color Palette**
- **Primary**: Soft Blue/Teal (#4A9FBD) - Calming, trustworthy
- **Secondary**: Deep Teal/Navy (#1A5F7A) - Professional, reliable
- **Accent**: Mint Green (#5BC0BE) - Fresh, modern
- **Neutrals**: Carefully balanced grays for text and backgrounds

### 2. **Typography**
- **Display**: Bold, large headings (36-57px)
- **Headlines**: Section titles (24-32px)
- **Body**: Readable content (14-16px)
- **Labels**: UI elements (11-14px)
- **Font Weights**: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)

### 3. **Spacing System**
```
xs: 4px   - Tight spacing
sm: 8px   - Small gaps
md: 16px  - Standard spacing
lg: 24px  - Section spacing
xl: 32px  - Large gaps
xxl: 48px - Extra large spacing
```

### 4. **Border Radius**
```
xs: 4px   - Subtle rounding
sm: 8px   - Small elements
md: 12px  - Cards, inputs
lg: 16px  - Buttons, containers
xl: 20px  - Large cards
xxl: 24px - Hero elements
full: 9999px - Circular elements
```

### 5. **Shadows**
- **Small**: Subtle elevation for buttons
- **Medium**: Card elevation
- **Large**: Modal and overlay elevation

## Components

### Button
**Variants:**
- Primary: Solid secondary color
- Secondary: Solid primary color
- Outline: Transparent with border
- Text: No background

**Sizes:**
- Small: 36px height
- Medium: 48px height
- Large: 56px height

**Usage:**
```tsx
<Button 
  title="Book Appointment" 
  onPress={handlePress}
  variant="primary"
  size="large"
  fullWidth
/>
```

### Card
Elevated container with rounded corners and shadow.

**Props:**
- `elevated`: Boolean for shadow
- `padding`: Custom padding value

**Usage:**
```tsx
<Card elevated padding={16}>
  <Text>Card Content</Text>
</Card>
```

### Input
Modern text input with icons and validation.

**Features:**
- Left/Right icons
- Password visibility toggle
- Error states
- Focus states

**Usage:**
```tsx
<Input
  label="Email"
  placeholder="Enter your email"
  value={email}
  onChangeText={setEmail}
  leftIcon="mail-outline"
  error={emailError}
/>
```

### Header
Consistent navigation header.

**Features:**
- Back button
- Title
- Right action component
- Transparent option

**Usage:**
```tsx
<Header
  title="Services"
  showBack
  onBackPress={() => navigation.goBack()}
  rightComponent={<Icon name="search" />}
/>
```

### TabBar
Custom bottom navigation with modern styling.

**Features:**
- Icon-based navigation
- Active state indicators
- Smooth transitions
- Rounded top corners

## Screen Layouts

### HomeScreen
**Structure:**
1. Header with greeting and notifications
2. Search bar
3. Quick action buttons (4 icons)
4. Service cards grid (2 columns)
5. Featured doctors list
6. Promotional banner

**Spacing:**
- Horizontal padding: 24px
- Vertical sections: 24px gap
- Card spacing: 16px

### LoginScreen
**Structure:**
1. Logo and title
2. Email input
3. Password input
4. Forgot password link
5. Sign in button
6. Social login options
7. Sign up link

**Spacing:**
- Form padding: 24px
- Input spacing: 16px
- Button margin: 24px

## Best Practices

### 1. **Consistent Spacing**
Always use the spacing system from `theme/spacing.ts`:
```tsx
paddingHorizontal: spacing.lg  // 24px
marginBottom: spacing.md       // 16px
```

### 2. **Typography**
Use typography styles from `theme/typography.ts`:
```tsx
style={typography.headlineMedium}
```

### 3. **Colors**
Reference colors from `theme/colors.ts`:
```tsx
color: colors.text.primary
backgroundColor: colors.background.paper
```

### 4. **Shadows**
Apply shadows from `theme/spacing.ts`:
```tsx
...shadows.medium
```

### 5. **Border Radius**
Use consistent rounding:
```tsx
borderRadius: borderRadius.lg  // 16px
```

## Accessibility

### Color Contrast
- Text on background: Minimum 4.5:1 ratio
- Large text: Minimum 3:1 ratio
- Interactive elements: Clear visual feedback

### Touch Targets
- Minimum size: 44x44px
- Spacing between targets: 8px minimum

### Typography
- Minimum body text: 14px
- Line height: 1.5x font size
- Letter spacing: Optimized for readability

## Animation Guidelines

### Transitions
- Duration: 200-300ms
- Easing: ease-in-out
- Use for: Navigation, state changes

### Micro-interactions
- Button press: Scale 0.95
- Card tap: Subtle elevation change
- Input focus: Border color transition

## Responsive Design

### Breakpoints
- Small phones: < 375px
- Standard phones: 375-414px
- Large phones: > 414px

### Adaptive Layouts
- Grid columns: 2 for services
- Flexible spacing: Use percentages where appropriate
- Safe area insets: Always respect device notches

## File Structure
```
src/
├── theme/
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   └── index.ts
├── components/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Header.tsx
│   ├── Input.tsx
│   ├── TabBar.tsx
│   └── index.ts
└── screens/
    ├── main/
    ├── auth/
    ├── booking/
    └── ...
```

## Future Enhancements

1. **Dark Mode Support**
   - Add dark color palette
   - Theme switching mechanism
   - Persistent user preference

2. **Animations**
   - Shared element transitions
   - Loading skeletons
   - Success animations

3. **Advanced Components**
   - Date picker
   - Time slot selector
   - Rating component
   - Image carousel

4. **Accessibility**
   - Screen reader support
   - Voice navigation
   - High contrast mode

## Resources

- **Icons**: Ionicons (react-native-vector-icons)
- **Navigation**: React Navigation v6
- **Safe Areas**: react-native-safe-area-context
- **Firebase**: @react-native-firebase

## Maintenance

### Adding New Colors
1. Add to `theme/colors.ts`
2. Follow naming convention
3. Update documentation

### Creating New Components
1. Use existing theme values
2. Follow component structure
3. Add TypeScript types
4. Document props and usage

### Updating Screens
1. Use reusable components
2. Follow spacing guidelines
3. Maintain consistency
4. Test on multiple devices
