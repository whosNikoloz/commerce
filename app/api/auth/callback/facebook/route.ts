import { NextRequest, NextResponse } from "next/server";

/**
 * OAuth callback handler for Facebook
 * This route receives the redirect from Facebook after user authorizes
 * Since we're using implicit flow (client-side), this just serves the page
 * The actual token handling happens in client-side JavaScript
 */
export async function GET(_request: NextRequest) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Facebook Login - Processing...</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      background: #f5f5f5;
    }
    .loader {
      text-align: center;
    }
    .spinner {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #1877f2;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="loader">
    <div class="spinner"></div>
    <p>Completing Facebook login...</p>
  </div>
  <script>
    (async function() {
      try {
        // Get access token from URL fragment
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);

        const accessToken = params.get('access_token');
        const error = params.get('error');

        if (error) {
          console.error('OAuth error:', error);
          window.opener?.postMessage({ type: 'oauth-error', provider: 'facebook', error }, window.location.origin);
          window.close();
          return;
        }

        if (!accessToken) {
          console.error('No access token received');
          window.opener?.postMessage({ type: 'oauth-error', provider: 'facebook', error: 'No access token' }, window.location.origin);
          window.close();
          return;
        }

        // Send token to your backend to exchange for your app's tokens
        const response = await fetch('/api/auth/oauth-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: 'facebook',
            accessToken,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to authenticate with backend');
        }

        const data = await response.json();

        // Send success message to parent window
        if (window.opener) {
          window.opener.postMessage({
            type: 'oauth-success',
            provider: 'facebook',
            tokens: data
          }, window.location.origin);
          window.close();
        } else {
          // If not in popup, redirect to home with tokens in session
          window.location.href = '/';
        }
      } catch (err) {
        console.error('Callback error:', err);
        window.opener?.postMessage({
          type: 'oauth-error',
          provider: 'facebook',
          error: err.message
        }, window.location.origin);
        window.close();
      }
    })();
  </script>
</body>
</html>
  `;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
