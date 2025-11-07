# Flutter Mobile App Design Document

## Overview

This document outlines the technical design for a Flutter mobile application that replicates the patient portal functionality. The app will be built using Flutter 3.x with Firebase as the backend, supporting both iOS and Android platforms. The design emphasizes native mobile UX patterns while maintaining visual consistency with the web portal's blue gradient aesthetic.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Flutter Mobile App                    │
├─────────────────────────────────────────────────────────┤
│  Presentation Layer (UI)                                 │
│  ├── Screens (Home, Services, Booking, Profile, etc.)   │
│  ├── Widgets (Reusable UI Components)                   │
│  └── Theme (Colors, Typography, Styles)                 │
├─────────────────────────────────────────────────────────┤
│  Business Logic Layer                                    │
│  ├── State Management (Riverpod/Provider)               │
│  ├── View Models / Controllers                          │
│  └── Use Cases / Interactors                            │
├─────────────────────────────────────────────────────────┤
│  Data Layer                                              │
│  ├── Repositories (Abstract interfaces)                 │
│  ├── Data Sources (Remote & Local)                      │
│  └── Models (Domain & Data Transfer Objects)            │
├─────────────────────────────────────────────────────────┤
│  Infrastructure Layer                                    │
│  ├── Firebase Services (Auth, Firestore, FCM)           │
│  ├── Payment Gateway Integration                        │
│  ├── Local Storage (Hive/SharedPreferences)             │
│  └── Network Client (Dio/HTTP)                          │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   Firebase Backend                       │
│  ├── Firebase Authentication                            │
│  ├── Cloud Firestore (Database)                         │
│  ├── Cloud Storage (Images)                             │
│  ├── Cloud Messaging (Push Notifications)               │
│  └── Cloud Functions (Optional)                         │
└─────────────────────────────────────────────────────────┘
```

### Architecture Pattern

The app will follow **Clean Architecture** principles with clear separation of concerns:

1. **Presentation Layer**: UI components, screens, and widgets
2. **Business Logic Layer**: State management, business rules, and use cases
3. **Data Layer**: Data access, repositories, and models
4. **Infrastructure Layer**: External services and platform-specific code

### State Management

**Riverpod** will be used for state management due to its:
- Compile-time safety
- Better testability
- Improved performance
- Easier dependency injection

Alternative: Provider (if team is more familiar)

## Components and Interfaces

### 1. Authentication Module

#### Components
- **AuthService**: Handles Firebase Authentication operations
- **AuthRepository**: Abstract interface for authentication
- **AuthProvider**: State management for authentication state
- **BiometricService**: Local biometric authentication

#### Key Interfaces

```dart
abstract class AuthRepository {
  Future<User?> signInWithEmailPassword(String email, String password);
  Future<User?> signUpWithEmailPassword(String email, String password);
  Future<void> signOut();
  Future<void> resetPassword(String email);
  Stream<User?> get authStateChanges;
  Future<bool> isBiometricAvailable();
  Future<bool> authenticateWithBiometric();
}
```

#### Screens
- Login Screen
- Registration Screen
- Forgot Password Screen
- Biometric Setup Screen

### 2. Home Module

#### Components
- **HomeScreen**: Main landing screen with hero section
- **ServiceCategoryWidget**: Displays service categories
- **DentistProfileWidget**: Shows dentist cards
- **TestimonialWidget**: Patient testimonials carousel

#### Key Features
- Animated gradient background
- Smooth scroll animations
- Quick action buttons
- Statistics cards (patients, ratings, experience)

### 3. Services Module

#### Components
- **ServicesRepository**: Fetches services from Firestore
- **ServicesProvider**: State management for services
- **ServiceListScreen**: Displays all services
- **ServiceDetailScreen**: Detailed service information
- **ServiceFilterWidget**: Category and search filters

#### Key Interfaces

```dart
abstract class ServicesRepository {
  Stream<List<Service>> getServices();
  Future<Service?> getServiceById(String id);
  Stream<List<Service>> getServicesByCategory(String category);
}

class Service {
  final String id;
  final String name;
  final String description;
  final String category;
  final int duration;
  final double price;
  final String? imageUrl;
  final DateTime createdAt;
  final DateTime updatedAt;
}
```

### 4. Booking Module

#### Components
- **BookingFlowCoordinator**: Manages multi-step booking process
- **ServiceSelectionScreen**: Step 1 - Choose service
- **ProviderSelectionScreen**: Step 2 - Choose provider
- **DateTimeSelectionScreen**: Step 3 - Choose date and time
- **BookingConfirmationScreen**: Step 4 - Review and confirm
- **BookingSuccessScreen**: Confirmation screen

#### Key Interfaces

```dart
abstract class BookingRepository {
  Future<List<Provider>> getProvidersByService(String serviceId);
  Future<List<TimeSlot>> getAvailableSlots(String providerId, DateTime date);
  Future<Appointment> createAppointment(AppointmentData data);
  Future<bool> checkProviderAvailability(String providerId, DateTime date, String time);
}

