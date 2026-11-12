// ============================================================
// Plain JavaScript (WITHOUT jQuery): index.html, events.html, contact.html ("Book a Table" form)
// ============================================================

// ---------- PROJECT DATA (arrays & objects) ----------

// Opening hours. Index = day of week from Date.getDay() (0 = Sunday). close: 24 = midnight.
const OPENING_HOURS = [
    { day: 'Sunday',    open: 11, close: 22 },
    { day: 'Monday',    open: 10, close: 23 },
    { day: 'Tuesday',   open: 10, close: 23 },
    { day: 'Wednesday', open: 10, close: 23 },
    { day: 'Thursday',  open: 10, close: 23 },
    { day: 'Friday',    open: 10, close: 24 },
    { day: 'Saturday',  open: 11, close: 24 }
];

// Dishes for "Dish of the Day": one per day of week (prices from menu.html)
const DISHES = [
    { name: 'Margherita',        desc: 'Tomato sauce, mozzarella, fresh basil',            price: 2750, img: 'images/pizza.jpg' },
    { name: 'Pepperoni',         desc: 'Tomato sauce, mozzarella, spicy pepperoni',        price: 3150, img: 'images/pizza.jpg' },
    { name: 'Duck Pizza',        desc: 'Roasted duck, caramelized onions, hoisin sauce',   price: 3350, img: 'images/pizza.jpg' },
    { name: 'Classic Burger',    desc: 'Beef patty, fresh veggies, house sauce, brioche bun.', price: 2900, img: 'images/burger.jpg' },
    { name: 'Horse Meat Burger', desc: 'Premium local horse meat, smoked cheese, signature sauce.', price: 2990, img: 'images/burger.jpg' },
    { name: 'Double Burger',     desc: 'Two beef patties, double cheese, caramelized onion.', price: 3590, img: 'images/burger.jpg' },
    { name: 'Kazakh Tea',        desc: 'Traditional tea served in a pot',                  price: 2300, img: 'images/tea-ceremony.jpg' }
];

// Events. Note: order matches order of <option> in select #ev-event on events.html.
const EVENTS = [
    { id: 1, title: 'Besbarmak Workshop', date: '2024-06-15', time: '14:00 - 17:00', price: 15000, spots: 4,
        desc: 'Learn the national dish from scratch with our head chef.' },
    { id: 2, title: 'Nauryz Celebration', date: '2024-06-22', time: '18:00 - 22:00', price: 25000, spots: 8,
        desc: 'Multi-course dinner with traditional dishes and live music.' },
    { id: 3, title: 'Tea Ceremony',       date: '2024-06-29', time: '15:00 - 17:00', price: 8000,  spots: 6,
        desc: 'Discover the art of Kazakh tea with tasting of 5 varieties.' }
];

// Format validation patterns
const PATTERNS = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
    phone: /^\+?[0-9\s\-()]+$/
};

// ---------- FUNCTIONS (with parameters and return values) ----------

// 2750 -> "2,750 ₸" (matching site format)
function formatPrice(amount) {
    return amount.toLocaleString('en-US') + ' ₸';
}

// "2024-06-15" -> "15 June 2024"
function formatDate(iso) {
    return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
    });
}

// 10 -> "10:00", 24 -> "00:00"
function formatTime(hour) {
    return String(hour % 24).padStart(2, '0') + ':00';
}

// Opening hours for a specific date (Date)
function getWorkingHours(date) {
    return OPENING_HOURS[date.getDay()];
}

// { open: 10, close: 23 } -> "10:00 – 23:00"
function describeHours(hours) {
    return formatTime(hours.open) + ' – ' + formatTime(hours.close);
}

// Format check: type = 'email' or 'phone'
function isValidFormat(value, type) {
    if (type === 'phone') {
        const digits = value.replace(/\D/g, '');
        return PATTERNS.phone.test(value) && digits.length >= 10 && digits.length <= 15;
    }
    return PATTERNS[type].test(value);
}

// Field error display (uses existing Bootstrap classes)
function showFieldError(field, message) {
    field.classList.add('is-invalid');
    const msg = document.createElement('div');
    msg.className = 'error-msg text-danger small mt-1';
    msg.textContent = message;
    field.insertAdjacentElement('afterend', msg);
}

function clearFieldError(field) {
    field.classList.remove('is-invalid');
    const next = field.nextElementSibling;
    if (next && next.classList.contains('error-msg')) {
        next.remove();
    }
}

// Form validation against rules = [{ id, check(value) -> error text or '' }].
// Returns true only if all fields pass validation.
function validateForm(rules) {
    let firstInvalid = null;
    rules.forEach(function (rule) {
        const field = document.getElementById(rule.id);
        if (field.type !== 'select-one') {
            field.value = field.value.trim();
        }
        clearFieldError(field);
        const message = rule.check(field.value);
        if (message) {
            showFieldError(field, message);
            if (!firstInvalid) firstInvalid = field;
        }
    });
    if (firstInvalid) firstInvalid.focus();
    return firstInvalid === null;
}

