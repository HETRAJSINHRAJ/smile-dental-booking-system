# Sentry Performance Alerts Configuration

This document describes how to configure Sentry alerts for performance monitoring in the Smile Dental application.

## Alert Configuration in Sentry Dashboard

Navigate to your Sentry project → Alerts → Create Alert Rule

### 1. API Response Time Alert

**Alert when API response time > 3s**

- **Alert Type:** Performance
- **Metric:** Transaction Duration (p95)
- **Condition:** Greater than 3000ms
- **Filter:** Transaction name contains "api" OR operation is "http.client"
- **Action:** Send notification to team
- **Frequency:** Every 5 minutes

### 2. Error Rate Alert

**Alert when error rate > 1%**

- **Alert Type:** Issue
- **Metric:** Error count / Total events
- **Condition:** Greater than 1%
- **Time Window:** 1 hour
- **Action:** Send notification to team
- **Frequency:** Every 15 minutes

### 3. LCP (Largest Contentful Paint) Alert

**Alert when LCP > 4s**

- **Alert Type:** Performance
- **Metric:** Web Vital - LCP (p75)
- **Condition:** Greater than 4000ms
- **Filter:** Browser transactions only
- **Action:** Send notification to team
- **Frequency:** Every 30 minutes

### 4. Payment Processing Alert

**Alert when payment processing is slow or failing**

- **Alert Type:** Performance
- **Metric:** Transaction Duration (p95)
- **Condition:** Greater than 5000ms
- **Filter:** Transaction name contains "payment"
- **Action:** Send immediate notification (critical)
- **Frequency:** Every 5 minutes

### 5. Receipt Generation Alert

**Alert when receipt generation is slow**

- **Alert Type:** Performance
- **Metric:** Transaction Duration (p95)
- **Condition:** Greater than 8000ms
- **Filter:** Transaction name contains "receipt"
- **Action:** Send notification to team
- **Frequency:** Every 15 minutes

### 6. App Startup Time Alert (Mobile)

**Alert when mobile app startup is slow**

- **Alert Type:** Performance
- **Metric:** Custom measurement - app.startup_time (p95)
- **Condition:** Greater than 3000ms
- **Filter:** App is "patient-mobile-app"
- **Action:** Send notification to team
- **Frequency:** Daily digest

## Performance Dashboard Widgets

Create a Sentry Dashboard with the following widgets:

### Widget 1: Core Web Vitals Overview
- **Type:** Line chart
- **Metrics:** LCP, FID, CLS (p75 values)
- **Time Range:** Last 7 days

### Widget 2: API Response Times
- **Type:** Line chart
- **Metrics:** Transaction duration (p50, p95, p99)
- **Filter:** Operation is "http.client"
- **Time Range:** Last 24 hours

### Widget 3: Error Rate Trend
- **Type:** Area chart
- **Metrics:** Error count over time
- **Group By:** Error type
- **Time Range:** Last 7 days

### Widget 4: Booking Flow Performance
- **Type:** Bar chart
- **Metrics:** booking.total_duration (p50, p95)
- **Time Range:** Last 7 days

### Widget 5: Payment Processing Performance
- **Type:** Line chart
- **Metrics:** payment.processing_time (p50, p95)
- **Time Range:** Last 7 days

### Widget 6: Mobile App Startup Time
- **Type:** Line chart
- **Metrics:** app.startup_time (p50, p95)
- **Filter:** App is "patient-mobile-app"
- **Time Range:** Last 7 days

### Widget 7: Slow Transactions
- **Type:** Table
- **Metrics:** Slowest transactions (p95 > 3s)
- **Columns:** Transaction name, p95 duration, count
- **Time Range:** Last 24 hours

### Widget 8: Error Distribution by App
- **Type:** Pie chart
- **Metrics:** Error count
- **Group By:** App tag (admin-portal, patient-portal, patient-mobile-app)
- **Time Range:** Last 7 days

## Performance Thresholds Reference

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP | < 2.5s | 2.5s - 4s | > 4s |
| FID | < 100ms | 100ms - 300ms | > 300ms |
| CLS | < 0.1 | 0.1 - 0.25 | > 0.25 |
| API Response | < 1s | 1s - 3s | > 3s |
| App Startup | < 2s | 2s - 3s | > 3s |
| Payment Processing | < 3s | 3s - 5s | > 5s |

## Notification Channels

Configure the following notification channels in Sentry:

1. **Slack Integration**
   - Channel: #dental-app-alerts
   - Critical alerts: Immediate notification
   - Warning alerts: Batched every 15 minutes

2. **Email Notifications**
   - Recipients: dev-team@smiledental.com
   - Critical alerts: Immediate
   - Daily digest: Summary of all alerts

3. **PagerDuty Integration** (Optional)
   - For critical production issues
   - Payment failures
   - Error rate spikes > 5%

## Maintenance

- Review alert thresholds monthly
- Adjust based on actual performance data
- Archive resolved alerts after 30 days
- Update documentation when thresholds change
