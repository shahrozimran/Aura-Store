document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, redirect to index
  if (isLoggedIn()) {
    window.location.href = 'index.html';
    return;
  }

  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const alertBox = document.getElementById('auth-alert');

  // Tab switching logic
  tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    clearAlert();
  });

  tabRegister.addEventListener('click', () => {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    clearAlert();
  });

  // Alert helper functions
  function showAlert(message, type = 'error') {
    alertBox.textContent = message;
    alertBox.className = `alert alert-${type}`;
  }

  function clearAlert() {
    alertBox.textContent = '';
    alertBox.className = 'alert hidden';
  }

  // Handle Login submission
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAlert();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    try {
      const data = await api.login(email, password);
      showAlert('Login successful! Redirecting...', 'success');
      
      // Save credentials
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect after a short delay
      setTimeout(() => {
        // If query param 'redirect' is specified (e.g. checkout), go there
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect');
        window.location.href = redirect ? redirect : 'index.html';
      }, 1000);
    } catch (error) {
      showAlert(error.message);
    }
  });

  // Handle Register submission
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAlert();

    const username = document.getElementById('register-username').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;

    if (password.length < 6) {
      showAlert('Password must be at least 6 characters long');
      return;
    }

    try {
      const data = await api.register(username, email, password);
      showAlert('Registration successful! Redirecting...', 'success');

      // Save credentials
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setTimeout(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect');
        window.location.href = redirect ? redirect : 'index.html';
      }, 1000);
    } catch (error) {
      showAlert(error.message);
    }
  });
});
