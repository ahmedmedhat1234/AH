const modelsGrid = document.getElementById("modelsGrid");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const modal = document.getElementById("modelModal");
const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalPrice = document.getElementById("modalPrice");
const modalDesc = document.getElementById("modalDesc");
const modalBuyNow = document.getElementById("modalBuyNow");
const modalAddToCart = document.getElementById("modalAddToCart");

const cartSidebar = document.getElementById("cartSidebar");
const cartToggle = document.getElementById("cartToggle");
const cartClose = document.getElementById("cartClose");
const cartItemsContainer = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotalAmount = document.getElementById("cartTotalAmount");
const checkoutBtn = document.getElementById("checkoutBtn");

const checkoutModal = document.getElementById("checkoutModal");
const checkoutForm = document.getElementById("checkoutForm");
const orderSummary = document.getElementById("orderSummary");

const WHATSAPP_NUMBER = "201202395265";
const PHONE_NUMBER = "+201202395265";
const DEFAULT_DESCRIPTION =
  "نجفة بتصميم أنيق يناسب المساحات المختلفة، خامات ممتازة وإضاءة مريحة.";

let models = [];
let filteredModels = [];
let cart = JSON.parse(localStorage.getItem("ah_cart")) || [];
let currentCheckoutMode = "cart"; // "cart" or "direct"
let directPurchaseModel = null;

const parsePrice = (price) => {
  const numeric = price.replace(/[^0-9]/g, "");
  return Number(numeric || 0);
};

const createWhatsappLink = (model) => {
  const message = `السلام عليكم، عايز أطلب موديل ${model.id} بسعر ${model.price}. هل متوفر؟`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

const updateCartUI = () => {
  localStorage.setItem("ah_cart", JSON.stringify(cart));
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;
  renderCart();
};

const addToCart = (model) => {
  const existingItem = cart.find((item) => item.id === model.id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: model.id,
      price: model.price,
      image: model.image,
      quantity: 1,
    });
  }
  updateCartUI();
  openCart();
};

const removeFromCart = (id) => {
  cart = cart.filter((item) => item.id !== id);
  updateCartUI();
};

const updateQuantity = (id, delta) => {
  const item = cart.find((item) => item.id === id);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      removeFromCart(id);
    } else {
      updateCartUI();
    }
  }
};

const renderCart = () => {
  cartItemsContainer.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="empty-state">السلة فارغة حالياً.</p>';
    cartTotalAmount.textContent = "0 ج.م";
    checkoutBtn.disabled = true;
    return;
  }

  checkoutBtn.disabled = false;
  cart.forEach((item) => {
    const priceNum = parsePrice(item.price);
    total += priceNum * item.quantity;

    const itemEl = document.createElement("div");
    itemEl.className = "cart-item";
    itemEl.innerHTML = `
      <img src="${item.image}" alt="${item.id}" class="cart-item-img" />
      <div class="cart-item-info">
        <div class="cart-item-title">${item.id}</div>
        <div class="cart-item-price">${item.price}</div>
        <div class="cart-item-actions">
          <div class="quantity-controls">
            <button class="qty-btn minus" data-id="${item.id}">-</button>
            <span class="qty-val">${item.quantity}</span>
            <button class="qty-btn plus" data-id="${item.id}">+</button>
          </div>
          <button class="remove-item" data-id="${item.id}">حذف</button>
        </div>
      </div>
    `;
    cartItemsContainer.appendChild(itemEl);
  });

  cartTotalAmount.textContent = `${total.toLocaleString()} ج.م`;

  // Add event listeners to cart buttons
  cartItemsContainer.querySelectorAll(".qty-btn.plus").forEach((btn) => {
    btn.addEventListener("click", () => updateQuantity(btn.dataset.id, 1));
  });
  cartItemsContainer.querySelectorAll(".qty-btn.minus").forEach((btn) => {
    btn.addEventListener("click", () => updateQuantity(btn.dataset.id, -1));
  });
  cartItemsContainer.querySelectorAll(".remove-item").forEach((btn) => {
    btn.addEventListener("click", () => removeFromCart(btn.dataset.id));
  });
};

const openCart = () => {
  cartSidebar.classList.add("open");
  document.body.style.overflow = "hidden";
};

const closeCart = () => {
  cartSidebar.classList.remove("open");
  document.body.style.overflow = "";
};

