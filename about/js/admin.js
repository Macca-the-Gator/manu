(function () {
  'use strict';

  var API = 'https://api.pklavc.com';
  var loginForm = document.querySelector('[data-login-form]');
  var loginScreen = document.querySelector('[data-login-screen]');
  var adminShell = document.querySelector('[data-admin-shell]');
  if (!loginForm || !loginScreen || !adminShell) return;

  var errorNode = document.querySelector('[data-login-error]');
  var submitButton = loginForm.querySelector('button[type="submit"]');
  var usernameInput = loginForm.elements.username;
  var passwordInput = loginForm.elements.password;
  var sectionLabels = { overview: 'VisÃ£o geral', ads: 'Publicidade', users: 'UsuÃ¡rios' };

  function showLogin(message) {
    adminShell.hidden = true;
    loginScreen.hidden = false;
    document.body.classList.remove('is-admin-open');
    if (errorNode) {
      errorNode.textContent = message || '';
      errorNode.hidden = !message;
    }
  }

  function showPanel() {
    loginScreen.hidden = true;
    adminShell.hidden = false;
    document.body.classList.add('is-admin-open');
  }

  async function checkSession() {
    try {
      var response = await fetch(API + '/auth/session', { method: 'GET', credentials: 'include' });
      if (response.ok) {
        var session = await response.json();
        if (session.authenticated && session.role === 'admin') {
          showPanel();
          return;
        }
      }
    } catch (_) { /* Keep login visible if the API is unavailable. */ }
    showLogin();
  }

  loginForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    if (errorNode) { errorNode.hidden = true; errorNode.textContent = ''; }
    submitButton.disabled = true;
    try {
      var response = await fetch(API + '/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput.value, password: passwordInput.value })
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 429) {
          showLogin('UsuÃ¡rio ou senha incorretos.');
        } else {
          showLogin('NÃ£o foi possÃ­vel entrar agora. Tente novamente.');
        }
        return;
      }
      var result = await response.json();
      if (result.authenticated && result.role === 'admin') {
        passwordInput.value = '';
        showPanel();
      } else {
        showLogin('NÃ£o foi possÃ­vel entrar agora. Tente novamente.');
      }
    } catch (_) {
      showLogin('NÃ£o foi possÃ­vel conectar ao serviÃ§o de autenticaÃ§Ã£o.');
    } finally {
      submitButton.disabled = false;
    }
  });

  document.querySelectorAll('[data-section]').forEach(function (button) {
    button.addEventListener('click', function () {
      var selected = button.getAttribute('data-section');
      document.querySelectorAll('[data-section]').forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
      document.querySelectorAll('[data-panel]').forEach(function (panel) {
        var active = panel.getAttribute('data-panel') === selected;
        panel.hidden = !active;
        panel.classList.toggle('is-visible', active);
      });
      document.querySelector('[data-current-section]').textContent = sectionLabels[selected];
      document.querySelector('[data-page-title]').textContent = sectionLabels[selected];
    });
  });

  var logout = document.querySelector('[data-logout]');
  if (logout) logout.addEventListener('click', async function () {
    logout.disabled = true;
    try {
      var response = await fetch(API + '/auth/logout', { method: 'POST', credentials: 'include' });
      if (!response.ok) throw new Error('logout_failed');
      passwordInput.value = '';
      showLogin();
    } catch (_) {
      window.alert('NÃ£o foi possÃ­vel encerrar a sessÃ£o. Tente novamente.');
    } finally {
      logout.disabled = false;
    }
  });

  showLogin();
  checkSession();
}());
