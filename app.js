const vehicles = [
  {
    id: 1,
    plate: "34 ABC 123",
    driver: "Kadir Yılmaz",
    shipmentNo: "SH-2026-0841",
    queueNo: "01",
    status: "waiting",
    grossWeight: null,
    tareWeight: null,
    netWeight: null,
    calledAt: null,
    unloadingStartedAt: null,
    unloadingCompletedAt: null,
    completedAt: null,
    waitingMinutes: 25,
    detail: "Polat Gıda / Çimento yükü / 60 ton kapasite"
  },
  {
    id: 2,
    plate: "06 DEF 456",
    driver: "Mehmet Arslan",
    shipmentNo: "SH-2026-0842",
    queueNo: "02",
    status: "waiting",
    grossWeight: null,
    tareWeight: null,
    netWeight: null,
    calledAt: null,
    unloadingStartedAt: null,
    unloadingCompletedAt: null,
    completedAt: null,
    waitingMinutes: 18,
    detail: "Köseoğlu Madencilik / Kırma taş / 34 ton"
  },
  {
    id: 3,
    plate: "16 GHI 789",
    driver: "Salih Çelik",
    shipmentNo: "SH-2026-0843",
    queueNo: "03",
    status: "scale",
    grossWeight: null,
    tareWeight: null,
    netWeight: null,
    calledAt: null,
    unloadingStartedAt: null,
    unloadingCompletedAt: null,
    completedAt: null,
    waitingMinutes: 8,
    detail: "Marmara Çimento / Kum / 48 ton"
  },
  {
    id: 4,
    plate: "23 JKL 012",
    driver: "Bora Akgül",
    shipmentNo: "SH-2026-0844",
    queueNo: "04",
    status: "unloading",
    grossWeight: null,
    tareWeight: null,
    netWeight: null,
    calledAt: null,
    unloadingStartedAt: null,
    unloadingCompletedAt: null,
    completedAt: null,
    waitingMinutes: 11,
    detail: "Ege Döküm / Çakıl / 52 ton"
  },
  {
    id: 5,
    plate: "41 MNO 345",
    driver: "Hakan Demir",
    shipmentNo: "SH-2026-0845",
    queueNo: "05",
    status: "waiting",
    grossWeight: null,
    tareWeight: null,
    netWeight: null,
    calledAt: null,
    unloadingStartedAt: null,
    unloadingCompletedAt: null,
    completedAt: null,
    waitingMinutes: 32,
    detail: "Deniz Madencilik / Kum / 41 ton"
  },
  {
    id: 6,
    plate: "58 PQR 678",
    driver: "Emre Uçar",
    shipmentNo: "SH-2026-0846",
    queueNo: "06",
    status: "waiting",
    grossWeight: null,
    tareWeight: null,
    netWeight: null,
    calledAt: null,
    unloadingStartedAt: null,
    unloadingCompletedAt: null,
    completedAt: null,
    waitingMinutes: 40,
    detail: "Yıldız Agrega / Çimento / 64 ton"
  }
];

const statusMap = {
  onTheWay: { label: "Yolda", badge: "on-the-way" },
  waiting: { label: "Sırada", badge: "waiting" },
  calledToScale: { label: "Kantara Çağrıldı", badge: "called-to-scale" },
  scale: { label: "Kantarda", badge: "scale" },
  unloading: { label: "Boşaltımda", badge: "unloading" },
  unloadingCompleted: {
    label: "Boşaltım Tamamlandı",
    badge: "unloading-completed"
  },
  completed: { label: "Tamamlandı", badge: "completed" }
};

const pageMeta = {
  overview: {
    title: "Genel Bakış",
    subtitle: "Hammadde kabul operasyonlarının güncel durumu."
  },
  queue: {
    title: "Araç Sırası",
    subtitle: "Kabul ve boşaltım sırasındaki araçlar."
  },
  scale: {
    title: "Kantar ve Tartım",
    subtitle: "Kantarda tartım yapan araçların takibi."
  },
  unloading: {
    title: "Boşaltım İşlemleri",
    subtitle: "Boşaltım aşamasındaki araçların işlemleri."
  },
  completed: {
    title: "Tamamlanan İşlemler",
    subtitle: "Bu vardiyada tamamlanan kabul işlemleri."
  }
};

