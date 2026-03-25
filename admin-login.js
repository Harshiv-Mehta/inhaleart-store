document.addEventListener("DOMContentLoaded", () => {
  const authApi = window.InhaleArtAuth;

  if (!authApi) {
    return;
  }

  const form = document.getElementById("adminLoginForm");
  const passwordInput = document.getElementById("adminPassword");
  const status = document.getElementById("adminLoginStatus");

  function setStatus(message, isError = false) {
    status.textContent = message;
    status.classList.toggle("is-error", isError);
  }

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const isValid = await authApi.verifyAdminPassword(passwordInput.value);

    if (!isValid) {
      setStatus("Incorrect admin password.", true);
      return;
    }

    authApi.setAdminSession();
    setStatus("Access granted. Opening admin...");
    window.setTimeout(() => {
      window.location.href = "admin.html";
    }, 350);
  });
});
