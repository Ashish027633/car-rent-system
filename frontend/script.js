// frontend/script.js

const API_URL = "http://localhost:5000";

// Sections & auth
const loginSection = document.getElementById("login-section");
const homeSection = document.getElementById("home-section");
const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");

const navItems = document.querySelectorAll(".nav-links li");
const sections = document.querySelectorAll(".section");

// Dashboard stats
const totalCarsEl = document.getElementById("total-cars");
const availableCarsEl = document.getElementById("available-cars");
const bookedCarsEl = document.getElementById("booked-cars");
const totalBookingsEl = document.getElementById("total-bookings");

// Filters & car list
const filterTypeSelect = document.getElementById("filter-type");
const filterAvailabilitySelect = document.getElementById("filter-availability");
const filterPriceSelect = document.getElementById("filter-price");
const searchInput = document.getElementById("search-input");
const carListContainer = document.getElementById("car-list");

// Booking form
const vehicleTypeSelect = document.getElementById("vehicle-type");
const carSelect = document.getElementById("car-select");
const bookingForm = document.getElementById("booking-form");
const bookingMessage = document.getElementById("booking-message");

// History table
const historyBody = document.getElementById("history-body");

// Admin
const adminCarsBody = document.getElementById("admin-cars-body");
const adminAddCarForm = document.getElementById("admin-add-car-form");
const adminMessage = document.getElementById("admin-message");

// Modals
const carModal = document.getElementById("car-modal");
const bookingToast = document.getElementById("booking-modal");
const modalCarName = document.getElementById("modal-car-name");
const modalCarCategory = document.getElementById("modal-car-category");
const modalCarDescription = document.getElementById("modal-car-description");
const modalCarType = document.getElementById("modal-car-type");
const modalCarAvailability = document.getElementById("modal-car-availability");
const modalCarRating = document.getElementById("modal-car-rating");
const modalCarPrice = document.getElementById("modal-car-price");
const modalBookBtn = document.getElementById("modal-book-btn");

// Toast text
const toastTitle = document.getElementById("toast-title");
const toastBody = document.getElementById("toast-body");

// Global state
let carsData = [];
let bookingsData = [];
let selectedCarForBooking = null;

// LOGIN
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginMessage.textContent = "";

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      loginMessage.textContent = data.message || "Login failed";
      return;
    }

    loginSection.classList.add("hidden");
    homeSection.classList.remove("hidden");

    await fetchCars();
    await fetchBookings();
  } catch (err) {
    console.error(err);
    loginMessage.textContent = "Error connecting to server";
  }
});

// NAVIGATION
navItems.forEach((item) => {
  item.addEventListener("click", () => {
    navItems.forEach((nav) => nav.classList.remove("active"));
    item.classList.add("active");

    const targetId = item.getAttribute("data-target");
    sections.forEach((sec) =>
      sec.classList.toggle("active-section", sec.id === targetId)
    );
  });
});

// FETCH DATA
async function fetchCars() {
  try {
    const res = await fetch(`${API_URL}/cars`);
    carsData = await res.json();
    renderCars();
    updateDashboard();
    updateCarSelect();
    renderAdminTable();
  } catch (err) {
    console.error("Error fetching cars:", err);
  }
}

async function fetchBookings() {
  try {
    const res = await fetch(`${API_URL}/bookings`);
    bookingsData = await res.json();
    renderBookings();
    updateDashboard();
  } catch (err) {
    console.error("Error fetching bookings:", err);
  }
}

// UPDATE DASHBOARD
function updateDashboard() {
  const total = carsData.length;
  const available = carsData.filter((c) => c.available).length;
  const booked = total - available;
  const totalBookings = bookingsData.length;

  totalCarsEl.textContent = total;
  availableCarsEl.textContent = available;
  bookedCarsEl.textContent = booked;
  totalBookingsEl.textContent = totalBookings;
}

// FILTER + SEARCH
function applyFilters() {
  const typeFilter = filterTypeSelect.value;
  const availabilityFilter = filterAvailabilitySelect.value;
  const priceFilter = filterPriceSelect.value;
  const query = searchInput.value.toLowerCase().trim();

  const [minPrice, maxPrice] =
    priceFilter === "all" ? [0, Infinity] : priceFilter.split("-").map(Number);

  return carsData.filter((car) => {
    if (typeFilter !== "all" && car.type !== typeFilter) return false;
    if (availabilityFilter === "available" && !car.available) return false;
    if (availabilityFilter === "unavailable" && car.available) return false;
    if (!(car.pricePerHour >= minPrice && car.pricePerHour <= maxPrice))
      return false;

    if (query) {
      const target = `${car.name} ${car.category || ""}`.toLowerCase();
      if (!target.includes(query)) return false;
    }

    return true;
  });
}