class BookingState {
  final Service? selectedService;
  final Provider? selectedProvider;
  final DateTime? selectedDate;
  final String? selectedTime;
  final int currentStep;
}
```

#### Booking Flow State Machine

```
[Service Selection] → [Provider Selection] → [Date/Time Selection] → [Confirmation] → [Payment] → [Success]
         ↓                    ↓                       ↓                    ↓              ↓
      [Cancel]             [Back]                  [Back]              [Back]        [Done]
```

### 5. Payment Module

#### Components
- **PaymentService**: Integrates with payment gateways
- **PaymentRepository**: Abstract payment interface
- **PaymentScreen**: Payment processing UI
- **PaymentWebView**: For web-based payment flows

#### Key Interfaces

```dart
abstract class PaymentRepository {
  Future<PaymentOrder> createOrder(double amount, String currency, Map<String, dynamic> metadata);
  Future<PaymentResult> processPayment(PaymentOrder order, PaymentMethod method);
  Future<PaymentStatus> getPaymentStatus(String paymentId);
  Future<bool> verifyPayment(String paymentId, String signature);
}

enum PaymentGateway { razorpay, payu, stripe }
enum PaymentStatus { pending, success, failed, cancelled }

class PaymentOrder {
  final String orderId;
  final double amount;
  final String currency;
  final Map<String, dynamic> metadata;
}
```

#### Payment Gateway Integration

- **Razorpay**: Use `razorpay_flutter` package
- **PayU**: Custom integration via WebView
- **Stripe**: Use `flutter_stripe` package

### 6. Profile Module

#### Components
- **ProfileRepository**: User profile CRUD operations
- **ProfileProvider**: State management for profile
- **ProfileScreen**: Main profile view with tabs
- **EditProfileScreen**: Edit profile information
- **MedicalHistoryWidget**: Medical information section

#### Key Interfaces

```dart
abstract class ProfileRepository {
  Future<UserProfile?> getUserProfile(String uid);
  Future<void> updateUserProfile(String uid, UserProfile profile);
  Stream<UserProfile?> watchUserProfile(String uid);
}

class UserProfile {
  final String uid;
  final String fullName;
  final String email;
  final String phone;
  final DateTime? dateOfBirth;
  final String? gender;
  final Address? address;
  final Insurance? insurance;
  final EmergencyContact? emergencyContact;
  final MedicalHistory? medicalHistory;
}
```

### 7. Appointments Module

#### Components
- **AppointmentsRepository**: Appointment data access
- **AppointmentsProvider**: State management
- **AppointmentsScreen**: List of appointments with tabs
- **AppointmentDetailScreen**: Detailed appointment view

#### Key Interfaces

```dart
abstract class AppointmentsRepository {
  Stream<List<Appointment>> getUserAppointments(String userId);
  Future<Appointment?> getAppointmentById(String id);
  Future<void> cancelAppointment(String id, String reason);
}

class Appointment {
  final String id;
  final String userId;
  final String serviceId;
  final String serviceName;
  final String providerId;
  final String providerName;
  final DateTime appointmentDate;
  final String startTime;
  final String endTime;
  final AppointmentStatus status;
  final PaymentStatus paymentStatus;
  final double paymentAmount;
}

enum AppointmentStatus { pending, confirmed, cancelled, completed }
```

### 8. Notifications Module

#### Components
- **NotificationService**: FCM integration
- **NotificationRepository**: Notification data access
- **NotificationHandler**: Background notification handling

#### Key Interfaces

```dart
abstract class NotificationService {
  Future<void> initialize();
  Future<String?> getToken();
  Future<void> subscribeToTopic(String topic);
  Future<void> unsubscribeFromTopic(String topic);
  Stream<RemoteMessage> get onMessage;
  Stream<RemoteMessage> get onMessageOpenedApp;
}
```

## Data Models

### Core Models

```dart
// User Profile
class UserProfile {
  final String uid;
  final String fullName;
  final String email;
  final String phone;
  final DateTime? dateOfBirth;
  final String? gender;
  final Address? address;
  final Insurance? insurance;
  final EmergencyContact? emergencyContact;
  final MedicalHistory? medicalHistory;
  final String? avatarUrl;
  final DateTime createdAt;
  final DateTime updatedAt;
}

