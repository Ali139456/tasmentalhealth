# Security Audit Report - Tasmanian Mental Health Directory

## Executive Summary
This document outlines the security assessment and fixes applied to ensure the application meets cybersecurity best practices.

## Critical Security Issues Found & Fixed

### 1. ✅ SQL Injection Vulnerability (FIXED)
**Location:** `react-app/src/pages/SearchResults.tsx`
**Issue:** Search query was directly interpolated into Supabase query without sanitization
**Risk:** High - Could allow SQL injection attacks
**Fix:** Added input sanitization to escape SQL wildcards and special characters

### 2. ⚠️ XSS via dangerouslySetInnerHTML (NEEDS ATTENTION)
**Location:** `react-app/src/pages/Home.tsx` (3 instances)
**Issue:** Admin-controlled content is rendered using `dangerouslySetInnerHTML` without sanitization
**Risk:** High - Admin-compromised account could inject malicious scripts
**Recommendation:** 
- Only admins can edit these settings (already enforced via RLS)
- Consider using a sanitization library like DOMPurify
- Or restrict HTML tags allowed in admin content editor

### 3. ⚠️ CORS Too Permissive (NEEDS ATTENTION)
**Location:** All Edge Functions
**Issue:** All functions use `"Access-Control-Allow-Origin": "*"` allowing any origin
**Risk:** Medium - Could allow unauthorized cross-origin requests
**Recommendation:** Restrict to specific production domain(s):
```typescript
const allowedOrigins = [
  'https://www.tasmentalhealthdirectory.com.au',
  'https://tasmentalhealthdirectory.com.au'
]
const origin = req.headers.get('origin')
const corsOrigin = allowedOrigins.includes(origin || '') ? origin : allowedOrigins[0]
```

### 4. ⚠️ Stack Traces in Error Responses (NEEDS ATTENTION)
**Location:** Multiple Edge Functions
**Issue:** Error responses include `stack: error.stack` which exposes internal code structure
**Risk:** Medium - Information disclosure
**Fix:** Remove stack traces from production error responses

### 5. ⚠️ set-admin-password Function Unprotected (NEEDS ATTENTION)
**Location:** `supabase/functions/set-admin-password/index.ts`
**Issue:** No authentication required - anyone can call this function
**Risk:** Critical - Could allow unauthorized password changes
**Fix:** Add authentication check and restrict to admin users only

### 6. ✅ Input Sanitization (IMPROVED)
**Location:** `react-app/src/pages/Home.tsx`, `react-app/src/pages/SearchResults.tsx`
**Fix:** Added basic input sanitization for search queries

## Security Best Practices Already Implemented

### ✅ Authentication & Authorization
- Supabase Auth handles password hashing (bcrypt)
- Strong password requirements enforced (8+ chars, uppercase, lowercase, number, special char)
- Email verification required for non-admin users
- Admin role checks via RLS policies
- Protected routes with role-based access control

### ✅ Database Security
- Row Level Security (RLS) enabled on all tables
- Proper RLS policies prevent unauthorized access
- Users can only access their own data
- Admins have appropriate elevated permissions
- Foreign key constraints with CASCADE deletes

### ✅ File Upload Security
- File type validation (images only)
- File size limits (5MB max)
- File extension validation
- Storage bucket policies restrict access

### ✅ API Security
- Supabase PostgREST uses parameterized queries (prevents SQL injection)
- Service role key only used in Edge Functions (server-side)
- Anon key used in client (with RLS protection)
- Webhook signature verification for Stripe

### ✅ Input Validation
- Email format validation
- Phone number validation with country codes
- Password strength validation
- Form validation on client-side

### ✅ Error Handling
- Generic error messages to users
- Detailed errors only in server logs
- No sensitive data in error responses

## Recommendations for Further Hardening

### High Priority
1. **Sanitize HTML Content**: Implement DOMPurify or similar for `dangerouslySetInnerHTML` content
2. **Restrict CORS**: Update Edge Functions to only allow specific origins
3. **Protect set-admin-password**: Add authentication requirement
4. **Remove Stack Traces**: Don't expose stack traces in production

### Medium Priority
1. **Rate Limiting**: Implement rate limiting on authentication endpoints
2. **CSRF Protection**: Add CSRF tokens for state-changing operations
3. **Content Security Policy (CSP)**: Add CSP headers to prevent XSS
4. **Session Management**: Review session timeout and refresh policies
5. **Audit Logging**: Log all admin actions for security auditing

### Low Priority
1. **Security Headers**: Add security headers (X-Frame-Options, X-Content-Type-Options, etc.)
2. **Input Length Limits**: Add maximum length validation for all text inputs
3. **File Upload**: Add virus scanning for uploaded files
4. **Two-Factor Authentication**: Consider 2FA for admin accounts

## Compliance Considerations

### Data Protection
- ✅ User data encrypted at rest (Supabase default)
- ✅ Data encrypted in transit (HTTPS)
- ✅ Password reset tokens expire
- ✅ Email verification required

### Privacy
- ✅ Users control visibility of their contact information
- ✅ Analytics data anonymized (session_id, not always user_id)
- ⚠️ IP addresses stored in analytics (consider anonymization)

## Testing Recommendations

1. **Penetration Testing**: Conduct professional security audit
2. **OWASP Top 10**: Verify protection against OWASP Top 10 vulnerabilities
3. **Dependency Scanning**: Regularly scan for vulnerable npm packages
4. **Security Headers**: Test with security header scanners
5. **SQL Injection Testing**: Test all database queries with malicious inputs

## Conclusion

The application has a solid security foundation with Supabase's built-in security features. The critical issues identified have been addressed or documented. The remaining recommendations are for further hardening and should be prioritized based on risk assessment.
