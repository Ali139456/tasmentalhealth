# Supabase Email Template - Confirm Signup

## Instructions:
1. Go to Supabase Dashboard → Authentication → Notifications → Email
2. Click on "Confirm sign up"
3. Replace the template with the code below

## Email Template Code:

**Subject:**
```
Confirm Your Signup - Tasmanian Mental Health Directory
```

**Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #39B8A6 0%, #2E9385 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { padding: 30px 20px; }
    .button { display: inline-block; background: #39B8A6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; font-size: 16px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .button:hover { background-color: #2E9385; }
    .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #e5e5e5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">Confirm Your Signup</h1>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>Thank you for signing up for the <strong>Tasmanian Mental Health Directory</strong>! Please verify your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 25px 0;">
        <a href="{{ .ConfirmationURL }}" class="button" style="display: inline-block; background: #39B8A6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Confirm Your Email</a>
      </div>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #39B8A6; font-size: 12px;">{{ .ConfirmationURL }}</p>
      <p><strong>This link will expire in 24 hours.</strong></p>
      <p>If you didn't create this account, please ignore this email.</p>
    </div>
    <div class="footer">
      <p>This email was sent to {{ .Email }}. If you didn't request this, please ignore it.</p>
      <p>&copy; 2025 Tasmanian Mental Health Directory. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```

## Notes:
- The button uses theme teal color (#39B8A6) with white text
- Inline styles ensure the button renders properly in email clients
- The template uses Supabase's `{{ .ConfirmationURL }}` variable
- Make sure "Confirm email" toggle is ENABLED in Sign In / Providers settings