// Clear error as soon as user edits the field
function enableLiveFix(form, rules) {
    form.addEventListener('input', function (e) {
        const rule = rules.find(function (r) { return r.id === e.target.id; });
        if (!rule || !e.target.classList.contains('is-invalid')) return;
        if (!rule.check(e.target.value.trim())) {
            clearFieldError(e.target);
        }
    });
}

// In-form confirmation alert (created by code)
function showConfirmation(form, message) {
    clearConfirmation(form);
    const box = document.createElement('div');
    box.className = 'alert alert-success mt-3 form-confirmation';
    box.setAttribute('role', 'alert');
    box.textContent = message;
    form.appendChild(box);
}

function clearConfirmation(form) {
    const old = form.querySelector('.form-confirmation');
    if (old) old.remove();
}

// Reset button clears errors and confirmation
function enableResetCleanup(form) {
    form.addEventListener('reset', function () {
        form.querySelectorAll('.is-invalid').forEach(clearFieldError);
        clearConfirmation(form);
    });
}

// ============================================================
// INDEX: Dish of the Day + "open / closed" status
// ============================================================

function renderDishOfDay() {
    const container = document.getElementById('dish-of-day');
    const dish = DISHES[new Date().getDay()];

    container.innerHTML =
        '<div class="col-12"><h2 class="text-center mb-4 text-brand">Dish of the Day</h2></div>' +
        '<div class="col-md-6 col-lg-4">' +
        '<div class="premium-card text-center">' +
        '<img src="' + dish.img + '" class="card-img-top" alt="' + dish.name + '">' +
        '<div class="card-body">' +
        '<h3 class="h5 text-brand">' + dish.name + '</h3>' +
        '<p class="text-muted small mb-3">' + dish.desc + '</p>' +
        '<div class="fw-bold mb-2">' + formatPrice(dish.price) + '</div>' +
        '<p class="small fw-bold mb-3" id="open-status"></p>' +
        '<a href="menu.html" class="btn btn-outline-brand text-decoration-none mt-auto">View Menu</a>' +
        '</div>' +
        '</div>' +
        '</div>';
}

function updateStatus() {
    const el = document.getElementById('open-status');
    if (!el) return;

    const now = new Date();
    const hours = getWorkingHours(now);
    const hour = now.getHours() + now.getMinutes() / 60;
    const isOpen = hour >= hours.open && hour < hours.close;
    let text;

    if (isOpen) {
        text = 'Open now · today ' + describeHours(hours);
    } else if (hour < hours.open) {
        text = 'Closed now · opens today at ' + formatTime(hours.open);
    } else {
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        text = 'Closed for today · tomorrow ' + describeHours(getWorkingHours(tomorrow));
    }

    el.textContent = text;
    el.classList.toggle('text-success', isOpen);
    el.classList.toggle('text-danger', !isOpen);
}

function initHome() {
    renderDishOfDay();
    updateStatus();
    setInterval(updateStatus, 60000); // auto-update status
}

// ============================================================
// EVENTS: cards from array, booking, spots, total amount
// ============================================================

function buildEventCard(ev) {
    const soldOut = ev.spots === 0;
    const badgeClass = soldOut ? 'bg-secondary text-white' : 'bg-warning text-dark';
    const badgeText = soldOut ? 'Sold out' : ev.spots + (ev.spots === 1 ? ' spot left' : ' spots left');
    const button = soldOut
        ? '<a class="btn btn-outline-brand text-center d-block text-decoration-none disabled" aria-disabled="true" tabindex="-1">SOLD OUT</a>'
        : '<a href="#eventBookingForm" class="btn btn-outline-brand text-center d-block text-decoration-none book-btn" data-event-id="' + ev.id + '">BOOK NOW</a>';

    return '<div class="col-md-4">' +
        '<div class="premium-card">' +
        '<div class="event-date-header">' + formatDate(ev.date) + '</div>' +
        '<div class="card-body">' +
        '<h4 class="h5 text-brand">' + ev.title + '</h4>' +
        '<p class="small text-muted mb-3">' + ev.desc + '</p>' +
        '<p class="mb-1 text-dark"><strong>Time:</strong> ' + ev.time + '</p>' +
        '<p class="mb-3 text-dark"><strong>Price:</strong> ' + formatPrice(ev.price) + '</p>' +
        '<div class="mt-auto pt-3">' +
        '<div class="badge ' + badgeClass + ' w-100 py-2 mb-3 rounded-pill fw-bold">' + badgeText + '</div>' +
        button +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';
}

function renderEvents() {
    const list = document.getElementById('events-list');
    if (EVENTS.length === 0) {
        list.innerHTML = '<div class="col-12"><p class="text-muted text-center">No upcoming events yet.</p></div>';
        return;
    }
    list.innerHTML = EVENTS.map(buildEventCard).join('');
}