const currentDateEl = document.querySelector("#current-date");
const breadcrumbCurrent = document.querySelector("#breadcrumb-current");
const pageTitle = document.querySelector("#page-title");
const pageSubtitle = document.querySelector("#page-subtitle");
const tableBody = document.querySelector("#vehicle-table-body");
const emptyState = document.querySelector("#empty-state");
const searchInput = document.querySelector("#search-input");
const filterButton = document.querySelector("#filter-button");
const filterCount = document.querySelector("#filter-count");
const summaryLabel = document.querySelector("#table-summary");
const lastUpdated = document.querySelector("#last-updated");
const navItems = document.querySelectorAll(".nav-item");
const tabButtons = document.querySelectorAll(".tab-button");

let selectedFilter = "all";
let searchQuery = "";

function setTodayDate() {
  const now = new Date();
  const formatted = new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    weekday: "long"
  }).format(now);

  currentDateEl.textContent = formatted;
}

function updateCounts() {
  const waitingCount = vehicles.filter((vehicle) => vehicle.status === "waiting").length;
  const scaleCount = vehicles.filter((vehicle) => vehicle.status === "scale").length;
  const unloadingCount = vehicles.filter((vehicle) => vehicle.status === "unloading").length;
  const completedCount = 2;

  document.querySelector("#waiting-count").textContent = waitingCount;
  document.querySelector("#scale-count").textContent = scaleCount;
  document.querySelector("#unloading-count").textContent = unloadingCount;
  document.querySelector("#completed-count").textContent = completedCount;

  document.querySelector("#all-tab-count").textContent = vehicles.length;
  document.querySelector("#waiting-tab-count").textContent = waitingCount;
  document.querySelector("#scale-tab-count").textContent = scaleCount;
  document.querySelector("#unloading-tab-count").textContent = unloadingCount;
  document.querySelector("#queue-nav-count").textContent = waitingCount;
}

function getVisibleVehicles() {
  const searchText = searchQuery.trim().toLocaleLowerCase("tr-TR");

  return vehicles.filter((vehicle) => {
    const matchesStatus = selectedFilter === "all" || vehicle.status === selectedFilter;
    const matchesSearch =
      !searchText ||
      vehicle.plate.toLocaleLowerCase("tr-TR").includes(searchText) ||
      vehicle.driver.toLocaleLowerCase("tr-TR").includes(searchText) ||
      vehicle.shipmentNo.toLocaleLowerCase("tr-TR").includes(searchText);

    return matchesStatus && matchesSearch;
  });
}

function renderTable() {
  const visibleVehicles = getVisibleVehicles();

  if (!visibleVehicles.length) {
    tableBody.innerHTML = "";
    emptyState.hidden = false;
    summaryLabel.textContent = "0 araç gösteriliyor";
    return;
  }

  emptyState.hidden = true;
  tableBody.innerHTML = visibleVehicles
    .map((vehicle) => {
      const status = statusMap[vehicle.status];
      return `
        <tr>
          <td>${vehicle.plate}</td>
          <td>${vehicle.driver}</td>
          <td>${vehicle.shipmentNo}</td>
          <td>${vehicle.queueNo}</td>
          <td><span class="status-badge ${status.badge}">${status.label}</span></td>
          <td>Yaklaşık ${vehicle.waitingMinutes} dk</td>
          <td><button class="table-action" type="button" data-vehicle-id="${vehicle.id}">Detay</button></td>
        </tr>
      `;
    })
    .join("");

  summaryLabel.textContent = `${visibleVehicles.length} araç gösteriliyor`;
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("is-visible");

  setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2200);
}