const renderModels = (data) => {
  modelsGrid.innerHTML = "";
  if (!data.length) {
    modelsGrid.innerHTML =
      '<p class="empty-state">لا توجد موديلات مطابقة لبحثك.</p>';
    return;
  }

  data.forEach((model, index) => {
    const card = document.createElement("div");
    card.className = "model-card reveal";
    card.style.transitionDelay = `${index * 0.05}s`;
    const discountBadge = model.discount ? `<div class="discount-badge">خصم ${model.discount}</div>` : '';
    const oldPriceHtml = model.originalPrice ? `<span class="original-price">${model.originalPrice}</span>` : '';
    
    card.innerHTML = `
      ${discountBadge}
      <img src="${model.image}" alt="${model.id}" loading="lazy" />
      <div class="model-body">
        <div class="model-title">${model.id}</div>
        <div class="price-container">
          <div class="model-price">${model.price}</div>
          ${oldPriceHtml}
        </div>
        <div class="model-actions">
          <button class="btn btn-primary" data-action="buy-now" aria-label="شراء ${model.id} الآن">
            <i class="fab fa-whatsapp"></i>
            شراء
          </button>
          <button class="btn btn-outline" data-action="add-to-cart" aria-label="إضافة ${model.id} للسلة">
            <i class="fas fa-cart-plus"></i>
            أضف للسلة
          </button>
          <button class="btn btn-outline" data-action="details" aria-label="عرض تفاصيل ${model.id}">
            <i class="fas fa-eye"></i>
            تفاصيل
          </button>
        </div>
      </div>
    `;

    card.querySelector('[data-action="details"]').addEventListener("click", (e) => {
      e.stopPropagation();
      openModal(model);
    });

    card.querySelector('[data-action="add-to-cart"]').addEventListener("click", (e) => {
      e.stopPropagation();
      addToCart(model);
    });

    card.querySelector('[data-action="buy-now"]').addEventListener("click", (e) => {
      e.stopPropagation();
      directPurchaseModel = model;
      currentCheckoutMode = "direct";
      renderOrderSummary();
      checkoutModal.classList.add("open");
      checkoutModal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    });

    card.addEventListener("click", (e) => {
      if (!e.target.closest(".model-actions")) {
        openModal(model);
      }
    });

    modelsGrid.appendChild(card);
  });

  observeReveals();
};

const applyFilters = () => {
  const searchValue = searchInput.value.trim().toLowerCase();
  filteredModels = models.filter((model) =>
    model.id.toLowerCase().includes(searchValue)
  );

  const sortValue = sortSelect.value;
  if (sortValue === "asc") {
    filteredModels.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
  } else if (sortValue === "desc") {
    filteredModels.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
  } else if (sortValue === "discount") {
    filteredModels.sort((a, b) => {
      const discountA = a.discount ? parseInt(a.discount) : 0;
      const discountB = b.discount ? parseInt(b.discount) : 0;
      return discountB - discountA;
    });
  }

  renderModels(filteredModels);
};