function initEvents() {
    const form = document.getElementById('eventBookingForm');
    const list = document.getElementById('events-list');
    const select = document.getElementById('ev-event');
    const dateField = document.getElementById('ev-date');
    form.noValidate = true; // validation handled in code

    renderEvents();

    // Event selection: sync date to form
    function selectEvent(id) {
        const index = EVENTS.findIndex(function (ev) { return ev.id === id; });
        select.selectedIndex = index;
        dateField.value = EVENTS[index].date;
        clearFieldError(select);
        clearFieldError(dateField);
    }

    // DELEGATION: parent handler catches cards re-rendered later
    list.addEventListener('click', function (e) {
        const btn = e.target.closest('.book-btn'); // target clicked
        if (!btn) return;
        selectEvent(Number(btn.dataset.eventId));
        // preventDefault not needed: hash link scrolls to form
    });

    select.addEventListener('change', function () {
        selectEvent(EVENTS[select.selectedIndex].id);
    });

    const currentEvent = function () { return EVENTS[select.selectedIndex]; };

    const rules = [
        { id: 'ev-name', check: function (v) {
                return v.split(/\s+/).length < 2 ? 'Please enter your full name (first and last name).' : '';
            } },
        { id: 'ev-phone', check: function (v) {
                return isValidFormat(v, 'phone') ? '' : 'Enter a valid phone, e.g. +7 701 123 45 67.';
            } },
        { id: 'ev-event', check: function () {
                return currentEvent().spots === 0 ? 'This event is sold out.' : '';
            } },
        { id: 'ev-date', check: function (v) {
                if (v === '') return 'Please choose an event date.';
                return v !== currentEvent().date ? 'This event takes place on ' + formatDate(currentEvent().date) + '.' : '';
            } },
        { id: 'ev-guests', check: function (v) {
                const n = Number(v);
                if (!Number.isInteger(n) || n < 1) return 'Please specify number of guests (whole number from 1).';
                return n > currentEvent().spots ? 'Spots available: ' + currentEvent().spots + '.' : '';
            } }
    ];

    enableLiveFix(form, rules);
    enableResetCleanup(form);

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!validateForm(rules)) return;

        const ev = currentEvent();
        const guests = Number(document.getElementById('ev-guests').value);
        const total = ev.price * guests; // calculated value
        const name = document.getElementById('ev-name').value;
        const message = name + ', you are booked for "' + ev.title + '" (' + formatDate(ev.date) + ', ' +
            ev.time + '). Guests: ' + guests + '. Total to pay: ' + formatPrice(total) + '.';

        ev.spots -= guests;
        form.reset();
        renderEvents(); // re-rendered cards — delegated handler continues to work
        showConfirmation(form, message);
    });
}

// ============================================================
// CONTACT: "Book a Table" form
// ============================================================

function initBooking() {
    const form = document.getElementById('bookingForm');
    form.noValidate = true;

    const rules = [
        { id: 'bk-name', check: function (v) {
                return v.length < 2 ? 'Please enter your full name.' : '';
            } },
        { id: 'bk-email', check: function (v) {
                return isValidFormat(v, 'email') ? '' : 'Enter a valid e-mail, e.g. name@example.com.';
            } },
        { id: 'bk-phone', check: function (v) {
                return isValidFormat(v, 'phone') ? '' : 'Enter a valid phone, e.g. +7 701 123 45 67.';
            } },
        { id: 'bk-date', check: function (v) {
                if (v === '') return 'Choose a date.';
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return new Date(v + 'T00:00:00') < today ? 'The date cannot be in the past.' : '';
            } },
        { id: 'bk-guests', check: function (v) {
                const n = Number(v);
                return Number.isInteger(n) && n >= 1 && n <= 20 ? '' : 'Guests: a whole number from 1 to 20.';
            } },
        { id: 'bk-notes', check: function (v) {
                return v.length > 300 ? 'Special requests: up to 300 characters.' : '';
            } }
    ];

    enableLiveFix(form, rules);
    enableResetCleanup(form);

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!validateForm(rules)) return;

        const date = new Date(document.getElementById('bk-date').value + 'T00:00:00');
        const guests = Number(document.getElementById('bk-guests').value);
        const seat = document.getElementById('bk-seat');
        const seatText = seat.selectedIndex > 0 ? ' (' + seat.value + ')' : '';
        const email = document.getElementById('bk-email').value;
        const message = 'Table booked for ' + formatDate(document.getElementById('bk-date').value) + ', ' +
            guests + (guests === 1 ? ' guest' : ' guests') + seatText + '. That day we are open ' +
            describeHours(getWorkingHours(date)) + '. A confirmation will be sent to ' + email + '.';

        form.reset();
        showConfirmation(form, message);
    });
}

// ---------- START ----------
function initPage() {
    if (document.getElementById('dish-of-day')) initHome();
    if (document.getElementById('events-list')) initEvents();
    if (document.getElementById('bookingForm')) initBooking();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage);
} else {
    initPage();
}
