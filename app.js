const modelsGrid = document.getElementById("modelsGrid");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const modal = document.getElementById("modelModal");
const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalPrice = document.getElementById("modalPrice");
const modalDesc = document.getElementById("modalDesc");
const modalWhatsapp = document.getElementById("modalWhatsapp");
const modalCall = document.getElementById("modalCall");

const WHATSAPP_NUMBER = "201202395265";
const PHONE_NUMBER = "+201202395265";
const DEFAULT_DESCRIPTION =
  "نجفة بتصميم أنيق يناسب المساحات المختلفة، خامات ممتازة وإضاءة مريحة.";

let models = [];
let filteredModels = [];

const parsePrice = (price) => {
  const numeric = price.replace(/[^0-9]/g, "");
  return Number(numeric || 0);
};

const createWhatsappLink = (model) => {
  const message = `السلام عليكم، عايز أطلب موديل ${model.id} بسعر ${model.price}. هل متوفر؟`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
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
    const originalPriceHtml = model.originalPrice ? `<span class="original-price">${model.originalPrice}</span>` : '';
    
    card.innerHTML = `
      ${discountBadge}
      <img src="${model.image}" alt="${model.id}" loading="lazy" />
      <div class="model-body">
        <div class="model-title">${model.id}</div>
        <div class="price-container">
          <div class="model-price">${model.price}</div>
          ${originalPriceHtml}
        </div>
        <div class="model-actions">
          <button class="btn btn-outline" data-action="details" aria-label="عرض تفاصيل ${model.id}">
            <i class="fas fa-eye"></i>
            تفاصيل
          </button>
          <a class="btn btn-whatsapp" href="${createWhatsappLink(model)}" target="_blank" rel="noopener" aria-label="طلب ${model.id} عبر واتساب">
            <i class="fab fa-whatsapp"></i>
            اطلب
          </a>
        </div>
      </div>
    `;

    card.querySelector('[data-action="details"]').addEventListener("click", () => {
      openModal(model);
    });

    // Make the entire card clickable to open modal
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
  modalWhatsapp.href = createWhatsappLink(model);
  modalCall.href = `tel:${PHONE_NUMBER}`;
  modalWhatsapp.setAttribute("aria-label", `اطلب ${model.id} عبر واتساب`);
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  
  // Prevent body scroll when modal is open
  document.body.style.overflow = "hidden";
};

const closeModal = () => {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  
  // Re-enable body scroll
  document.body.style.overflow = "";
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

// Modal event listeners
modal.addEventListener("click", (event) => {
  if (event.target.dataset.close) {
    closeModal();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("open")) {
    closeModal();
  }
});

searchInput.addEventListener("input", applyFilters);
sortSelect.addEventListener("change", applyFilters);

// Smooth scroll behavior for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#' && document.querySelector(href)) {
      e.preventDefault();
      const target = document.querySelector(href);
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Load models from JSON
fetch("models.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    models = data.map((model) => ({
      ...model,
      description: DEFAULT_DESCRIPTION,
    }));
    filteredModels = [...models];
    renderModels(filteredModels);
  })
  .catch((error) => {
    console.error("Error loading models:", error);
    modelsGrid.innerHTML =
      '<p class="empty-state">تعذر تحميل الموديلات. الرجاء المحاولة لاحقًا.</p>';
  });

// Lazy loading optimization
if ("IntersectionObserver" in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src || img.src;
        observer.unobserve(img);
      }
    });
  });

  document.querySelectorAll("img[data-src]").forEach(img => imageObserver.observe(img));
}
