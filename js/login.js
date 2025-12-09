(function() {
    'use strict';

    function showError(message) {
        const errorBox = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');
        if (errorBox && errorText) {
            errorText.textContent = message;
            errorBox.style.display = 'flex';
        }
    }

    function hideError() {
        const errorBox = document.getElementById('errorMessage');
        if (errorBox) {
            errorBox.style.display = 'none';
        }
    }

    function ensureGsiLoaded() {
        return new Promise((resolve, reject) => {
            if (window.google && google.accounts && google.accounts.id) {
                return resolve();
            }
            const script = document.querySelector('script[src*="gsi/client"]');
            if (!script) {
                return reject(new Error('Google Sign-In script missing'));
            }
            script.addEventListener('load', () => resolve());
            script.addEventListener('error', () => reject(new Error('Google Sign-In failed to load')));
        });
    }

    function handleGoogleSignIn(response) {
        hideError();
        return Auth.handleGoogleCallback(response);
    }

    async function initLogin() {
        const clientId = CONFIG.GOOGLE_CLIENT_ID;

        if (!clientId || clientId.includes('1029752642188-ku0k9krbdbsttj9br238glq8h4k5loj3.apps.googleusercontent.com')) {
            showError('Google Client ID missing. Contact admin.');
            return;
        }

        try {
            await ensureGsiLoaded();

            google.accounts.id.initialize({
                client_id: clientId,
                callback: handleGoogleSignIn,
                auto_select: false,
                cancel_on_tap_outside: true
            });

            const buttonContainer = document.querySelector('.g_id_signin');
            if (buttonContainer) {
                google.accounts.id.renderButton(buttonContainer, {
                    type: 'standard',
                    theme: 'outline',
                    size: 'large',
                    text: 'signin_with',
                    logo_alignment: 'left',
                    width: 320
                });
            }

            const customBtn = document.getElementById('customGoogleBtn');
            if (customBtn) {
                customBtn.onclick = () => google.accounts.id.prompt();
            }
        } catch (error) {
            console.error('Google Sign-In init error:', error);
            showError('Google Sign-In load failed. Please refresh.');
        }
    }

    // Expose callbacks expected by the HTML data attributes
    window.handleGoogleSignIn = handleGoogleSignIn;
    window.initiateGoogleSignIn = () => google?.accounts?.id?.prompt();

    document.addEventListener('DOMContentLoaded', initLogin);
})();
