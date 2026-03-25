document.addEventListener("DOMContentLoaded", () => {
  const authApi = window.InhaleArtAuth;

  if (!authApi) {
    return;
  }

  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const authStatus = document.getElementById("authStatus");
  const showLoginBtn = document.getElementById("showLoginBtn");
  const showSignupBtn = document.getElementById("showSignupBtn");

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
    setStatus("");
  }

  showLoginBtn?.addEventListener("click", () => setMode("login"));
  showSignupBtn?.addEventListener("click", () => setMode("signup"));

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
});
