import { NextRequest, NextResponse } from "next/server";

/**
 * OAuth callback handler for Google
 * This route receives the redirect from Google after user authorizes
 * Since we're using implicit flow (client-side), this just serves the page
 * The actual token handling happens in client-side JavaScript
 */
export async function GET(request: NextRequest) {
  // For implicit flow, the access token is in the URL fragment (#access_token=...)
  // We can't access it server-side, so we return an HTML page that handles it client-side

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Google Login - Processing...</title>
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
      border-top: 3px solid #4285f4;
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
    <p>Completing Google login...</p>
  </div>
  <script>
    (async function() {
      try {
        // Get access token and id token from URL fragment
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);

        const accessToken = params.get('access_token');
        const idToken = params.get('id_token');
        const error = params.get('error');

        if (error) {
          console.error('OAuth error:', error);
          window.opener?.postMessage({ type: 'oauth-error', provider: 'google', error }, window.location.origin);
          window.close();
          return;
        }

        if (!accessToken) {
          console.error('No access token received');
          window.opener?.postMessage({ type: 'oauth-error', provider: 'google', error: 'No access token' }, window.location.origin);
          window.close();
          return;
        }

        // Send tokens to your backend to exchange for your app's tokens
        const response = await fetch('/api/auth/oauth-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: 'google',
            accessToken,
            idToken,
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
            provider: 'google',
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
          provider: 'google',
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
