// =====================================================
// SETTINGS: the only place you need to edit to make this site your own
// =====================================================
const CONFIG = {
  businessName: "GlowNest Studio",
 
  // STEP 1: REPLACE THE PLACEHOLDER PHONE NUMBER HERE
  // Format: country code + number, digits only. No +, spaces or dashes.
  // Example for an Indian number 98765 43210 -> "919876543210"
  // While this is still the placeholder, the page shows "demo" notices
  // next to the WhatsApp buttons. They disappear once you change it.
  whatsappNumber: "910000000000", // <-- placeholder, replace me
 
  timeZone: "Asia/Kolkata",
 
  // Opening hours in 24-hour time: [openHour, closeHour].
  // 0 = Sunday ... 6 = Saturday. null = closed (by appointment).
  // If you change these, also update the hours text in index.html.
  hours: {
    0: null,
    1: [10, 19],
    2: [10, 19],
    3: [10, 19],
    4: [10, 19],
    5: [10, 19],
    6: [10, 19]
  }
};
 
const PLACEHOLDER_NUMBER = "910000000000";
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
 
function whatsappUrl(message) {
  return "https://wa.me/" + CONFIG.whatsappNumber + "?text=" + encodeURIComponent(message);
}
 
function formatRupees(amount) {
  return "₹" + amount.toLocaleString("en-IN");
}
 
// =====================================================
// 1. WhatsApp links: build each one from its data-message
// =====================================================
document.querySelectorAll(".wa-link").forEach(function (link) {
  const message = link.dataset.message || "Hello! I would like to make an enquiry.";
  link.href = whatsappUrl(message);
});
 
// Show the "demo only" notices while the placeholder number is in use
const usingPlaceholder = CONFIG.whatsappNumber === PLACEHOLDER_NUMBER;
document.querySelectorAll("[data-placeholder-note]").forEach(function (note) {
  note.hidden = !usingPlaceholder;
});
 
// Footer year
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();
 
// =====================================================
// 2. Mobile menu
// =====================================================
const menuToggle = document.getElementById("menuToggle");
const siteNav = document.getElementById("siteNav");
 
function setMenu(open) {
  siteNav.classList.toggle("open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}
 
menuToggle.addEventListener("click", function () {
  setMenu(!siteNav.classList.contains("open"));
});
 
siteNav.querySelectorAll("a").forEach(function (link) {
  link.addEventListener("click", function () { setMenu(false); });
});
 
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && siteNav.classList.contains("open")) {
    setMenu(false);
    menuToggle.focus();
  }
});
 
// =====================================================
// 3. Open / closed status (uses Indian time, not the visitor's clock)
// =====================================================
function getIndiaNow() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CONFIG.timeZone,
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hour12: false
  }).formatToParts(new Date());
 
  function get(type) { return parts.find(function (p) { return p.type === type; }).value; }
 
  const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  let hour = parseInt(get("hour"), 10);
  if (hour === 24) hour = 0;
 
  return { day: dayMap[get("weekday")], minutes: hour * 60 + parseInt(get("minute"), 10) };
}
 
function formatHour(h) {
  const suffix = h >= 12 ? "pm" : "am";
  const twelve = h % 12 === 0 ? 12 : h % 12;
  return twelve + ":00 " + suffix;
}
 
function updateOpenStatus() {
  const el = document.getElementById("openStatus");
  if (!el) return;
 
  const now = getIndiaNow();
  const today = CONFIG.hours[now.day];
 
  el.classList.remove("is-open", "is-closed");
 
  if (today && now.minutes >= today[0] * 60 && now.minutes < today[1] * 60) {
    el.textContent = "Open now · until " + formatHour(today[1]) + " IST (sample hours)";
    el.classList.add("is-open");
    return;
  }
 
  for (let i = 0; i <= 7; i++) {
    const dayIndex = (now.day + i) % 7;
    const hours = CONFIG.hours[dayIndex];
    if (hours && (i > 0 || now.minutes < hours[0] * 60)) {
      const when = i === 0 ? "today" : i === 1 ? "tomorrow" : DAY_NAMES[dayIndex];
      el.textContent = "Closed now · opens " + when + " at " + formatHour(hours[0]) + " (sample hours)";
      el.classList.add("is-closed");
      return;
    }
  }
}
 
updateOpenStatus();
setInterval(updateOpenStatus, 60000);
 
// =====================================================
// 4. Service filter buttons
// =====================================================
const filterButtons = document.querySelectorAll(".filter-btn");
const serviceCards = document.querySelectorAll("#serviceCards .card");
 
filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const filter = button.dataset.filter;
 
    filterButtons.forEach(function (b) {
      b.setAttribute("aria-pressed", String(b === button));
    });
 
    serviceCards.forEach(function (card) {
      card.hidden = !(filter === "all" || card.dataset.category === filter);
    });
  });
});
 
// =====================================================
// 5. Enquiry builder (creates a WhatsApp message; sends nothing itself)
// =====================================================
const serviceChoices = document.getElementById("serviceChoices");
const enquiryForm = document.getElementById("enquiryForm");
const messagePreview = document.getElementById("messagePreview");
const totalLine = document.getElementById("totalLine");
const selectedLine = document.getElementById("selectedLine");
const sendBtn = document.getElementById("sendBtn");
const sendHint = document.getElementById("sendHint");
const dateHint = document.getElementById("dateHint");
const resetBtn = document.getElementById("resetBtn");
const prefDate = document.getElementById("prefDate");
 
