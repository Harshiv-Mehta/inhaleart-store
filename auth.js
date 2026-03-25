(function () {
  const CUSTOMER_USERS_KEY = "inhaleart_customer_users_v1";
  const CUSTOMER_SESSION_KEY = "inhaleart_customer_session_v1";
  const GUEST_CART_KEY = "inhaleart_guest_cart_v1";
  const CUSTOMER_CART_PREFIX = "inhaleart_cart_v1_";
  const ADMIN_SESSION_KEY = "inhaleart_admin_session_v1";
  const ADMIN_PASSWORD_HASH = "f2d624f7c0488089f922d3ed1f3e1a04809f7eee7aa6ace2ec7f312166a2f64f";

  function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
  }

  function readJson(key, fallback) {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getCustomerUsers() {
    return readJson(CUSTOMER_USERS_KEY, []);
  }

  function saveCustomerUsers(users) {
    writeJson(CUSTOMER_USERS_KEY, users);
  }

  function getCustomerSession() {
    return readJson(CUSTOMER_SESSION_KEY, null);
  }

  function setCustomerSession(user) {
    writeJson(CUSTOMER_SESSION_KEY, {
      name: user.name,
      email: normalizeEmail(user.email),
    });
  }

  function getCurrentCustomer() {
    return getCustomerSession();
  }

  function logoutCustomer() {
    localStorage.removeItem(CUSTOMER_SESSION_KEY);
  }

  function getCartStorageKey(email) {
    return `${CUSTOMER_CART_PREFIX}${normalizeEmail(email)}`;
  }

  function loadGuestCart() {
    return readJson(GUEST_CART_KEY, []);
  }

  function saveGuestCart(cart) {
    writeJson(GUEST_CART_KEY, cart);
  }

  function loadCustomerCart(email) {
    return readJson(getCartStorageKey(email), []);
  }

  function saveCustomerCart(email, cart) {
    writeJson(getCartStorageKey(email), cart);
  }

  function loadCart() {
    const customer = getCurrentCustomer();
    return customer ? loadCustomerCart(customer.email) : loadGuestCart();
  }

  function saveCart(cart) {
    const customer = getCurrentCustomer();

    if (customer) {
      saveCustomerCart(customer.email, cart);
      return;
    }

    saveGuestCart(cart);
  }

  function mergeGuestCartIntoCustomer(email) {
    const guestCart = loadGuestCart();

    if (!guestCart.length) {
      return;
    }

    const customerCart = loadCustomerCart(email);
    saveCustomerCart(email, [...customerCart, ...guestCart]);
    localStorage.removeItem(GUEST_CART_KEY);
  }

  async function hashString(value) {
    const source = new TextEncoder().encode(String(value || ""));
    const digest = await crypto.subtle.digest("SHA-256", source);
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  async function registerCustomer({ name, email, password }) {
    const safeName = String(name || "").trim();
    const safeEmail = normalizeEmail(email);
    const safePassword = String(password || "");

    if (!safeName || !safeEmail || safePassword.length < 6) {
      throw new Error("Enter your name, a valid email, and a password with at least 6 characters.");
    }

    const users = getCustomerUsers();

    if (users.some((user) => user.email === safeEmail)) {
      throw new Error("An account with this email already exists.");
    }

    const passwordHash = await hashString(safePassword);
    const user = { name: safeName, email: safeEmail, passwordHash };
    users.push(user);
    saveCustomerUsers(users);
    setCustomerSession(user);
    mergeGuestCartIntoCustomer(safeEmail);

    return { name: safeName, email: safeEmail };
  }

  async function loginCustomer({ email, password }) {
    const safeEmail = normalizeEmail(email);
    const passwordHash = await hashString(password);
    const user = getCustomerUsers().find((entry) => entry.email === safeEmail);

    if (!user || user.passwordHash !== passwordHash) {
      throw new Error("Incorrect email or password.");
    }

    setCustomerSession(user);
    mergeGuestCartIntoCustomer(safeEmail);

    return { name: user.name, email: user.email };
  }

  async function verifyAdminPassword(password) {
    const passwordHash = await hashString(password);
    return passwordHash === ADMIN_PASSWORD_HASH;
  }

  function setAdminSession() {
    writeJson(ADMIN_SESSION_KEY, { authenticated: true, savedAt: Date.now() });
  }

  function isAdminAuthenticated() {
    const session = readJson(ADMIN_SESSION_KEY, null);
    return Boolean(session?.authenticated);
  }

  function logoutAdmin() {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }

  window.InhaleArtAuth = {
    getCurrentCustomer,
    loginCustomer,
    logoutCustomer,
    registerCustomer,
    loadCart,
    saveCart,
    loadGuestCart,
    saveGuestCart,
    verifyAdminPassword,
    setAdminSession,
    isAdminAuthenticated,
    logoutAdmin,
  };
})();
