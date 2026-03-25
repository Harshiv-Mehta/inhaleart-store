document.addEventListener("DOMContentLoaded", () => {
  const authApi = window.InhaleArtAuth;
  const catalogApi = window.InhaleArtCatalog;

  if (!catalogApi || !authApi?.isAdminAuthenticated()) {
    window.location.href = "admin-login.html";
    return;
  }

  const form = document.getElementById("productForm");
  const status = document.getElementById("adminStatus");
  const inventoryList = document.getElementById("inventoryList");
  const inventoryCount = document.getElementById("inventoryCount");
  const newProductBtn = document.getElementById("newProductBtn");
  const deleteBtn = document.getElementById("deleteBtn");
  const exportBtn = document.getElementById("exportBtn");
  const importInput = document.getElementById("importInput");
  const resetBtn = document.getElementById("resetBtn");
  const logoutBtn = document.getElementById("adminLogoutBtn");

  const fields = {
    id: document.getElementById("productId"),
    name: document.getElementById("productName"),
    price: document.getElementById("productPrice"),
    collection: document.getElementById("productCollection"),
    description: document.getElementById("productDescription"),
    images: document.getElementById("productImages"),
    badge: document.getElementById("productBadge"),
    artStyle: document.getElementById("productArtStyle"),
    featured: document.getElementById("productFeatured"),
    active: document.getElementById("productActive"),
  };

  let products = catalogApi.loadCatalog();

  function slugify(value) {
    return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  function setStatus(message, isError = false) {
    status.textContent = message;
    status.classList.toggle("is-error", isError);
  }

  function getProductImages(product) {
    if (Array.isArray(product?.images) && product.images.length) {
      return product.images.map((image) => String(image || "").trim()).filter(Boolean);
    }

    return product?.image ? [String(product.image).trim()] : [];
  }

  function fillForm(product) {
    fields.id.value = product?.id || "";
    fields.name.value = product?.name || "";
    fields.price.value = product?.price || "";
    fields.collection.value = product?.collection || "";
    fields.description.value = product?.description || "";
    fields.images.value = getProductImages(product).join("\n");
    fields.badge.value = product?.badge || "";
    fields.artStyle.value = product?.artStyle || "resin-mint";
    fields.featured.checked = Boolean(product?.featured);
    fields.active.checked = product ? Boolean(product.active) : true;
  }

  function renderInventory() {
    inventoryCount.textContent = `${products.length} products`;
    inventoryList.innerHTML = "";

    products.forEach((product) => {
      const card = document.createElement("article");
      card.className = "inventory-card";
      const imageCount = getProductImages(product).length;
      card.innerHTML = `
        <h3>${product.name}</h3>
        <small>${product.collection}</small>
        <div class="inventory-meta">
          <span class="inventory-tag">Rs ${Number(product.price).toLocaleString("en-IN")}</span>
          <span class="inventory-tag">${imageCount} ${imageCount === 1 ? "image" : "images"}</span>
          <span class="inventory-tag">${product.artStyle}</span>
          <span class="inventory-tag">${product.badge || "No badge"}</span>
          <span class="inventory-tag">${product.featured ? "Featured" : "Standard"}</span>
          <span class="inventory-tag">${product.active ? "Active" : "Hidden"}</span>
        </div>
        <p>${product.description}</p>
        <button class="button-secondary" type="button" data-edit="${product.id}">Edit</button>
      `;

      inventoryList.appendChild(card);
    });

    inventoryList.querySelectorAll("[data-edit]").forEach((button) => {
      button.addEventListener("click", () => {
        const product = products.find((item) => item.id === button.dataset.edit);

        if (product) {
          fillForm(product);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const images = fields.images.value
      .split(/\r?\n|,/)
      .map((image) => image.trim())
      .filter(Boolean);

    const payload = {
      id: fields.id.value || slugify(fields.name.value),
      name: fields.name.value.trim(),
      price: Number(fields.price.value),
      collection: fields.collection.value.trim(),
      description: fields.description.value.trim(),
      image: images[0] || "",
      images,
      badge: fields.badge.value.trim(),
      artStyle: fields.artStyle.value,
      featured: fields.featured.checked,
      active: fields.active.checked,
    };

    if (!payload.name || !payload.price || !payload.collection || !payload.description) {
      setStatus("Please complete all required fields.", true);
      return;
    }

    const existingIndex = products.findIndex((item) => item.id === payload.id);

    if (existingIndex >= 0) {
      products[existingIndex] = payload;
    } else {
      products.unshift(payload);
    }

    catalogApi.saveCatalog(products);
    renderInventory();
    fillForm(null);
    setStatus("Catalog updated. The storefront will reflect this on refresh.");
  });

  newProductBtn.addEventListener("click", () => {
    fillForm(null);
    setStatus("Ready to add a new product.");
  });

  deleteBtn.addEventListener("click", () => {
    const id = fields.id.value;

    if (!id) {
      setStatus("Select a product first if you want to delete it.", true);
      return;
    }

    products = products.filter((product) => product.id !== id);
    catalogApi.saveCatalog(products);
    renderInventory();
    fillForm(null);
    setStatus("Product deleted from the catalog.");
  });

  exportBtn.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(products, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "inhaleart-catalog.json";
    link.click();
    URL.revokeObjectURL(url);
    setStatus("Catalog JSON exported.");
  });

  importInput.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const imported = JSON.parse(text);

      if (!Array.isArray(imported)) {
        throw new Error("Invalid catalog file");
      }

      products = imported;
      catalogApi.saveCatalog(products);
      renderInventory();
      fillForm(null);
      setStatus("Catalog imported successfully.");
    } catch (error) {
      setStatus("Catalog import failed. Please use a valid JSON export.", true);
    }
  });

  resetBtn.addEventListener("click", () => {
    products = JSON.parse(JSON.stringify(catalogApi.defaultProducts));
    catalogApi.resetCatalog();
    renderInventory();
    fillForm(null);
    setStatus("Catalog reset to the original collection.");
  });

  logoutBtn?.addEventListener("click", () => {
    authApi.logoutAdmin();
    window.location.href = "admin-login.html";
  });

  renderInventory();
  fillForm(products[0] || null);
});
