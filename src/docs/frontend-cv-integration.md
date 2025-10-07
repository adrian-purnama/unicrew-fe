# Frontend CV Integration Documentation

This document describes the frontend implementation for the CV system with the new backend API.

## Overview

The frontend CV integration provides:
- **CV Generation**: Create professional CVs with AI assistance
- **Real-time Status Tracking**: Monitor CV generation progress
- **CV Management**: View, download, and manage all generated CVs
- **Automatic Expiration**: Handle 30-minute TTL with user notifications
- **Download Management**: Secure PDF downloads with progress tracking

## Components

### 1. CV API Helper (`fe/src/utils/cvApi.js`)

**Core Functions:**
- `submitCV(cvData)`: Submit CV data for generation
- `checkCVStatus(cvResultId)`: Check CV generation status
- `downloadCV(cvResultId, filename)`: Download CV PDF
- `listUserCVs(page, limit)`: List user's CVs with pagination
- `pollCVStatus(cvResultId, callback, maxAttempts)`: Poll for status updates

**Utility Functions:**
- `formatTimeRemaining(minutes)`: Format time remaining display
- `canDownloadCV(status, isExpired)`: Check if CV can be downloaded
- `getStatusColor(status)`: Get status badge colors
- `getStatusIcon(status)`: Get status icons

### 2. CV Maker Page (`fe/src/pages/CVMakerPage.jsx`)

**Enhanced Features:**
- **Real-time Polling**: Automatically polls for CV generation status
- **Progress Tracking**: Visual progress bars during generation
- **Download Integration**: Direct download with error handling
- **Status Notifications**: Clear feedback on generation progress
- **Expiration Warnings**: Shows time remaining before CV expires

**Key State Management:**
```javascript
const [cvResult, setCvResult] = useState(null);
const [pollingStatus, setPollingStatus] = useState(null);
const [isDownloading, setIsDownloading] = useState(false);
```

**Generation Flow:**
1. User submits CV data
2. API call to `/cv/submit`
3. Real-time polling for status updates
4. Download available when status = 'completed'
5. Expiration countdown display

### 3. CV Management Component (`fe/src/component/CVManagement.jsx`)

**Features:**
- **CV Grid Display**: Card-based layout for all user CVs
- **Status Tracking**: Real-time status updates with auto-refresh
- **Download Management**: Bulk download with progress tracking
- **Pagination**: Handle large numbers of CVs
- **Detailed View**: Modal with comprehensive CV information

**Key Features:**
- Auto-refresh every 30 seconds
- Download count tracking
- Expiration time display
- Error handling for failed CVs
- Responsive design for mobile/desktop

### 4. Navigation Integration (`fe/src/component/Navigation.jsx`)

**CV Menu:**
- Dropdown menu for CV Maker access
- Links to both creation and management
- Role-based access (users and admins only)
- Responsive design with mobile support

## API Integration

### CV Submission Flow

```javascript
// 1. Submit CV data
const result = await cvApi.submitCV(cvData);

// 2. Poll for completion
const finalStatus = await pollCVStatus(result.cvResultId, (status) => {
  setPollingStatus(status.status);
  setSubmitProgress(prev => Math.min(prev + 5, 95));
});

// 3. Handle completion
if (finalStatus.status === 'completed') {
  setShowDownload(true);
  setCompletionMessage('CV generated successfully!');
}
```

### Download Flow

```javascript
// Download CV with progress tracking
const handleDownload = async () => {
  try {
    setIsDownloading(true);
    await cvApi.downloadCV(cvResult.cvResultId, 'CV.pdf');
  } catch (error) {
    alert(`Download failed: ${error.message}`);
  } finally {
    setIsDownloading(false);
  }
};
```

### Status Management

```javascript
// Check CV status
const status = await cvApi.checkCVStatus(cvResultId);

// Handle different statuses
switch (status.status) {
  case 'generating':
    // Show progress indicator
    break;
  case 'completed':
    // Enable download
    break;
  case 'failed':
    // Show error message
    break;
  case 'expired':
    // Show expiration message
    break;
}
```

## User Experience Features

