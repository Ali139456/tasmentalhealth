-- Email sending functions for automatic email notifications
-- These functions will be called from triggers or application code

-- Enable http extension for making HTTP requests to Edge Functions
CREATE EXTENSION IF NOT EXISTS http;

-- Function to send welcome email when user signs up
CREATE OR REPLACE FUNCTION send_welcome_email()
RETURNS TRIGGER AS $$
DECLARE
  app_url TEXT;
  email_html TEXT;
  email_subject TEXT;
BEGIN
  -- Get APP_URL from environment (you'll need to set this in Supabase)
  -- For now, using a default value - you should set this via Supabase secrets
  app_url := COALESCE(
    current_setting('app.url', true),
    'https://tasmentalhealth.vercel.app'
  );

  email_subject := 'Welcome to Tasmanian Mental Health Directory';
  email_html := format('
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Welcome!</h2>
        <p>Hello,</p>
        <p>Thank you for creating an account with the <strong>Tasmanian Mental Health Directory</strong>!</p>
        <p>Your account has been successfully created.</p>
        <p><a href="%s/dashboard" class="button">Go to Dashboard</a></p>
      </div>
    </body>
    </html>
  ', app_url);

  -- Call the send-email Edge Function
  PERFORM
    net.http_post(
      url := current_setting('app.supabase_url', true) || '/functions/v1/send-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
      ),
      body := jsonb_build_object(
        'to', NEW.email,
        'subject', email_subject,
        'html', email_html
      )
    );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the transaction
    RAISE WARNING 'Failed to send welcome email: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send account activated email when email is verified
CREATE OR REPLACE FUNCTION send_account_activated_email()
RETURNS TRIGGER AS $$
DECLARE
  app_url TEXT;
  email_html TEXT;
BEGIN
  -- Only send if email was just confirmed (was NULL, now is NOT NULL)
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    app_url := COALESCE(
      current_setting('app.url', true),
      'https://tasmentalhealth.vercel.app'
    );

    email_html := format('
      <!DOCTYPE html>
      <html>
      <body>
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Account Activated</h2>
          <p>Your email has been verified and your account is now fully activated.</p>
          <p><a href="%s/dashboard">Go to Dashboard</a></p>
        </div>
      </body>
      </html>
    ', app_url);

    -- Call send-email function (this would need to be implemented via Edge Function call)
    -- For now, we'll handle this in application code
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: Due to Supabase limitations, database triggers cannot directly call Edge Functions
-- The recommended approach is to send emails from application code after user actions
-- These functions are provided as reference but may need to be called from application code instead