function openVehicleModal(vehicleId) {
  const vehicle = vehicles.find((item) => item.id === Number(vehicleId));
  const modalBackdrop = document.querySelector("#modal-backdrop");
  const modalContent = document.querySelector("#modal-content");
  const modalActions = document.querySelector("#modal-actions");

  if (!vehicle) return;

  modalContent.innerHTML = `
    <div class="detail-grid">
      <div>
        <p class="eyebrow">PLAKA</p>
        <h3>${vehicle.plate}</h3>
      </div>
      <div>
        <p class="eyebrow">ŞOFÖR</p>
        <h3>${vehicle.driver}</h3>
      </div>
      <div>
        <p class="eyebrow">SEVKİYAT NO</p>
        <h3>${vehicle.shipmentNo}</h3>
      </div>
      <div>
        <p class="eyebrow">MEVCUT DURUM</p>
        <h3>${statusMap[vehicle.status].label}</h3>
      </div>
    </div>
    <p class="detail-note"><strong>Not:</strong> ${vehicle.detail}</p>
  <section class="document-gallery" aria-label="Demo belge görselleri">
  <article>
    <h3>Kimlik — DEMO</h3>
    <img
      src="assets/demo/identity-sample.svg"
      alt="Gerçek olmayan örnek kimlik görseli"
    />
  </article>
  <article>
    <h3>Ruhsat — DEMO</h3>
    <img
      src="assets/demo/registration-sample.svg"
      alt="Gerçek olmayan örnek ruhsat görseli"
    />
  </article>
</section>`;

  modalActions.innerHTML = `
    <button class="primary-button" type="button" data-action="accept">İşi Başlat</button>
    <button class="filter-button" type="button" data-action="cancel">Kapat</button>
  `;

  modalBackdrop.hidden = false;
}

function closeModal() {
  const modalBackdrop = document.querySelector("#modal-backdrop");
  modalBackdrop.hidden = true;
}

function setFilter(filter) {
  selectedFilter = filter;
  tabButtons.forEach((button) => {
    const isSelected = button.dataset.filter === filter;
    button.classList.toggle("is-selected", isSelected);
  });

  renderTable();
}

function setPageView(viewName) {
  const currentMeta = pageMeta[viewName] || pageMeta.overview;
  pageTitle.textContent = currentMeta.title;
  pageSubtitle.textContent = currentMeta.subtitle;
  breadcrumbCurrent.textContent = currentMeta.title;

  navItems.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === viewName);
  });
}

navItems.forEach((button) => {
  button.addEventListener("click", () => {
    setPageView(button.dataset.view);
    if (button.dataset.view === "queue") {
      selectedFilter = "all";
      setFilter("all");
    }
  });
});

tabButtons.forEach((button) => {
  button.addEventListener("click", () => setFilter(button.dataset.filter));
});

searchInput.addEventListener("input", (event) => {
  searchQuery = event.target.value;
  renderTable();
});

filterButton.addEventListener("click", () => {
  const nextValue = filterCount.hidden ? "1" : "0";
  filterCount.hidden = nextValue === "0";
  filterCount.textContent = nextValue;
  filterButton.setAttribute("aria-expanded", String(nextValue === "1"));
  showToast(nextValue === "1" ? "Filtre aktif." : "Filtre kapatıldı.");
});

document.addEventListener("click", (event) => {
  const actionButton = event.target.closest(".table-action");
  if (actionButton) {
    openVehicleModal(actionButton.dataset.vehicleId);
    return;
  }

  const closeTrigger = event.target.closest("#modal-close");
  if (closeTrigger) {
    closeModal();
    return;
  }

  const action = event.target.closest("[data-action]");
  if (action) {
    const actionName = action.dataset.action;
    if (actionName === "cancel") {
      closeModal();
    }
    if (actionName === "accept") {
      showToast("İşlem başlatıldı.");
      closeModal();
    }
  }

  const backdrop = event.target.closest("#modal-backdrop");
  if (backdrop && event.target === backdrop) {
    closeModal();
  }
});

document.querySelector("#add-vehicle-button").addEventListener("click", () => {
  showToast("Yeni araç kaydı için form hazırlanıyor.");
});

setTodayDate();
updateCounts();
renderTable();
setPageView("overview");
lastUpdated.textContent = "az önce";
