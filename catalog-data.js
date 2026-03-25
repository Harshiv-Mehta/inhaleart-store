(function () {
  const STORAGE_KEY = "inhaleart_catalog_v1";
  const defaultProductImages = {
    "aqua-shimmer-bookmark": ["assets/client-selected/bookmarks/aqua-shimmer-bookmark.png"],
    "butterfly-confetti-bookmark": ["assets/client-selected/bookmarks/butterfly-confetti-bookmark.png"],
    "bookmark-glitter-set": [
      "assets/client-selected/bookmarks/bookmark-glitter-set.jpg",
      "assets/client-selected/bookmarks/bookmark-glitter-set-alt.png",
    ],
    "blue-evil-eye-bracelet": ["assets/client-selected/bracelets/blue-evil-eye-bracelet.png"],
    "pressed-petal-bracelet": ["assets/client-selected/bracelets/pressed-petal-bracelet.png"],
    "mint-butterfly-bracelet": ["assets/client-selected/bracelets/mint-butterfly-bracelet.png"],
    "floral-art-coaster-set": ["assets/products/home-decor.svg"],
    "baby-memory-plaque": [
      "assets/client-selected/keepsakes/baby-memory-plaque.jpg",
      "assets/client-selected/keepsakes/baby-memory-plaque-alt.jpg",
    ],
    "gold-diamond-studs": ["assets/client-selected/earrings/gold-diamond-studs.jpg"],
    "aqua-glitter-studs": ["assets/client-selected/earrings/aqua-glitter-studs.jpg"],
    "blush-butterfly-hoops": ["assets/client-selected/earrings/blush-butterfly-hoops.jpg"],
    "triple-heart-dangles": ["assets/client-selected/earrings/triple-heart-dangles.jpg"],
    "oxidized-rose-jhumkas": ["assets/client-selected/earrings/oxidized-rose-jhumkas.jpg"],
    "pressed-flower-drop-earrings": ["assets/client-selected/earrings/pressed-flower-drop-earrings.jpeg"],
    "yellow-petal-stud-set": ["assets/client-selected/pendants/yellow-petal-stud-set.jpeg"],
    "peacock-feather-pendant": ["assets/client-selected/pendants/peacock-feather-pendant.jpg"],
    "green-eye-pendant": ["assets/products/pendant-sets.svg"],
    "pearl-heart-jewelry-set": ["assets/client-selected/pendants/pearl-heart-jewelry-set.jpg"],
    "blue-iris-bracelet": ["assets/products/bracelets.svg"],
  };
  const generatedAssetPrefix = "assets/products/";
  const generatedFallbackHiddenProducts = new Set([
    "floral-art-coaster-set",
    "green-eye-pendant",
    "blue-iris-bracelet",
  ]);
  const clientReviewHiddenProducts = new Set(["aqua-glitter-studs", "pressed-flower-drop-earrings"]);

  const defaultProducts = [
    {
      id: "aqua-shimmer-bookmark",
      name: "Aqua Shimmer Bookmark",
      price: 249,
      collection: "Bookmarks",
      artStyle: "resin-sparkle",
      image: "",
      badge: "Best seller",
      description: "Soft blush resin bookmark finished with an aqua shimmer tip and white tassel.",
      featured: true,
      active: true,
    },
    {
      id: "butterfly-confetti-bookmark",
      name: "Butterfly Confetti Bookmark",
      price: 259,
      collection: "Bookmarks",
      artStyle: "resin-confetti",
      image: "",
      badge: "New drop",
      description: "Translucent bookmark with pastel butterfly confetti, soft shimmer, and a tassel finish.",
      featured: true,
      active: true,
    },
    {
      id: "bookmark-glitter-set",
      name: "Bookmark Glitter Set",
      price: 899,
      collection: "Bookmarks",
      artStyle: "resin-confetti",
      image: "",
      badge: "Set of four",
      description: "A coordinated set of resin bookmarks in aqua shimmer, butterfly confetti, emerald glitter, and berry sparkle.",
      featured: true,
      active: true,
    },
    {
      id: "blue-evil-eye-bracelet",
      name: "Blue Evil Eye Bracelet",
      price: 399,
      collection: "Bracelets",
      artStyle: "resin-evil-eye",
      image: "",
      badge: "Protective charm",
      description: "Silver-tone bracelet centered with a vivid blue evil-eye charm for an everyday statement look.",
      featured: true,
      active: true,
    },
    {
      id: "pressed-petal-bracelet",
      name: "Pressed Petal Bracelet",
      price: 389,
      collection: "Bracelets",
      artStyle: "resin-petal",
      image: "",
      badge: "Soft luxe",
      description: "Oval bracelet with a preserved yellow petal detail set in a warm vintage-style frame.",
      featured: true,
      active: true,
    },
    {
      id: "mint-butterfly-bracelet",
      name: "Mint Butterfly Bracelet",
      price: 459,
      collection: "Bracelets",
      artStyle: "resin-butterfly",
      image: "",
      badge: "Adjustable",
      description: "Mint butterfly bracelet with bead accents and a soft gold adjustable chain.",
      featured: true,
      active: true,
    },
    {
      id: "floral-art-coaster-set",
      name: "Floral Art Coaster Set",
      price: 699,
      collection: "Home Decor",
      artStyle: "resin-bloom",
      image: "",
      badge: "Decor edit",
      description: "Pastel floral coasters styled with satin and blooms for a soft decorative tablescape.",
      featured: true,
      active: true,
    },
    {
      id: "baby-memory-plaque",
      name: "Baby Memory Plaque",
      price: 1499,
      collection: "Keepsakes",
      artStyle: "resin-blush",
      image: "",
      badge: "Custom favorite",
      description: "A blush keepsake plaque designed to preserve baby photos, tiny details, and special memories.",
      featured: true,
      active: true,
    },
    {
      id: "gold-diamond-studs",
      name: "Gold Diamond Studs",
      price: 349,
      collection: "Stud Bar",
      artStyle: "resin-gold",
      image: "",
      badge: "Party edit",
      description: "Glitter gold geometric studs shaped like diamonds for festive and evening styling.",
      featured: true,
      active: true,
    },
    {
      id: "aqua-glitter-studs",
      name: "Aqua Glitter Studs",
      price: 249,
      collection: "Stud Bar",
      artStyle: "resin-aqua",
      image: "",
      badge: "Daily wear",
      description: "Round aqua glitter studs that add sparkle without overpowering the rest of your look.",
      featured: false,
      active: true,
    },
    {
      id: "blush-butterfly-hoops",
      name: "Blush Butterfly Hoops",
      price: 429,
      collection: "Statement Earrings",
      artStyle: "resin-blush",
      image: "",
      badge: "Sweet edit",
      description: "Tiny blush butterfly charms hanging from crystal-lined hoops for a delicate feminine finish.",
      featured: false,
      active: true,
    },
    {
      id: "triple-heart-dangles",
      name: "Triple Heart Dangles",
      price: 399,
      collection: "Statement Earrings",
      artStyle: "resin-heart",
      image: "",
      badge: "Lightweight",
      description: "Three linked resin hearts in baby blue and cobalt, made for everyday cute styling.",
      featured: false,
      active: true,
    },
    {
      id: "oxidized-rose-jhumkas",
      name: "Oxidized Rose Jhumkas",
      price: 549,
      collection: "Statement Earrings",
      artStyle: "resin-ink",
      image: "",
      badge: "Fusion pick",
      description: "Oxidized jhumka earrings with preserved rose detailing for a bold handcrafted Indo-western look.",
      featured: false,
      active: true,
    },
    {
      id: "pressed-flower-drop-earrings",
      name: "Pressed Flower Drop Earrings",
      price: 389,
      collection: "Statement Earrings",
      artStyle: "resin-petal",
      image: "",
      badge: "Botanical",
      description: "Soft pink drop earrings with preserved floral pieces set in clear resin.",
      featured: false,
      active: true,
    },
    {
      id: "yellow-petal-stud-set",
      name: "Yellow Petal Pendant Set",
      price: 799,
      collection: "Pendant Sets",
      artStyle: "resin-petal",
      image: "",
      badge: "Set favorite",
      description: "Matching pendant and stud set with preserved yellow petals in vintage-inspired frames.",
      featured: false,
      active: true,
    },
    {
      id: "peacock-feather-pendant",
      name: "Peacock Feather Pendant",
      price: 499,
      collection: "Pendant Sets",
      artStyle: "resin-ink",
      image: "",
      badge: "Elegant",
      description: "Black and gold pendant with peacock-feather-inspired detailing for a regal handcrafted finish.",
      featured: false,
      active: true,
    },
    {
      id: "green-eye-pendant",
      name: "Green Eye Pendant",
      price: 429,
      collection: "Pendant Sets",
      artStyle: "resin-ocean",
      image: "",
      badge: "Statement",
      description: "Gold-tone necklace with a vivid green eye centerpiece designed for a surreal bold look.",
      featured: false,
      active: true,
    },
    {
      id: "pearl-heart-jewelry-set",
      name: "Pearl Heart Jewelry Set",
      price: 1199,
      collection: "Jewelry Sets",
      artStyle: "resin-heart",
      image: "",
      badge: "Gift set",
      description: "Coordinated necklace, bracelet, and earrings with pearl chains and tiny red-heart charms.",
      featured: false,
      active: true,
    },
    {
      id: "blue-iris-bracelet",
      name: "Blue Iris Bracelet",
      price: 399,
      collection: "Bracelets",
      artStyle: "resin-ocean",
      image: "",
      badge: "Bestseller",
      description: "Bracelet with a dramatic blue iris centerpiece for a clean, eye-catching minimal statement.",
      featured: false,
      active: true,
    },
  ];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeProduct(product) {
    const normalized = clone(product || {});
    const rawImages = Array.isArray(normalized.images) ? normalized.images : [];
    let images = rawImages
      .map((image) => String(image || "").trim())
      .filter(Boolean);

    if (!images.length && normalized.image) {
      images.push(String(normalized.image).trim());
    }

    if (
      images.length &&
      normalized.id &&
      defaultProductImages[normalized.id] &&
      images.every((image) => image.startsWith(generatedAssetPrefix))
    ) {
      images = [...defaultProductImages[normalized.id]];
    }

    if (!images.length && normalized.id && defaultProductImages[normalized.id]) {
      images = [...defaultProductImages[normalized.id]];
    }

    normalized.images = images;
    normalized.image = images[0] || "";

    if (
      normalized.id &&
      generatedFallbackHiddenProducts.has(normalized.id) &&
      images.length &&
      images.every((image) => image.startsWith(generatedAssetPrefix))
    ) {
      normalized.active = false;
    }

    if (normalized.id && clientReviewHiddenProducts.has(normalized.id)) {
      normalized.active = false;
    }

    return normalized;
  }

  function loadCatalog() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) {
        return clone(defaultProducts).map(normalizeProduct);
      }

      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.map(normalizeProduct) : clone(defaultProducts).map(normalizeProduct);
    } catch (error) {
      return clone(defaultProducts).map(normalizeProduct);
    }
  }

  function saveCatalog(products) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products.map(normalizeProduct)));
  }

  function resetCatalog() {
    localStorage.removeItem(STORAGE_KEY);
  }

  window.InhaleArtCatalog = {
    STORAGE_KEY,
    defaultProducts,
    loadCatalog,
    saveCatalog,
    resetCatalog,
  };
})();