// RENDER CAR CARDS
function renderCars() {
  const filtered = applyFilters();
  carListContainer.innerHTML = "";

  if (filtered.length === 0) {
    carListContainer.innerHTML = "<p>No cars found for this filter.</p>";
    return;
  }

  filtered.forEach((car) => {
    const div = document.createElement("div");
    div.className = "car-card fade-in" + (car.isSport ? " sport" : "");

    const isAvailable = car.available;

    const icon =
      car.type === "2-wheeler"
        ? '<i class="fa-solid fa-motorcycle"></i>'
        : '<i class="fa-solid fa-car-side"></i>';

    div.innerHTML = `
      <div class="car-thumb">${icon}</div>
      <div class="car-main">
        <div class="car-header-row">
          <div>
            <div class="car-name">${car.name}</div>
            <div class="car-meta">${car.category || ""}</div>
          </div>
          <div class="car-price">₹${car.pricePerHour} <span class="car-meta">/ hour</span></div>
        </div>

        <div class="car-meta">
          <span class="badge type">${car.type}</span>
          <span class="badge ${isAvailable ? "available" : "unavailable"}">
            ${isAvailable ? "Available" : "Not Available"}
          </span>
          <span class="rating">★ ${car.rating?.toFixed(1) ?? "4.5"}</span>
        </div>

        <div class="car-actions">
          <button class="outline-btn" data-view-details="${car.id}">
            <i class="fa-solid fa-eye"></i> Details
          </button>
          <button class="outline-btn" data-demo-book="${car.id}" ${
      !isAvailable ? "disabled style='opacity:0.4;cursor:not-allowed;'" : ""
    }>
            <i class="fa-solid fa-calendar-check"></i> Demo Book
          </button>
        </div>
      </div>
    `;

    carListContainer.appendChild(div);
  });

  // Details
  carListContainer.querySelectorAll("[data-view-details]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.getAttribute("data-view-details"));
      const car = carsData.find((c) => c.id === id);
      if (car) openCarModal(car);
    });
  });

  // Demo booking
  carListContainer.querySelectorAll("[data-demo-book]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.getAttribute("data-demo-book"));
      const car = carsData.find((c) => c.id === id);
      if (car && car.available) {
        selectedCarForBooking = car;
        openCarModal(car);
      }
    });
  });
}