const openModal = (model) => {
  modalImage.src = model.image;
  modalImage.alt = model.id;
  modalTitle.textContent = model.id;
  const originalPriceHtml = model.originalPrice ? `<span class="modal-original-price">${model.originalPrice}</span>` : '';
  modalPrice.innerHTML = `${model.price} ${originalPriceHtml}`;
  modalDesc.textContent = model.description || DEFAULT_DESCRIPTION;

  // Update Buy Now button
  modalBuyNow.onclick = () => {
    directPurchaseModel = model;
    currentCheckoutMode = "direct";
    closeModal();
    renderOrderSummary();
    checkoutModal.classList.add("open");
    checkoutModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  // Update Add to Cart button
  modalAddToCart.onclick = () => {
    addToCart(model);
    closeModal();
  };

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
};

const closeModal = () => {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  if (!cartSidebar.classList.contains("open")) {
    document.body.style.overflow = "";
  }
};

const observeReveals = () => {
  const revealItems = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealItems.forEach((item) => observer.observe(item));
};

// Event Listeners
cartToggle.addEventListener("click", openCart);
cartClose.addEventListener("click", closeCart);

checkoutBtn.addEventListener("click", () => {
  closeCart();
  currentCheckoutMode = "cart";
  renderOrderSummary();
  checkoutModal.classList.add("open");
  checkoutModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
});

const renderOrderSummary = () => {
  orderSummary.innerHTML = "<h4>ملخص الطلب</h4>";
  let total = 0;
  let totalQty = 0;
  let itemsToDisplay = [];

  if (currentCheckoutMode === "direct" && directPurchaseModel) {
    // Direct purchase mode
    const priceNum = parsePrice(directPurchaseModel.price);
    total = priceNum;
    totalQty = 1;
    itemsToDisplay = [{
      id: directPurchaseModel.id,
      price: directPurchaseModel.price,
      quantity: 1
    }];
  } else {
    // Cart mode
    itemsToDisplay = cart;
    cart.forEach((item) => {
      totalQty += item.quantity;
      const priceNum = parsePrice(item.price);
      total += priceNum * item.quantity;
    });
  }

  itemsToDisplay.forEach((item) => {
    const priceNum = parsePrice(item.price);
    const itemTotal = priceNum * item.quantity;
    const summaryItem = document.createElement("div");
    summaryItem.className = "summary-item";
    summaryItem.innerHTML = `
      <span>${item.id} (×${item.quantity})</span>
      <span>${itemTotal.toLocaleString()} ج.م</span>
    `;
    orderSummary.appendChild(summaryItem);
  });

  const totalEl = document.createElement("div");
  totalEl.className = "summary-item";
  totalEl.style.fontWeight = "bold";
  totalEl.style.marginTop = "0.5rem";
  totalEl.style.borderTop = "1px solid #ddd";
  totalEl.style.paddingTop = "0.5rem";
  totalEl.innerHTML = `
    <span>الإجمالي</span>
    <span>${total.toLocaleString()} ج.م</span>
  `;
  orderSummary.appendChild(totalEl);
  document.getElementById("orderQuantity").value = totalQty;
};

checkoutForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("userName").value;
  const address = document.getElementById("userAddress").value;
  const phone = document.getElementById("userPhone").value;
  const qty = document.getElementById("orderQuantity").value;
  const phone2 = document.getElementById("userPhone2").value;
  const notes = document.getElementById("orderNotes").value;

  let itemsText = "";
  let total = 0;

  if (currentCheckoutMode === "direct" && directPurchaseModel) {
    // Direct purchase
    const priceNum = parsePrice(directPurchaseModel.price);
    total = priceNum;
    itemsText = `- ${directPurchaseModel.id}: 1 قطعة (${directPurchaseModel.price})`;
  } else {
    // Cart purchase
    itemsText = cart.map(item => `- ${item.id}: ${item.quantity} قطعة (${item.price})`).join("\n");
    total = cart.reduce((sum, item) => sum + (parsePrice(item.price) * item.quantity), 0);
  }

  const message = `طلب جديد من الموقع:
--------------------------
الاسم: ${name}
العنوان: ${address}
التليفون: ${phone}
الكمية الإجمالية: ${qty}
${phone2 ? `تليفون إضافي: ${phone2}` : ""}
--------------------------
المنتجات:
${itemsText}
--------------------------
الإجمالي: ${total.toLocaleString()} ج.م
${notes ? `\nملاحظات: ${notes}` : ""}
`;

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank");
  
  // Clear cart after order if it was a cart purchase
  if (currentCheckoutMode === "cart") {
    cart = [];
    updateCartUI();
  }
  
  // Clear form
  checkoutForm.reset();
  checkoutModal.classList.remove("open");
  document.body.style.overflow = "";
  alert("تم إرسال طلبك بنجاح عبر واتساب!");
});

// Modal event listeners
[modal, checkoutModal].forEach(m => {
  m.addEventListener("click", (event) => {
    if (event.target.dataset.close) {
      m.classList.remove("open");
      m.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
  });
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
    checkoutModal.classList.remove("open");
    closeCart();
  }
});

searchInput.addEventListener("input", applyFilters);
sortSelect.addEventListener("change", applyFilters);

// Load models from JSON
fetch("models.json")
  .then((response) => response.json())
  .then((data) => {
    models = data.map((model) => ({
      ...model,
      description: DEFAULT_DESCRIPTION,
    }));
    filteredModels = [...models];
    renderModels(filteredModels);
    updateCartUI();
  })
  .catch((error) => {
    console.error("Error loading models:", error);
    modelsGrid.innerHTML = '<p class="empty-state">تعذر تحميل الموديلات. الرجاء المحاولة لاحقًا.</p>';
  });
