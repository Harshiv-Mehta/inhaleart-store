document.addEventListener("DOMContentLoaded", () => {
  const STORE_CONFIG = {
    whatsappNumber: "919909392198",
    contactEmail: "hello@inhaleart.in",
    businessName: "Inhale Art",
  };

  const authApi = window.InhaleArtAuth;
  const catalogApi = window.InhaleArtCatalog;
  const products = (catalogApi ? catalogApi.loadCatalog() : []).filter((product) => product.active !== false);

  const menuToggle = document.querySelector(".menu-toggle");
  const siteNav = document.querySelector(".site-nav");
  const navLinks = document.querySelectorAll(".site-nav a");
  const heroShowcase = document.getElementById("heroShowcase");
  const collectionGrid = document.getElementById("collectionGrid");
  const productGrid = document.getElementById("productGrid");
  const cartItems = document.getElementById("cart-items");
  const cartCount = document.getElementById("cart-count");
  const cartTotal = document.getElementById("cart-total");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const checkoutNote = document.getElementById("checkoutNote");
  const whatsappBtn = document.getElementById("whatsappBtn");
  const accountGreeting = document.getElementById("accountGreeting");
  const accountNote = document.getElementById("accountNote");
  const accountLink = document.getElementById("accountLink");
  const logoutBtn = document.getElementById("logoutBtn");
  const navLoginLink = document.getElementById("navLoginLink");
  const navAccountPill = document.getElementById("navAccountPill");
  const customForm = document.getElementById("customForm");
  const formStatus = document.getElementById("form-status");

  const cart = Array.isArray(authApi?.loadCart()) ? authApi.loadCart() : [];
  let razorpayReady = false;

  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = siteNav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      if (!href || !href.startsWith("#")) {
        return;
      }

      event.preventDefault();
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
      siteNav?.classList.remove("is-open");
      menuToggle?.setAttribute("aria-expanded", "false");
    });
  });

  function formatPrice(value) {
    return `Rs ${value.toLocaleString("en-IN")}`;
  }

  function getCartTotal() {
    return cart.reduce((sum, item) => sum + item.price, 0);
  }

  function buildOrderSummary() {
    const lines = cart.map((item, index) => `${index + 1}. ${item.name} - ${formatPrice(item.price)}`);
    const customer = authApi?.getCurrentCustomer();
    const customerLine = customer ? `Customer: ${customer.name} (${customer.email})\n\n` : "";
    return `${STORE_CONFIG.businessName} order inquiry\n\n${customerLine}${lines.join("\n")}\n\nTotal: ${formatPrice(getCartTotal())}`;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function getProductImages(product) {
    if (Array.isArray(product?.images) && product.images.length) {
      return product.images.map((image) => String(image || "").trim()).filter(Boolean);
    }

    return product?.image ? [String(product.image).trim()] : [];
  }

  function renderMedia(product, className = "", altPrefix = "") {
    const safeAlt = escapeHtml(`${altPrefix}${product.name}`.trim());
    const images = getProductImages(product);

    if (images.length) {
      return `
        <div class="${className} image-shell">
          <img class="media-image" src="${escapeHtml(images[0])}" alt="${safeAlt}" loading="lazy" />
        </div>
      `;
    }

    return `<div class="${className} image-shell"><div class="placeholder-art ${escapeHtml(product.artStyle || "resin-pearl")}"></div></div>`;
  }

  function renderHeroShowcase() {
    if (!heroShowcase || !products.length) {
      return;
    }

    const [first, second, third] = products;

    heroShowcase.innerHTML = `
      <article class="hero-main">
        ${renderMedia(first, "hero-main", "")}
      </article>
      <div class="hero-stack">
        <article class="hero-stack-card">
          ${renderMedia(second || first, "hero-stack-card", "")}
        </article>
        <article class="hero-stack-card">
          ${renderMedia(third || first, "hero-stack-card", "")}
        </article>
      </div>
    `;
  }

  function renderCollections() {
    if (!collectionGrid) {
      return;
    }

    const grouped = [...new Map(products.map((product) => [product.collection, product])).values()];

    collectionGrid.innerHTML = grouped
      .slice(0, 6)
      .map(
        (product) => `
          <article class="collection-card reveal">
            ${renderMedia(product, "collection-media", "Collection preview for ")}
            <div class="collection-copy">
              <span class="collection-badge">${escapeHtml(product.collection)}</span>
              <h3>${escapeHtml(product.collection)}</h3>
              <p>${escapeHtml(product.description)}</p>
            </div>
          </article>
        `
      )
      .join("");
  }

  function renderProducts() {
    if (!productGrid) {
      return;
    }

    const featured = products.filter((product) => product.featured);
    const list = (featured.length ? featured : products).slice(0, 10);

    productGrid.innerHTML = list
      .map(
        (product) => `
          <article class="product-card reveal">
            <div class="product-media-wrap">
              ${renderMedia(product, "product-media", "")}
              ${renderProductThumbs(product)}
            </div>
            <div class="product-copy">
              <span class="product-badge">${escapeHtml(product.badge || product.collection)}</span>
              <div class="product-top">
                <h3>${escapeHtml(product.name)}</h3>
                <span class="product-price">${formatPrice(product.price)}</span>
              </div>
              <p>${escapeHtml(product.description)}</p>
              <button class="add-to-cart" type="button" data-name="${escapeHtml(product.name)}" data-price="${product.price}">
                Add to cart
              </button>
            </div>
          </article>
        `
      )
      .join("");
  }

  function renderProductThumbs(product) {
    const images = getProductImages(product);

    if (images.length < 2) {
      return "";
    }

    const safeName = escapeHtml(product.name);

    return `
      <div class="product-thumbs" data-gallery="${escapeHtml(product.id)}" aria-label="${safeName} gallery">
        ${images
          .map(
            (image, index) => `
              <button
                class="product-thumb${index === 0 ? " is-active" : ""}"
                type="button"
                data-image="${escapeHtml(image)}"
                aria-label="Show image ${index + 1} for ${safeName}"
              >
                <img src="${escapeHtml(image)}" alt="" loading="lazy" />
              </button>
            `
          )
          .join("")}
      </div>
    `;
  }

  function attachRevealObserver() {
    const items = document.querySelectorAll(".reveal");
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.15 }
    );

    items.forEach((item) => revealObserver.observe(item));
  }

  function renderCart() {
    const total = getCartTotal();
    authApi?.saveCart(cart);

    cartCount.textContent = `${cart.length} ${cart.length === 1 ? "item" : "items"}`;
    cartTotal.textContent = formatPrice(total);

    if (!cart.length) {
      cartItems.innerHTML = '<p class="cart-empty">Your selected pieces will appear here.</p>';
      return;
    }

    cartItems.innerHTML = "";

    cart.forEach((item) => {
      const row = document.createElement("div");
      row.className = "cart-row";
      row.innerHTML = `
        <div>
          <strong>${escapeHtml(item.name)}</strong>
          <span>${formatPrice(item.price)}</span>
        </div>
        <button type="button" data-remove="${item.id}">Remove</button>
      `;

      cartItems.appendChild(row);
    });

    cartItems.querySelectorAll("[data-remove]").forEach((button) => {
      button.addEventListener("click", () => {
        const itemId = Number(button.getAttribute("data-remove"));
        const itemIndex = cart.findIndex((item) => item.id === itemId);

        if (itemIndex >= 0) {
          cart.splice(itemIndex, 1);
          renderCart();
        }
      });
    });
  }

  function renderAccountState() {
    const customer = authApi?.getCurrentCustomer();

    if (!customer) {
      accountGreeting.textContent = "Guest shopper";
      accountNote.textContent = "Sign in to save your cart and come back later.";
      accountLink.hidden = false;
      logoutBtn.hidden = true;
      if (navLoginLink) {
        navLoginLink.hidden = false;
      }
      if (navAccountPill) {
        navAccountPill.hidden = true;
      }
      return;
    }

    accountGreeting.textContent = customer.name;
    accountNote.textContent = `Signed in as ${customer.email}. Your cart will stay saved on this device.`;
    accountLink.hidden = true;
    logoutBtn.hidden = false;
    if (navLoginLink) {
      navLoginLink.hidden = true;
    }
    if (navAccountPill) {
      navAccountPill.hidden = false;
      navAccountPill.textContent = `Logged in: ${customer.name}`;
      navAccountPill.title = customer.email;
    }
  }

  function setCheckoutAvailability() {
    if (!checkoutBtn || !checkoutNote) {
      return;
    }

    const isLocalFilePreview = window.location.protocol === "file:";

    if (isLocalFilePreview) {
      checkoutBtn.disabled = true;
      checkoutBtn.textContent = "Razorpay unavailable in local preview";
      checkoutNote.textContent = "Razorpay needs deployment plus backend environment keys. Use WhatsApp for now on this preview.";
      return;
    }

    if (!razorpayReady) {
      checkoutBtn.disabled = true;
      checkoutBtn.textContent = "Razorpay not configured yet";
      checkoutNote.textContent = "Razorpay will work after deployment once RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are added.";
      return;
    }

    checkoutBtn.disabled = false;
    checkoutBtn.textContent = "Pay with Razorpay";
    checkoutNote.textContent = "Secure checkout is available.";
  }

  async function loadPaymentAvailability() {
    if (window.location.protocol === "file:") {
      setCheckoutAvailability();
      return;
    }

    try {
      const response = await fetch("/api/payment-config");
      const payload = await response.json();
      razorpayReady = Boolean(response.ok && payload?.razorpayReady);
    } catch (error) {
      razorpayReady = false;
    }

    setCheckoutAvailability();
  }

  renderHeroShowcase();
  renderCollections();
  renderProducts();
  attachRevealObserver();

  productGrid?.addEventListener("click", (event) => {
    const thumbButton = event.target.closest(".product-thumb");

    if (thumbButton) {
      const card = thumbButton.closest(".product-card");
      const mediaImage = card?.querySelector(".product-media .media-image");
      const nextImage = thumbButton.getAttribute("data-image");

      if (mediaImage && nextImage) {
        mediaImage.setAttribute("src", nextImage);
        card.querySelectorAll(".product-thumb").forEach((button) => {
          button.classList.toggle("is-active", button === thumbButton);
        });
      }

      return;
    }

    const button = event.target.closest(".add-to-cart");

    if (!button) {
      return;
    }

    cart.push({
      id: Date.now(),
      name: button.dataset.name || "Inhale Art Piece",
      price: Number(button.dataset.price || "0"),
    });

    button.textContent = "Added";
    window.setTimeout(() => {
      button.textContent = "Add to cart";
    }, 1200);

    renderCart();
  });

  whatsappBtn?.addEventListener("click", () => {
    if (!cart.length) {
      window.alert("Add at least one product before placing an order.");
      return;
    }

    const message = encodeURIComponent(buildOrderSummary());
    window.open(`https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${message}`, "_blank", "noopener");
  });

  checkoutBtn?.addEventListener("click", async () => {
    if (!cart.length) {
      window.alert("Add at least one product before proceeding to payment.");
      return;
    }

    if (!razorpayReady) {
      window.alert("Razorpay is not configured yet. Add your keys in deployment settings first.");
      return;
    }

    if (!window.Razorpay) {
      window.alert("Razorpay checkout is not available right now. Deploy the site and load the Razorpay script first.");
      return;
    }

    checkoutBtn.disabled = true;
    checkoutBtn.textContent = "Preparing payment...";

    try {
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: getCartTotal() * 100,
          notes: {
            items: cart.map((item) => item.name).join(", "),
          },
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to create payment. Check deployment and Razorpay environment keys.");
      }

      const razorpay = new window.Razorpay({
        key: payload.key,
        amount: payload.amount,
        currency: payload.currency,
        name: STORE_CONFIG.businessName,
        description: "Jewelry order payment",
        order_id: payload.orderId,
        handler: async (paymentResponse) => {
          const verifyResponse = await fetch("/api/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(paymentResponse),
          });

          const verifyPayload = await verifyResponse.json();

          if (!verifyResponse.ok || !verifyPayload.ok) {
            window.alert("Payment was received but verification failed. Please contact Inhale Art.");
            return;
          }

          window.alert("Payment successful. Your order request has been confirmed.");
        },
        theme: {
          color: "#8fd8bf",
        },
        prefill: {
          email: STORE_CONFIG.contactEmail,
        },
      });

      razorpay.open();
    } catch (error) {
      window.alert(error.message || "Payment could not be started. Deploy the site and configure Razorpay keys.");
    } finally {
      setCheckoutAvailability();
    }
  });

  customForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(customForm);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const request = String(data.get("request") || "").trim();

    if (!name || !email || !request) {
      formStatus.textContent = "Please complete every field before sending your request.";
      formStatus.classList.add("is-error");
      return;
    }

    const customMessage = encodeURIComponent(
      `Custom order request for ${STORE_CONFIG.businessName}\n\nName: ${name}\nEmail: ${email}\nRequest: ${request}`
    );
    const whatsappUrl = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${customMessage}`;

    formStatus.textContent = `Thanks, ${name}. Your custom request is ready and will open on WhatsApp next.`;
    formStatus.classList.remove("is-error");
    customForm.reset();

    window.setTimeout(() => {
      window.open(whatsappUrl, "_blank", "noopener");
    }, 500);
  });

  logoutBtn?.addEventListener("click", () => {
    authApi?.logoutCustomer();
    cart.splice(0, cart.length, ...(authApi?.loadCart() || []));
    renderAccountState();
    renderCart();
  });

  renderAccountState();
  loadPaymentAvailability();
  renderCart();
});
