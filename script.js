/*
  script.js
  This file adds the small INTERACTIONS on the homepage.

  It handles:
  1. The mobile menu (hamburger button)
  2. Highlighting the current section in the menu
  3. A subtle shadow on the header when you scroll
  4. Appointment booking (service picker, validation, reference, confirmation)
  5. My Bookings (view saved bookings and cancel them)
  6. The shopping bag (add, quantity, remove, total, localStorage)
  7. Checkout demonstration (details, validation, confirmation)
  8. Placeholder messages for the Log In / Create Account buttons
  9. Filling in the current year in the footer
*/

/* Wait until the HTML page has fully loaded before running our code. */
document.addEventListener("DOMContentLoaded", function () {

  /* ----------------------------------------------------------
     1. MOBILE MENU
     Find the button and the menu, then toggle the "open" class.
     ---------------------------------------------------------- */
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  menuToggle.addEventListener("click", function () {
    navLinks.classList.toggle("open");
    menuToggle.classList.toggle("active");

    // Accessibility: tell screen readers whether the menu is open.
    const isOpen = navLinks.classList.contains("open");
    menuToggle.setAttribute("aria-expanded", isOpen);
  });

  // Close the menu whenever a menu link is tapped.
  navLinks.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      navLinks.classList.remove("open");
      menuToggle.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ----------------------------------------------------------
     2. HIGHLIGHT THE CURRENT MENU LINK
     IntersectionObserver watches the sections and marks the
     matching link as "active" while that section is on screen.
     ---------------------------------------------------------- */
  const sections = document.querySelectorAll("main section[id]");
  const menuItems = navLinks.querySelectorAll('a[href^="#"]');

  const sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;

      menuItems.forEach(function (item) {
        item.classList.toggle(
          "active",
          item.getAttribute("href") === "#" + entry.target.id
        );
      });
    });
  }, { threshold: 0.3 });

  sections.forEach(function (section) {
    sectionObserver.observe(section);
  });

  /* ----------------------------------------------------------
     3. HEADER SHADOW ON SCROLL
     Add the "scrolled" class once the page moves down a bit.
     ---------------------------------------------------------- */
  const siteHeader = document.getElementById("siteHeader");

  window.addEventListener("scroll", function () {
    siteHeader.classList.toggle("scrolled", window.scrollY > 20);
  });

  /* ----------------------------------------------------------
     4. APPOINTMENT BOOKING SYSTEM (FRONTEND DEMONSTRATION)
     The form is checked here, then saved in the browser's own
     localStorage. Nothing is sent to the salon yet.
     ---------------------------------------------------------- */
  const BOOKINGS_KEY = "bloomGlowBookings";
  const bookingForm = document.getElementById("bookingForm");
  const formMessage = document.getElementById("formMessage");
  const serviceSelect = document.getElementById("service");
  const dateInput = document.getElementById("date");
  const timeSelect = document.getElementById("time");
  const servicePicker = document.getElementById("servicePicker");
  const bookingConfirmation = document.getElementById("bookingConfirmation");
  const bookingsEmpty = document.getElementById("bookingsEmpty");
  const bookingsList = document.getElementById("bookingsList");

  // One helper chooses the service no matter how the customer picked it:
  // a photo card, the dropdown, or a "Book this service" link.
  function selectService(name) {
    serviceSelect.value = name;
    servicePicker.querySelectorAll(".service-pick").forEach(function (card) {
      card.classList.toggle("selected", card.getAttribute("data-service") === name);
    });
  }

  // One listener handles all four photo cards (event delegation).
  servicePicker.addEventListener("click", function (event) {
    const card = event.target.closest(".service-pick");
    if (!card) return;
    selectService(card.getAttribute("data-service"));
  });

  // If the dropdown changes, highlight the matching photo card.
  serviceSelect.addEventListener("change", function () {
    selectService(serviceSelect.value);
  });

  // The service cards further up the page use the same helper.
  document.querySelectorAll(".book-service").forEach(function (link) {
    link.addEventListener("click", function () {
      selectService(link.getAttribute("data-service"));
    });
  });

  // Today's date as YYYY-MM-DD, using the LOCAL clock (not UTC).
  // Setting "min" stops the date picker from offering past days.
  function todayString() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return now.getFullYear() + "-" + month + "-" + day;
  }
  dateInput.min = todayString();

  // Turn "2026-12-25" into "Friday, 25 December 2026" for display.
  function prettyDate(dateText) {
    const parts = dateText.split("-");
    const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return date.toLocaleDateString(undefined, {
      weekday: "long", day: "numeric", month: "long", year: "numeric"
    });
  }

  // Turn "14:30" into "2:30 PM" for display.
  function prettyTime(timeText) {
    const parts = timeText.split(":");
    let hours = Number(parts[0]);
    const suffix = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // 0 becomes 12, 13 becomes 1
    return hours + ":" + parts[1] + " " + suffix;
  }

  // Read / write the saved demonstration bookings.
  function loadBookings() {
    try {
      const saved = localStorage.getItem(BOOKINGS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      return []; // storage might be blocked; the page still works
    }
  }

  let bookings = loadBookings();

  function saveBookings() {
    try {
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    } catch (error) {
      // Ignore: there is no database in this step.
    }
  }

  // Friendly checks, one message at a time.
  function bookingValidationMessage() {
    const name = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const date = dateInput.value;
    const time = timeSelect.value;

    if (!name) return "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email address.";
    if (phone.length < 7) return "Please enter a valid phone number.";
    if (!serviceSelect.value) return "Please choose a service.";
    if (!date) return "Please choose an appointment date.";
    if (date < todayString()) return "Please choose today or a future date.";
    if (!time) return "Please choose an appointment time.";
    return "";
  }

  // Small helper used when drawing each saved booking.
  function addDetail(parent, label, value) {
    const row = document.createElement("p");
    const strong = document.createElement("strong");
    strong.textContent = value;
    row.appendChild(document.createTextNode(label + ": "));
    row.appendChild(strong);
    parent.appendChild(row);
  }

  // Rebuild the "My Bookings" list from the saved array.
  function renderBookings() {
    bookingsList.innerHTML = ""; // clear old cards first

    bookings.forEach(function (booking) {
      const card = document.createElement("article");
      card.className = "booking-card";

      const top = document.createElement("div");
      top.className = "booking-card-top";

      const ref = document.createElement("span");
      ref.className = "booking-ref";
      ref.textContent = booking.reference;

      const cancel = document.createElement("button");
      cancel.type = "button";
      cancel.className = "cancel-booking";
      cancel.textContent = "Cancel";
      cancel.setAttribute("data-ref", booking.reference);
      cancel.setAttribute("aria-label", "Cancel booking " + booking.reference);

      top.appendChild(ref);
      top.appendChild(cancel);

      const title = document.createElement("h4");
      title.textContent = booking.service;

      const detail = document.createElement("div");
      detail.className = "booking-card-detail";
      addDetail(detail, "Name", booking.name);
      addDetail(detail, "Date", prettyDate(booking.date));
      addDetail(detail, "Time", prettyTime(booking.time));
      addDetail(detail, "Email", booking.email);
      addDetail(detail, "Phone", booking.phone);
      if (booking.notes) addDetail(detail, "Notes", booking.notes);

      card.appendChild(top);
      card.appendChild(title);
      card.appendChild(detail);
      bookingsList.appendChild(card);
    });

    // Show the empty message OR the list, never both.
    const isEmpty = bookings.length === 0;
    bookingsEmpty.hidden = !isEmpty;
    bookingsList.hidden = isEmpty;
  }

  bookingForm.addEventListener("submit", function (event) {
    event.preventDefault(); // stop the page reloading

    const error = bookingValidationMessage();
    if (error) {
      formMessage.textContent = error;
      return;
    }

    // Make one booking object. The reference uses the time plus a
    // random number, so two bookings are very unlikely to match.
    const booking = {
      reference: "BK-" + Date.now().toString().slice(-6) + "-" +
                 Math.floor(Math.random() * 900 + 100),
      name: document.getElementById("fullName").value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      service: serviceSelect.value,
      date: dateInput.value,
      time: timeSelect.value,
      notes: document.getElementById("notes").value.trim()
    };

    bookings.unshift(booking); // newest booking first
    saveBookings();
    renderBookings();

    // Fill in the pretty confirmation card.
    document.getElementById("bookConfirmName").textContent = booking.name.split(" ")[0];
    document.getElementById("bookConfirmService").textContent = booking.service;
    document.getElementById("bookConfirmDate").textContent = prettyDate(booking.date);
    document.getElementById("bookConfirmTime").textContent = prettyTime(booking.time);
    document.getElementById("bookConfirmRef").textContent = booking.reference;

    formMessage.textContent = "";
    bookingForm.reset();
    selectService(""); // clear the photo highlight too
    bookingConfirmation.hidden = false;
    bookingConfirmation.scrollIntoView({ behavior: "smooth" });
    showToast("Demonstration booking saved! Reference " + booking.reference + " 💐");
  });

  // One listener cancels any booking by reading its reference number.
  bookingsList.addEventListener("click", function (event) {
    const button = event.target.closest(".cancel-booking");
    if (!button) return;

    const ref = button.getAttribute("data-ref");
    bookings = bookings.filter(function (item) { return item.reference !== ref; });
    saveBookings();
    renderBookings();
    showToast("Booking " + ref + " was cancelled.");
  });

  // "Book Another" hides the confirmation and returns to the form.
  document.getElementById("bookAnotherBtn").addEventListener("click", function () {
    bookingConfirmation.hidden = true;
    document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
  });

  renderBookings(); // draw any saved bookings when the page opens

  /* ----------------------------------------------------------
     6. SHOPPING BAG
     The bag is an array of products. Each product remembers its
     name, price, picture and quantity. We save the array in
     localStorage so it is still there after a page refresh.
     ---------------------------------------------------------- */
  const STORAGE_KEY = "bloomGlowCart";
  const cartItemsEl = document.getElementById("cartItems");
  const cartEmptyEl = document.getElementById("cartEmpty");
  const cartSummaryEl = document.getElementById("cartSummary");
  const cartTotalEl = document.getElementById("cartTotal");
  const cartCountEl = document.getElementById("cartCount");
  const cartToast = document.getElementById("cartToast");

  // Read the saved bag. If nothing is saved, begin with an empty one.
  function loadCart() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      return []; // storage may be blocked; the bag still works this visit
    }
  }

  let cart = loadCart();

  // Write the current bag back into the browser's storage.
  function saveCart() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      // Ignore: no database or backend is used in this step.
    }
  }

  // "$28.00" -> 28, so we can do maths with the price.
  function priceToNumber(text) {
    return parseFloat(text.replace(/[^0-9.]/g, ""));
  }

  // 28 -> "$28.00", for neat display.
  function formatMoney(value) {
    return "$" + value.toFixed(2);
  }

  // A small helper that builds a button and labels it for screen readers.
  function makeButton(className, text, action, name, label) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = className;
    btn.textContent = text;
    btn.setAttribute("data-action", action);
    btn.setAttribute("data-name", name);
    btn.setAttribute("aria-label", label + " " + name);
    return btn;
  }

  // Redraw the whole bag on the page and update the navbar badge.
  function renderCart() {
    cartItemsEl.innerHTML = "";   // clear the old rows first
    let total = 0;
    let count = 0;

    cart.forEach(function (item) {
      total += item.price * item.qty;
      count += item.qty;

      const row = document.createElement("div");
      row.className = "cart-item";

      // Product photo.
      const img = document.createElement("img");
      img.src = item.image;
      img.alt = item.name;
      row.appendChild(img);

      // Product name, price and Remove link.
      const info = document.createElement("div");
      info.className = "cart-item-info";

      const title = document.createElement("h4");
      title.textContent = item.name;

      const unit = document.createElement("p");
      unit.className = "cart-item-price";
      unit.textContent = formatMoney(item.price) + " each";

      info.appendChild(title);
      info.appendChild(unit);
      info.appendChild(makeButton("remove-btn", "Remove", "remove", item.name, "Remove"));
      row.appendChild(info);

      // Quantity buttons and the line total.
      const actions = document.createElement("div");
      actions.className = "cart-item-actions";

      const qty = document.createElement("div");
      qty.className = "qty-controls";
      qty.appendChild(makeButton("qty-btn", "−", "decrease", item.name, "Decrease quantity of"));

      const value = document.createElement("span");
      value.className = "qty-value";
      value.textContent = item.qty;
      qty.appendChild(value);

      qty.appendChild(makeButton("qty-btn", "+", "increase", item.name, "Increase quantity of"));

      const lineTotal = document.createElement("p");
      lineTotal.className = "cart-item-total";
      lineTotal.textContent = formatMoney(item.price * item.qty);

      actions.appendChild(qty);
      actions.appendChild(lineTotal);
      row.appendChild(actions);

      cartItemsEl.appendChild(row);
    });

    cartTotalEl.textContent = formatMoney(total);
    cartCountEl.textContent = count;

    // Show the empty message OR the items, never both.
    const isEmpty = cart.length === 0;
    cartEmptyEl.hidden = !isEmpty;
    cartItemsEl.hidden = isEmpty;
    cartSummaryEl.hidden = isEmpty;
  }

  // Add a product. If it is already in the bag, just add 1 to its quantity.
  function addToCart(product) {
    const existing = cart.find(function (item) {
      return item.name === product.name;
    });

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        name: product.name,
        price: product.price,
        image: product.image,
        qty: 1
      });
    }

    saveCart();
    renderCart();
  }

  // A friendly pop-up message that disappears by itself.
  let toastTimer;
  function showToast(message) {
    cartToast.textContent = message;
    cartToast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      cartToast.classList.remove("show");
    }, 2500);
  }

  // The four "Add to Bag" buttons read their details from the product card.
  document.querySelectorAll(".add-to-bag").forEach(function (button) {
    button.addEventListener("click", function () {
      const card = button.closest(".product-card");
      const product = {
        name: card.querySelector("h3").textContent,
        price: priceToNumber(card.querySelector(".price").textContent),
        image: card.querySelector("img").getAttribute("src")
      };

      addToCart(product);
      showToast(product.name + " added to your bag 🌸");
    });
  });

  // One listener handles ALL quantity and remove buttons in the bag.
  // We check which button was clicked by reading its data-action.
  cartItemsEl.addEventListener("click", function (event) {
    const btn = event.target.closest("button[data-action]");
    if (!btn) return;

    const name = btn.getAttribute("data-name");
    const item = cart.find(function (i) { return i.name === name; });
    if (!item) return;

    const action = btn.getAttribute("data-action");

    if (action === "increase") {
      item.qty += 1;
    } else if (action === "decrease") {
      item.qty -= 1;
    }

    // Remove the row if Remove was clicked, or if quantity reached zero.
    if (action === "remove" || item.qty <= 0) {
      cart = cart.filter(function (i) { return i.name !== name; });
    }

    saveCart();
    renderCart();
  });

  renderCart(); // draw the bag when the page first opens

  /* ----------------------------------------------------------
     6b. CHECKOUT (FRONTEND DEMONSTRATION ONLY)
     No payment is processed and no order is sent to a server.
     ---------------------------------------------------------- */
  const checkoutSection = document.getElementById("checkout");
  const checkoutPanel = document.getElementById("checkoutPanel");
  const checkoutForm = document.getElementById("checkoutForm");
  const checkoutItemsEl = document.getElementById("checkoutItems");
  const checkoutTotalEl = document.getElementById("checkoutTotal");
  const checkoutError = document.getElementById("checkoutError");
  const confirmationEl = document.getElementById("orderConfirmation");

  // Show the same products from the bag inside the order summary.
  function renderCheckoutSummary() {
    checkoutItemsEl.innerHTML = "";
    let total = 0;

    cart.forEach(function (item) {
      total += item.price * item.qty;

      const row = document.createElement("div");
      row.className = "checkout-item";

      const info = document.createElement("div");
      const name = document.createElement("p");
      name.className = "checkout-item-name";
      name.textContent = item.name;
      const qty = document.createElement("p");
      qty.className = "checkout-item-qty";
      qty.textContent = "Qty " + item.qty + " × " + formatMoney(item.price);
      info.appendChild(name);
      info.appendChild(qty);

      const price = document.createElement("p");
      price.className = "checkout-item-price";
      price.textContent = formatMoney(item.price * item.qty);

      row.appendChild(info);
      row.appendChild(price);
      checkoutItemsEl.appendChild(row);
    });

    checkoutTotalEl.textContent = formatMoney(total);
  }

  // The Checkout button in the bag calls this function.
  function openCheckout() {
    if (cart.length === 0) {
      showToast("Your bag is empty — add a product first 🌸");
      return;
    }

    renderCheckoutSummary();
    checkoutError.textContent = "";
    confirmationEl.hidden = true;
    checkoutPanel.hidden = false;
    checkoutSection.hidden = false;
    checkoutSection.scrollIntoView({ behavior: "smooth" });
  }

  document.getElementById("checkoutBtn").addEventListener("click", openCheckout);

  // Friendly checks before an order is accepted.
  function checkoutValidationMessage() {
    const name = document.getElementById("checkoutName").value.trim();
    const email = document.getElementById("checkoutEmail").value.trim();
    const phone = document.getElementById("checkoutPhone").value.trim();
    const address = document.getElementById("checkoutAddress").value.trim();
    const payment = checkoutForm.querySelector('input[name="payment"]:checked');

    if (!name) return "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email address.";
    if (phone.length < 7) return "Please enter a valid phone number.";
    if (!address) return "Please enter your delivery address.";
    if (!payment) return "Please choose a payment method.";
    return "";
  }

  checkoutForm.addEventListener("submit", function (event) {
    event.preventDefault(); // stop the page reloading

    const error = checkoutValidationMessage();
    if (error) {
      checkoutError.textContent = error;
      return;
    }

    // Take a snapshot of the order BEFORE emptying the bag.
    const name = document.getElementById("checkoutName").value.trim();
    const payment = checkoutForm.querySelector('input[name="payment"]:checked').value;
    const itemCount = cart.reduce(function (sum, item) { return sum + item.qty; }, 0);
    const total = cart.reduce(function (sum, item) { return sum + item.price * item.qty; }, 0);
    const totalText = formatMoney(total);

    // A simple unique reference made from the time plus a random number.
    const reference = "BG-" + Date.now().toString().slice(-6) + "-" +
                      Math.floor(Math.random() * 900 + 100);

    document.getElementById("confirmName").textContent = name.split(" ")[0];
    document.getElementById("orderReference").textContent = reference;
    document.getElementById("confirmationDetail").textContent =
      itemCount + " item" + (itemCount === 1 ? "" : "s") +
      " · " + totalText + " · " + payment + ".";

    // Only after a valid order do we clear the bag.
    cart = [];
    saveCart();
    renderCart();

    checkoutError.textContent = ""; // clear any old validation message
    checkoutPanel.hidden = true;
    confirmationEl.hidden = false;
    confirmationEl.scrollIntoView({ behavior: "smooth" });
    showToast("Order placed! Reference " + reference + " 🎉");
  });

  /* ----------------------------------------------------------
     7. LOGIN / REGISTER PLACEHOLDERS
     These buttons will open real pages once we build accounts.
     ---------------------------------------------------------- */
  document.getElementById("loginBtn").addEventListener("click", function () {
    alert("Log in page is coming soon! 👗");
  });

  document.getElementById("registerBtn").addEventListener("click", function () {
    alert("Registration page is coming soon! ✨");
  });

  /* ----------------------------------------------------------
     8. CURRENT YEAR IN THE FOOTER
     Keeps the copyright date correct automatically.
     ---------------------------------------------------------- */
  document.getElementById("year").textContent = new Date().getFullYear();

});