// RENDER BOOKING HISTORY
function renderBookings() {
  historyBody.innerHTML = "";

  if (bookingsData.length === 0) {
    historyBody.innerHTML = `<tr><td colspan="7">No bookings yet.</td></tr>`;
    return;
  }

  bookingsData.forEach((b, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>

      <td>
        ${b.fullname}
        <br><small>${b.phone}</small>
      </td>

      <td>${b.carName}</td>
      <td>${b.durationHours}</td>
      <td>₹${b.pricePerHour}</td>
      <td>₹${b.totalCost}</td>

      <td>
        ${b.date}
        <br><small>DL: ${b.license}</small>
      </td>
    `;
    historyBody.appendChild(tr);
  });
}

// CAR SELECT UPDATE
function updateCarSelect() {
  carSelect.innerHTML = '<option value="">Select car</option>';
  const selectedType = vehicleTypeSelect.value;
  if (!selectedType) return;

  const filtered = carsData.filter(
    (c) => c.type === selectedType && c.available
  );

  filtered.forEach((car) => {
    const option = document.createElement("option");
    option.value = car.id;
    option.textContent = `${car.name} (₹${car.pricePerHour}/hr)`;
    carSelect.appendChild(option);
  });

  if (selectedCarForBooking && selectedCarForBooking.type === selectedType) {
    carSelect.value = selectedCarForBooking.id;
  }
}

vehicleTypeSelect.addEventListener("change", updateCarSelect);

// BOOKING SUBMIT
bookingForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  bookingMessage.textContent = "";

  // Collect new fields
  const fullname = document.getElementById("fullname").value.trim();
  const license = document.getElementById("license").value.trim();
  const age = document.getElementById("age").value.trim();
  const address = document.getElementById("address").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const pickup = document.getElementById("pickup").value.trim();
  const drop = document.getElementById("drop").value.trim();

  const vehicleType = vehicleTypeSelect.value;
  const carId = parseInt(carSelect.value, 10);
  const durationHours = parseInt(document.getElementById("duration-hours").value, 10);

  if (
    !fullname || !license || !age || !address || !phone ||
    !pickup || !drop || !vehicleType ||
    !carId || !durationHours
  ) {
    bookingMessage.textContent = "Please fill all fields correctly.";
    bookingMessage.classList.add("error");
    bookingMessage.classList.remove("success");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        carId,
        fullname,
        license,
        age,
        address,
        phone,
        pickup,
        drop,
        durationHours,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      bookingMessage.textContent = data.message || "Booking failed";
      bookingMessage.classList.add("error");
      bookingMessage.classList.remove("success");
      return;
    }

    bookingMessage.textContent = `Booking successful! Total cost: ₹${data.booking.totalCost}`;
    bookingMessage.classList.add("success");
    bookingMessage.classList.remove("error");

    showToast(
      "Booking successful!",
      `${data.booking.fullname} booked ${data.booking.carName} for ${data.booking.durationHours} hour(s).`
    );

    bookingForm.reset();
    carSelect.innerHTML = '<option value="">Select car</option>';
    selectedCarForBooking = null;

    await fetchCars();
    await fetchBookings();
  } catch (err) {
    console.error(err);
    bookingMessage.textContent = "Error connecting to server";
    bookingMessage.classList.add("error");
    bookingMessage.classList.remove("success");
  }
});

// FILTER EVENTS
filterTypeSelect.addEventListener("change", renderCars);
filterAvailabilitySelect.addEventListener("change", renderCars);
filterPriceSelect.addEventListener("change", renderCars);
searchInput.addEventListener("input", renderCars);

// MODAL LOGIC
function openCarModal(car) {
  modalCarName.textContent = car.name;
  modalCarCategory.textContent = car.category || "";
  modalCarDescription.textContent =
    car.description || "No description available.";
  modalCarType.textContent = car.type;
  modalCarAvailability.textContent = car.available
    ? "Available"
    : "Not Available";
  modalCarAvailability.className =
    "badge " + (car.available ? "available" : "unavailable");
  modalCarRating.textContent = `★ ${car.rating?.toFixed(1) ?? "4.5"}`;
  modalCarPrice.textContent = `₹${car.pricePerHour}`;

  selectedCarForBooking = car;
  carModal.classList.remove("hidden");
}

function closeCarModal() {
  carModal.classList.add("hidden");
}

// Close modal
carModal.addEventListener("click", (e) => {
  if (e.target === carModal || e.target.hasAttribute("data-close-modal")) {
    closeCarModal();
  }
});

// Book from modal
modalBookBtn.addEventListener("click", () => {
  if (!selectedCarForBooking) return;

  navItems.forEach((nav) => {
    nav.classList.toggle(
      "active",
      nav.getAttribute("data-target") === "booking"
    );
  });

  sections.forEach((sec) =>
    sec.classList.toggle("active-section", sec.id === "booking")
  );

  vehicleTypeSelect.value = selectedCarForBooking.type;
  updateCarSelect();
  carSelect.value = selectedCarForBooking.id;

  closeCarModal();
});

// TOAST
let toastTimeout = null;

function showToast(title, body) {
  toastTitle.textContent = title;
  toastBody.textContent = body;
  bookingToast.classList.remove("hidden");

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    bookingToast.classList.add("hidden");
  }, 3500);
}

// ADMIN TABLE
function renderAdminTable() {
  adminCarsBody.innerHTML = "";

  carsData.forEach((car) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${car.id}</td>
      <td>${car.name}</td>
      <td>${car.type}</td>
      <td>₹${car.pricePerHour}</td>
      <td>${car.available ? "Available" : "Not Available"}</td>
      <td>
        <button class="outline-btn" data-toggle-car="${car.id}">Toggle</button>
      </td>
    `;

    adminCarsBody.appendChild(tr);
  });

  adminCarsBody.querySelectorAll("[data-toggle-car]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = Number(btn.getAttribute("data-toggle-car"));

      try {
        await fetch(`${API_URL}/toggle-availability`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ carId: id }),
        });

        await fetchCars();
      } catch (err) {
        console.error("Toggle error:", err);
      }
    });
  });
}

// ADMIN ADD CAR
adminAddCarForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  adminMessage.textContent = "";

  const name = document.getElementById("admin-car-name").value.trim();
  const type = document.getElementById("admin-type").value;
  const pricePerHour = Number(
    document.getElementById("admin-price").value.trim()
  );
  const category = document.getElementById("admin-category").value.trim();
  const description = document.getElementById("admin-description").value.trim();
  const isSport = document.getElementById("admin-is-sport").checked;

  if (!name || !type || !pricePerHour) {
    adminMessage.textContent = "Fill name, type and price.";
    adminMessage.classList.add("error");
    adminMessage.classList.remove("success");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/cars`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        type,
        pricePerHour,
        category,
        description,
        isSport,
        available: true,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      adminMessage.textContent = data.message || "Failed to add car.";
      adminMessage.classList.add("error");
      adminMessage.classList.remove("success");
      return;
    }

    adminMessage.textContent = "Car added (demo only, in-memory)!";
    adminMessage.classList.add("success");
    adminMessage.classList.remove("error");

    adminAddCarForm.reset();
    await fetchCars();
  } catch (err) {
    console.error(err);
    adminMessage.textContent = "Error connecting to server.";
    adminMessage.classList.add("error");
    adminMessage.classList.remove("success");
  }
});