// Build one checkbox per service card, so the list is never out of date
serviceCards.forEach(function (card, index) {
  const label = document.createElement("label");
  label.className = "choice";
 
  const input = document.createElement("input");
  input.type = "checkbox";
  input.name = "service";
  input.value = card.dataset.name;
  input.dataset.price = card.dataset.price;
  input.id = "service-" + index;
 
  const name = document.createElement("span");
  name.className = "choice-name";
  name.textContent = card.dataset.name;
 
  const price = document.createElement("span");
  price.className = "choice-price";
  price.textContent = formatRupees(Number(card.dataset.price));
 
  label.append(input, name, price);
  serviceChoices.appendChild(label);
});
 
// Today's date in India, as YYYY-MM-DD (the format a date input uses)
function indiaToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CONFIG.timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}
 
function formatChosenDate(value) {
  const parts = value.split("-");
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return date.toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric"
  });
}
 
// Returns "", "past" or "appointment" for the chosen date
function checkDate(value) {
  if (!value) return "";
  if (value < indiaToday()) return "past"; // YYYY-MM-DD strings compare correctly
  const p = value.split("-");
  const weekday = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2])).getDay();
  return CONFIG.hours[weekday] === null ? "appointment" : "";
}
 
function buildEnquiry() {
  const checked = Array.from(enquiryForm.querySelectorAll('input[name="service"]:checked'));
  const visit = enquiryForm.querySelector('input[name="visit"]:checked').value;
  const dateProblem = checkDate(prefDate.value);
  const date = prefDate.value && dateProblem !== "past" ? formatChosenDate(prefDate.value) : "";
  const time = document.getElementById("prefTime").value;
  const customer = document.getElementById("custName").value.trim();
 
  let total = 0;
  const lines = [];
 
  lines.push("Hello " + CONFIG.businessName + "!" + (customer ? " This is " + customer + "." : ""));
 
  if (checked.length === 0) {
    lines.push("I would like to enquire about your services.");
  } else {
    lines.push("I would like to enquire about:");
    checked.forEach(function (box) {
      const price = Number(box.dataset.price);
      total += price;
      lines.push("- " + box.value + " (" + formatRupees(price) + ")");
    });
  }
 
  lines.push("Visit type: " + visit);
  if (date) lines.push("Preferred date: " + date);
  if (time) lines.push("Preferred time: " + time);
 
  if (checked.length > 0) {
    lines.push("Estimated total: " + formatRupees(total) + ". Please confirm availability and final price.");
  } else {
    lines.push("Please share available time slots.");
  }
 
  return { message: lines.join("\n"), total: total, count: checked.length, dateProblem: dateProblem };
}
 
function refreshEnquiry() {
  prefDate.min = indiaToday();
  const result = buildEnquiry();
  const ready = result.count > 0;
 
  messagePreview.textContent = result.message;
  totalLine.textContent = "Estimated total (sample prices): " + formatRupees(result.total);
  selectedLine.textContent = ready
    ? result.count + (result.count === 1 ? " service" : " services") + " selected · " + formatRupees(result.total) + " (sample prices)"
    : "No services selected yet.";
 
  // Date feedback
  dateHint.classList.toggle("is-warning", result.dateProblem === "past");
  if (result.dateProblem === "past") {
    dateHint.textContent = "That date has already passed, so it is left out of the message. Please pick today or a later date.";
  } else if (result.dateProblem === "appointment") {
    dateHint.textContent = "Sundays are by appointment only. The studio will confirm if a slot is possible.";
  } else {
    dateHint.textContent = "";
  }
 
  // The button is a real link, so phones do not block it as a pop-up
  sendBtn.setAttribute("aria-disabled", String(!ready));
  sendBtn.href = ready ? whatsappUrl(result.message) : "#book";
  sendHint.textContent = ready
    ? "Opens WhatsApp in a new tab. Nothing is sent until you press Send there."
    : "Tick at least one service to continue.";
}
 
enquiryForm.addEventListener("input", refreshEnquiry);
enquiryForm.addEventListener("change", refreshEnquiry);
enquiryForm.addEventListener("submit", function (event) { event.preventDefault(); });
 
sendBtn.addEventListener("click", function (event) {
  if (sendBtn.getAttribute("aria-disabled") === "true") {
    // Nothing selected: do not follow the link, guide the visitor back to the list
    event.preventDefault();
    sendHint.textContent = "Please tick at least one service first.";
    const firstBox = serviceChoices.querySelector("input");
    if (firstBox) firstBox.focus();
    return;
  }
  // The link opens WhatsApp by itself. Be honest about what happens next.
  sendHint.textContent = "WhatsApp is opening in a new tab. Press Send there to submit your enquiry. " +
    "It is not a confirmed booking until the studio replies.";
});
 
resetBtn.addEventListener("click", function () {
  enquiryForm.reset();
  refreshEnquiry();
});
 
// "Book this" buttons on the service cards: tick that service in the form,
// then the link (href="#book") scrolls down to it.
document.querySelectorAll("[data-service]").forEach(function (button) {
  button.addEventListener("click", function () {
    const wanted = button.dataset.service;
    const box = Array.from(serviceChoices.querySelectorAll("input")).find(function (input) {
      return input.value === wanted;
    });
    if (box) {
      box.checked = true;
      refreshEnquiry();
    }
  });
});
 
refreshEnquiry();
 
// =====================================================
// 6. Highlight the current section in the navigation
// =====================================================
const navLinks = document.querySelectorAll(".site-nav a:not(.btn)");
const sections = document.querySelectorAll("main section[id]");
 
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        navLinks.forEach(function (link) {
          if (link.getAttribute("href") === "#" + entry.target.id) {
            link.setAttribute("aria-current", "true");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      }
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
 
  sections.forEach(function (section) { observer.observe(section); });
}
 
// =====================================================
// 7. Back-to-top button (appears after scrolling down)
// =====================================================
const toTop = document.getElementById("toTop");
 
window.addEventListener("scroll", function () {
  toTop.hidden = window.scrollY < 700;
}, { passive: true });
 