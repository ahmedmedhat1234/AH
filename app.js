const modelsGrid = document.getElementById("modelsGrid");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const modal = document.getElementById("modelModal");
const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalPrice = document.getElementById("modalPrice");
const modalWhatsapp = document.getElementById("modalWhatsapp");

const WHATSAPP_NUMBER = "201202395265";
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

  data.forEach((model) => {
    const card = document.createElement("div");
    card.className = "model-card reveal";
    card.innerHTML = `
      <img src="${model.image}" alt="${model.id}" loading="lazy" />
      <div class="model-body">
        <div class="model-title">${model.id}</div>
        <div class="model-price">${model.price}</div>
        <div class="model-actions">
          <button class="btn btn-outline" data-action="details">تفاصيل</button>
          <a class="btn btn-whatsapp" href="${createWhatsappLink(model)}" target="_blank" rel="noopener">
            اطلب على واتساب
          </a>
        </div>
      </div>
    `;

    card.querySelector('[data-action="details"]').addEventListener("click", () => {
      openModal(model);
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
  }

  renderModels(filteredModels);
};

const openModal = (model) => {
  modalImage.src = model.image;
  modalImage.alt = model.id;
  modalTitle.textContent = model.id;
  modalPrice.textContent = model.price;
  modalWhatsapp.href = createWhatsappLink(model);
  modalWhatsapp.setAttribute("aria-label", `اطلب ${model.id} عبر واتساب`);
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
};

const closeModal = () => {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
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

fetch("models.json")
  .then((response) => response.json())
  .then((data) => {
    models = data.map((model) => ({
      ...model,
      description: DEFAULT_DESCRIPTION,
    }));
    filteredModels = [...models];
    renderModels(filteredModels);
  })
  .catch(() => {
    modelsGrid.innerHTML =
      '<p class="empty-state">تعذر تحميل الموديلات. الرجاء المحاولة لاحقًا.</p>';
  });
