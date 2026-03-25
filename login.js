document.addEventListener("DOMContentLoaded", () => {
  const authApi = window.InhaleArtAuth;

  if (!authApi) {
    return;
  }

  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const authStatus = document.getElementById("authStatus");
  const authLead = document.getElementById("authLead");
  const authHelper = document.getElementById("authHelper");
  const showLoginBtn = document.getElementById("showLoginBtn");
  const showSignupBtn = document.getElementById("showSignupBtn");
  const currentSessionCard = document.getElementById("currentSessionCard");
  const currentSessionName = document.getElementById("currentSessionName");
  const currentSessionEmail = document.getElementById("currentSessionEmail");
  const sessionLogoutBtn = document.getElementById("sessionLogoutBtn");
  const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
  const passwordToggleButtons = document.querySelectorAll("[data-toggle-password]");

  function setStatus(message, isError = false) {
    authStatus.textContent = message;
    authStatus.classList.toggle("is-error", isError);
  }

  function setMode(mode) {
    const isLogin = mode === "login";
    loginForm.hidden = !isLogin;
    signupForm.hidden = isLogin;
    showLoginBtn.className = isLogin ? "button-primary" : "button-secondary";
    showSignupBtn.className = isLogin ? "button-secondary" : "button-primary";
    authLead.textContent = isLogin
      ? "Use your email and password to continue shopping."
      : "Create your account once and keep your cart saved for later.";
    authHelper.textContent = isLogin
      ? "New here? Create an account and your cart will stay saved after login."
      : "Already have an account? Switch to login and continue from your saved cart.";
    setStatus("");
  }

  function renderCurrentSession() {
    const customer = authApi.getCurrentCustomer();

    if (!customer) {
      currentSessionCard.hidden = true;
      return;
    }

    currentSessionCard.hidden = false;
    currentSessionName.textContent = `${customer.name} is already signed in.`;
    currentSessionEmail.textContent = customer.email;
  }

  showLoginBtn?.addEventListener("click", () => setMode("login"));
  showSignupBtn?.addEventListener("click", () => setMode("signup"));
  sessionLogoutBtn?.addEventListener("click", () => {
    authApi.logoutCustomer();
    renderCurrentSession();
    setStatus("You have been logged out.");
  });
  forgotPasswordBtn?.addEventListener("click", () => {
    setStatus("Password reset is not connected to email yet. For now, create a new account or contact Inhale Art for help.");
  });

  passwordToggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const wrapper = button.closest(".password-field");
      const input = wrapper?.querySelector("input");

      if (!input) {
        return;
      }

      const isHidden = input.type === "password";
      input.type = isHidden ? "text" : "password";
      button.textContent = isHidden ? "Hide" : "Show";
    });
  });

  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(loginForm);

    try {
      const customer = await authApi.loginCustomer({
        email: formData.get("email"),
        password: formData.get("password"),
      });

      setStatus(`Welcome back, ${customer.name}. Redirecting you to the store...`);
      window.setTimeout(() => {
        window.location.href = "index.html";
      }, 500);
    } catch (error) {
      setStatus(error.message || "Login failed.", true);
    }
  });

  signupForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(signupForm);

    try {
      const customer = await authApi.registerCustomer({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
      });

      setStatus(`Account created for ${customer.name}. Redirecting you to the store...`);
      window.setTimeout(() => {
        window.location.href = "index.html";
      }, 500);
    } catch (error) {
      setStatus(error.message || "Account creation failed.", true);
    }
  });

  setMode("login");
  renderCurrentSession();
});
