/**
 * Login & signup form handlers. Used by login.html and signup.html.
 */
(function () {
  'use strict';

  function qs(name) {
    return new URLSearchParams(location.search).get(name);
  }

  function redirectAfterAuth() {
    var next = qs('next') || 'index.html';
    window.location.href = next;
  }

  function bindLogin() {
    var form = document.getElementById('login-form');
    if (!form) return;
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var original = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Signing in…';
      try {
        await window.CC_API.login({
          email: form.email.value.trim(),
          password: form.password.value,
        });
        window.CC_UI.toast('Welcome back!');
        setTimeout(redirectAfterAuth, 500);
      } catch (err) {
        window.CC_UI.toast(err.message, 'error');
        btn.disabled = false;
        btn.textContent = original;
      }
    });
  }

  function bindSignup() {
    var form = document.getElementById('signup-form');
    if (!form) return;
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var original = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Creating account…';
      try {
        await window.CC_API.register({
          name: form.name.value.trim(),
          email: form.email.value.trim(),
          password: form.password.value,
        });
        window.CC_UI.toast('Account created!');
        setTimeout(redirectAfterAuth, 500);
      } catch (err) {
        window.CC_UI.toast(err.message, 'error');
        btn.disabled = false;
        btn.textContent = original;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    // If already logged in, skip the auth pages.
    if (window.CC_API.isLoggedIn()) {
      redirectAfterAuth();
      return;
    }
    bindLogin();
    bindSignup();
  });
})();