// Service
class Service {
  final String id;
  final String name;
  final String description;
  final String category;
  final int duration;
  final double price;
  final String? imageUrl;
  final DateTime createdAt;
  final DateTime updatedAt;
}

// Provider
class Provider {
  final String id;
  final String name;
  final String title;
  final String specialty;
  final String bio;
  final String imageUrl;
  final String email;
  final String phone;
  final int yearsOfExperience;
  final List<String> serviceIds;
  final double? rating;
  final int? totalReviews;
  final List<String>? education;
  final List<String>? certifications;
  final List<String>? languages;
}

// Appointment
class Appointment {
  final String id;
  final String userId;
  final String userEmail;
  final String userName;
  final String? userPhone;
  final String serviceId;
  final String serviceName;
  final String providerId;
  final String providerName;
  final DateTime appointmentDate;
  final String startTime;
  final String endTime;
  final AppointmentStatus status;
  final String? notes;
  final String? confirmationNumber;
  final PaymentStatus paymentStatus;
  final double paymentAmount;
  final String? paymentTransactionId;
  final DateTime createdAt;
  final DateTime updatedAt;
}
```

### Firestore Collections Structure

```
users/
  {userId}/
    - profile data
    
services/
  {serviceId}/
    - service data
    
providers/
  {providerId}/
    - provider data
    
providerSchedules/
  {scheduleId}/
    - schedule data
    
appointments/
  {appointmentId}/
    - appointment data
    
paymentAuditLogs/
  {logId}/
    - payment audit data
```

## Error Handling

### Error Hierarchy

```dart
abstract class AppException implements Exception {
  final String message;
  final String? code;
  final dynamic originalError;
  
  AppException(this.message, {this.code, this.originalError});
}

class NetworkException extends AppException {
  NetworkException(String message) : super(message, code: 'NETWORK_ERROR');
}

class AuthException extends AppException {
  AuthException(String message, {String? code}) : super(message, code: code);
}

class FirestoreException extends AppException {
  FirestoreException(String message, {String? code}) : super(message, code: code);
}

class PaymentException extends AppException {
  PaymentException(String message, {String? code}) : super(message, code: code);
}

class ValidationException extends AppException {
  final Map<String, String> fieldErrors;
  ValidationException(String message, this.fieldErrors) : super(message, code: 'VALIDATION_ERROR');
}
```

### Error Handling Strategy

1. **Network Errors**: Retry mechanism with exponential backoff
2. **Authentication Errors**: Clear error messages, redirect to login
3. **Validation Errors**: Field-level error display
4. **Payment Errors**: Allow retry, save state for recovery
5. **Firestore Errors**: Offline support, queue operations

### User Feedback

- **Loading States**: Shimmer effects, progress indicators
- **Success States**: Snackbars, success screens
- **Error States**: Error dialogs, inline error messages
- **Empty States**: Friendly empty state illustrations

## Testing Strategy

### Unit Tests

- Test all business logic in repositories and use cases
- Test state management providers
- Test data models and serialization
- Test utility functions and validators
- Target: 80% code coverage

### Widget Tests

- Test individual widgets in isolation
- Test widget interactions and state changes
- Test form validation
- Test navigation flows

### Integration Tests

- Test complete user flows (booking, profile update)
- Test Firebase integration
- Test payment gateway integration
- Test offline functionality

### Test Structure

```
test/
  ├── unit/
  │   ├── repositories/
  │   ├── providers/
  │   ├── models/
  │   └── utils/
  ├── widget/
  │   ├── screens/
  │   └── widgets/
  └── integration/
      ├── auth_flow_test.dart
      ├── booking_flow_test.dart
      └── profile_flow_test.dart
```

## Theme and Design System

### Color Palette

```dart
class AppColors {
  // Primary Colors (Blue Gradient)
  static const primary = Color(0xFF2563EB); // Blue-600
  static const primaryDark = Color(0xFF1E40AF); // Blue-700
  static const primaryLight = Color(0xFF3B82F6); // Blue-500
  
  // Secondary Colors (Cyan Gradient)
  static const secondary = Color(0xFF06B6D4); // Cyan-500
  static const secondaryDark = Color(0xFF0891B2); // Cyan-600
  static const secondaryLight = Color(0xFF22D3EE); // Cyan-400
  
  // Neutral Colors
  static const background = Color(0xFFFFFFFF);
  static const surface = Color(0xFFF9FAFB);
  static const onBackground = Color(0xFF111827);
  static const onSurface = Color(0xFF374151);
  