### 1. Real-time Updates
- **Generation Progress**: Visual progress bars and status indicators
- **Auto-refresh**: CV list updates every 30 seconds
- **Live Countdown**: Real-time expiration countdown

### 2. Error Handling
- **Network Errors**: Graceful handling of API failures
- **Validation Errors**: Clear error messages for invalid data
- **Download Errors**: Retry mechanisms for failed downloads

### 3. Responsive Design
- **Mobile Support**: Touch-friendly interface for mobile devices
- **Desktop Optimization**: Full-featured interface for desktop
- **Accessibility**: Screen reader support and keyboard navigation

### 4. User Feedback
- **Loading States**: Clear loading indicators during operations
- **Success Messages**: Confirmation of successful operations
- **Error Messages**: Detailed error information for troubleshooting

## Routing

### New Routes Added
```javascript
// App.jsx
<Route path="/cv-maker" element={<CVMakerPage />} />
<Route path="/cv-management" element={<CVManagementPage />} />
```

### Navigation Integration
- CV Maker dropdown in navigation bar
- Role-based access control
- Direct links to creation and management

## State Management

### CV Maker State
```javascript
const [cvResult, setCvResult] = useState(null);
const [isSubmitting, setIsSubmitting] = useState(false);
const [submitProgress, setSubmitProgress] = useState(0);
const [pollingStatus, setPollingStatus] = useState(null);
const [isDownloading, setIsDownloading] = useState(false);
```

### CV Management State
```javascript
const [cvs, setCvs] = useState([]);
const [loading, setLoading] = useState(true);
const [currentPage, setCurrentPage] = useState(1);
const [pagination, setPagination] = useState(null);
const [downloadingCVs, setDownloadingCVs] = useState(new Set());
```

## Error Handling

### API Error Types
1. **Network Errors**: Connection failures, timeouts
2. **Authentication Errors**: Invalid tokens, expired sessions
3. **Validation Errors**: Invalid CV data format
4. **Server Errors**: Backend processing failures

### User-facing Error Messages
```javascript
// Network error
"Failed to connect to server. Please check your internet connection."

// Authentication error
"Session expired. Please log in again."

// Validation error
"Please fill in all required fields before submitting."

// Server error
"CV generation failed. Please try again."
```

## Performance Optimizations

### 1. Lazy Loading
- Components loaded only when needed
- CV data excluded from list queries to reduce payload

### 2. Caching
- API responses cached where appropriate
- Local storage for user preferences

### 3. Debouncing
- Search and filter operations debounced
- API calls optimized to prevent excessive requests

### 4. Progressive Loading
- Skeleton screens during data loading
- Progressive image loading for better UX

## Security Features

### 1. Authentication
- All CV operations require valid authentication
- Token-based authentication with automatic refresh

### 2. Authorization
- Role-based access control (users and admins only)
- User-specific CV access

### 3. Data Validation
- Client-side validation before submission
- Server-side validation for security

### 4. Secure Downloads
- Authenticated download endpoints
- Temporary URLs with expiration

## Testing

### Manual Testing Checklist
- [ ] CV creation with valid data
- [ ] CV creation with invalid data
- [ ] Download functionality
- [ ] Status polling and updates
- [ ] Expiration handling
- [ ] Error scenarios
- [ ] Mobile responsiveness
- [ ] Navigation integration

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Deployment

### Environment Configuration
```javascript
// API base URL configuration
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:4001';
```

### Build Process
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Serve production build
npm run serve
```

## Monitoring

### Key Metrics to Track
- CV generation success rate
- Average generation time
- Download completion rate
- User engagement metrics
- Error rates by type

### Logging
- API request/response logging
- Error tracking and reporting
- User interaction analytics
- Performance monitoring

---

## Quick Start

1. **Access CV Maker**: Click "CV Maker" in navigation dropdown
2. **Create CV**: Fill in CV data and submit
3. **Monitor Progress**: Watch real-time generation progress
4. **Download CV**: Download when generation completes
5. **Manage CVs**: Access CV management page to view all CVs

The frontend integration provides a seamless, professional CV creation and management experience with real-time updates and comprehensive error handling!