  // Status Colors
  static const success = Color(0xFF10B981); // Green-500
  static const warning = Color(0xFFF59E0B); // Yellow-500
  static const error = Color(0xFFEF4444); // Red-500
  static const info = Color(0xFF3B82F6); // Blue-500
}
```

### Typography

```dart
class AppTypography {
  static const fontFamily = 'Inter'; // or 'Geist Sans' if available
  
  static const h1 = TextStyle(
    fontSize: 32,
    fontWeight: FontWeight.bold,
    height: 1.2,
  );
  
  static const h2 = TextStyle(
    fontSize: 24,
    fontWeight: FontWeight.bold,
    height: 1.3,
  );
  
  static const h3 = TextStyle(
    fontSize: 20,
    fontWeight: FontWeight.w600,
    height: 1.4,
  );
  
  static const body1 = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.normal,
    height: 1.5,
  );
  
  static const body2 = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.normal,
    height: 1.5,
  );
  
  static const caption = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.normal,
    height: 1.4,
  );
}
```

### Component Styles

- **Cards**: Rounded corners (12px), subtle shadow, white background
- **Buttons**: Gradient background for primary, outlined for secondary
- **Input Fields**: Rounded borders, focus states with blue accent
- **Bottom Navigation**: Fixed bottom bar with icons and labels
- **App Bar**: Gradient background matching web portal

### Animations

- **Page Transitions**: Slide and fade animations
- **List Items**: Staggered fade-in animations
- **Buttons**: Scale animation on tap
- **Loading**: Shimmer effects for content loading
- **Success**: Checkmark animation with scale

## Performance Optimization

### Image Optimization

- Use `cached_network_image` for remote images
- Implement progressive image loading
- Compress images before upload
- Use appropriate image formats (WebP)

### List Performance

- Use `ListView.builder` for long lists
- Implement pagination for large datasets
- Use `AutomaticKeepAliveClientMixin` for tab views

### State Management

- Minimize widget rebuilds
- Use `const` constructors where possible
- Implement selective rebuilds with Riverpod selectors

### Network Optimization

- Implement request caching
- Use Firestore offline persistence
- Batch Firestore operations
- Implement retry logic with exponential backoff

## Security Considerations

### Data Security

- Encrypt sensitive data in local storage
- Use HTTPS for all network requests
- Implement certificate pinning for API calls
- Sanitize user inputs

### Authentication Security

- Implement biometric authentication
- Use secure token storage
- Implement session timeout
- Add rate limiting for login attempts

### Firebase Security

- Implement Firestore security rules
- Validate data on server side
- Use Firebase App Check
- Monitor for suspicious activity

## Offline Support

### Offline Strategy

1. **Cache First**: Try cache, fallback to network
2. **Network First**: Try network, fallback to cache
3. **Cache Only**: Only use cached data
4. **Network Only**: Only use network data

### Offline Features

- View cached appointments
- View cached profile
- Browse cached services
- Queue write operations
- Sync when online

### Implementation

```dart
class OfflineManager {
  Future<void> cacheData(String key, dynamic data);
  Future<dynamic> getCachedData(String key);
  Future<void> queueOperation(Operation operation);
  Future<void> syncQueuedOperations();
  Stream<bool> get connectivityStream;
}
```

## Localization and Internationalization

### Indian Localization

- Currency formatting: ₹1,00,000 (lakhs format)
- Phone number: +91 98765 43210
- Date format: DD/MM/YYYY
- Address format: Indian states and PIN codes

### Implementation

```dart
class IndianFormatters {
  static String formatCurrency(double amount) {
    // Format in lakhs/crores
  }
  
  static String formatPhoneNumber(String phone) {
    // Format as +91 XXXXX XXXXX
  }
  
  static String formatDate(DateTime date) {
    // Format as DD/MM/YYYY
  }
}
```

## Deployment Strategy

### Build Variants

- **Development**: Debug build with Firebase emulators
- **Staging**: Release build with staging Firebase project
- **Production**: Release build with production Firebase project

### CI/CD Pipeline

1. Code push to repository
2. Run automated tests
3. Build APK/IPA
4. Deploy to Firebase App Distribution (beta)
5. Deploy to Play Store/App Store (production)

### Version Management

- Follow semantic versioning (MAJOR.MINOR.PATCH)
- Maintain changelog
- Use build numbers for tracking

## Monitoring and Analytics

### Firebase Analytics

- Track screen views
- Track user actions (booking, profile update)
- Track conversion funnels
- Monitor app performance

### Crashlytics

- Automatic crash reporting
- Custom error logging
- User identification for debugging

### Performance Monitoring

- Monitor app startup time
- Track network request performance
- Monitor screen rendering performance
