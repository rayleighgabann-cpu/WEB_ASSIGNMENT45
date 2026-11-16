// ============================================================
// Plain JavaScript (без jQuery): index.html, events.html, contact.html
// ============================================================

// ---------- НАСТРОЙКИ ----------
const CAFE_TZ = 'Asia/Almaty';            // время кафе, а не браузера посетителя
const SPOTS_KEY = 'nesibe_event_spots';   // остаток мест по событиям

// ---------- ДАННЫЕ ----------
// Index = Date.getDay() (0 = Sunday). close: 24 = полночь.
const OPENING_HOURS = [
    { day: 'Sunday',    open: 11, close: 22 },
    { day: 'Monday',    open: 10, close: 23 },
    { day: 'Tuesday',   open: 10, close: 23 },
    { day: 'Wednesday', open: 10, close: 23 },
    { day: 'Thursday',  open: 10, close: 23 },
    { day: 'Friday',    open: 10, close: 24 },
    { day: 'Saturday',  open: 11, close: 24 }
];

const DISHES = [
    { name: 'Margherita',        desc: 'Tomato sauce, mozzarella, fresh basil',                   price: 2750, img: 'images/pizza.jpg' },
    { name: 'Pepperoni',         desc: 'Tomato sauce, mozzarella, spicy pepperoni',               price: 3150, img: 'images/pizza.jpg' },
    { name: 'Duck Pizza',        desc: 'Roasted duck, caramelized onions, hoisin sauce',          price: 3350, img: 'images/pizza.jpg' },
    { name: 'Classic Burger',    desc: 'Beef patty, fresh veggies, house sauce, brioche bun.',    price: 2900, img: 'images/burger.jpg' },
    { name: 'Horse Meat Burger', desc: 'Premium local horse meat, smoked cheese, signature sauce.', price: 2990, img: 'images/burger.jpg' },
    { name: 'Double Burger',     desc: 'Two beef patties, double cheese, caramelized onion.',     price: 3590, img: 'images/burger.jpg' },
    { name: 'Kazakh Tea',        desc: 'Traditional tea served in a pot',                         price: 2300, img: 'images/tea-ceremony.jpg' }
];

// week = через сколько недель от ближайшей субботы проходит событие.
// Даты больше не хардкодятся — события всегда в будущем.
const EVENTS = [
    { id: 1, title: 'Besbarmak Workshop', week: 0, time: '14:00 - 17:00', price: 15000, spots: 4,
        desc: 'Learn the national dish from scratch with our head chef.' },
    { id: 2, title: 'Kazakh Music Night', week: 1, time: '18:00 - 22:00', price: 25000, spots: 8,
        desc: 'Multi-course dinner with traditional dishes and live music.' },
    { id: 3, title: 'Tea Ceremony',       week: 2, time: '15:00 - 17:00', price: 8000,  spots: 6,
        desc: 'Discover the art of Kazakh tea with tasting of 5 varieties.' }
];

const PATTERNS = {
    email: /^[a-zA-Z0-9]+([._%+-][a-zA-Z0-9]+)*@[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*(\.[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*)+\.[a-zA-Z]{2,}$/,
    phone: /^\+?[0-9\s\-()]+$/,
    name: /^[A-Za-zА-Яа-яЁёӘәІіҢңҒғҮүҰұҚқӨөҺһ\s'-]+$/
};

// ---------- ХЕЛПЕРЫ ----------
// "Сейчас" по часам кафе: турист из другого пояса видит тот же статус.
function cafeNow() {
    return new Date(new Date().toLocaleString('en-US', { timeZone: CAFE_TZ }));
}
function formatPrice(amount) {
    return amount.toLocaleString('en-US') + ' ₸';
}
function formatDate(iso) {
    return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
    });
}
function formatTime(hour) {
    return String(hour % 24).padStart(2, '0') + ':00';
}
// Date -> "2026-11-21" (локальная дата, без сдвига UTC)
function isoDate(date) {
    return date.getFullYear() + '-' +
        String(date.getMonth() + 1).padStart(2, '0') + '-' +
        String(date.getDate()).padStart(2, '0');
}
function getWorkingHours(date) {
    return OPENING_HOURS[date.getDay()];
}
function describeHours(hours) {
    return formatTime(hours.open) + ' – ' + formatTime(hours.close);
}
function isValidFormat(value, type) {
    if (type === 'phone') {
        return validatePhone(value) === '';
    }
    return PATTERNS[type].test(value);
}
function validateFullName(value) {
    const v = value.trim();
    if (!v) return 'Please enter your full name (first and last name).';
    if (v.length < 3 || v.length > 60) return 'Full name must be between 3 and 60 characters.';
    if (!PATTERNS.name.test(v)) return 'Name can only contain letters, spaces, and hyphens.';
    const words = v.split(/\s+/).filter(Boolean);
    if (words.length < 2) return 'Please enter your full name (first and last name).';
    const validWords = words.every(function (w) {
        return (w.match(/[A-Za-zА-Яа-яЁёӘәІіҢңҒғҮүҰұҚқӨөҺһ]/g) || []).length >= 2;
    });
    if (!validWords) return 'First and last name must contain at least 2 letters each.';
    return '';
}
function validateEmail(value) {
    const v = value.trim();
    if (!v) return 'Please enter your e-mail address.';
    if (v.length > 100 || !PATTERNS.email.test(v)) return 'Enter a valid e-mail, e.g. name@example.com.';
    return '';
}
function validatePhone(value) {
    const v = value.trim();
    if (!v) return 'Please enter your phone number.';
    if (!PATTERNS.phone.test(v) || /--|\(\)/.test(v)) {
        return 'Enter a valid phone, e.g. +7 701 123 45 67.';
    }
    const openParens = (v.match(/\(/g) || []).length;
    const closeParens = (v.match(/\)/g) || []).length;
    if (openParens !== closeParens || (openParens > 0 && !/\(\d{2,5}\)/.test(v))) {
        return 'Check parentheses in phone number, e.g. +7 (701) 123-45-67.';
    }
    const digits = v.replace(/\D/g, '');
    let formatOk = false;
    if (v.startsWith('+7') || (!v.startsWith('+') && digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8')))) {
        formatOk = /^[78]7\d{9}$/.test(digits);
    } else if (!v.startsWith('+') && digits.length === 10 && digits.startsWith('7')) {
        formatOk = /^7\d{9}$/.test(digits);
    } else if (v.startsWith('+')) {
        formatOk = /^[1-9]\d{9,14}$/.test(digits);
    }
    if (!formatOk || /^(\d)\1{6}$/.test(digits.slice(-7))) {
        return 'Enter a valid phone, e.g. +7 701 123 45 67.';
    }
    return '';
}

// ---------- ОШИБКИ ПОЛЕЙ / ПОДТВЕРЖДЕНИЯ ----------
function showFieldError(field, message) {
    field.classList.remove('is-valid');
    field.classList.add('is-invalid');
    const next = field.nextElementSibling;
    if (next && next.classList.contains('error-msg')) {
        next.textContent = message;
        return;
    }
    const msg = document.createElement('div');
    msg.className = 'error-msg text-danger small mt-1';
    msg.textContent = message;
    field.insertAdjacentElement('afterend', msg);
}
function clearFieldError(field, markValid) {
    field.classList.remove('is-invalid');
    field.classList.toggle('is-valid', Boolean(markValid));
    const next = field.nextElementSibling;
    if (next && next.classList.contains('error-msg')) next.remove();
}
function clearAllFieldStates(form) {
    form.querySelectorAll('.is-invalid, .is-valid').forEach(function (field) {
        clearFieldError(field, false);
    });
}
// rules = [{ id, check(value) -> текст ошибки или '' }]
function validateForm(rules) {
    let firstInvalid = null;
    rules.forEach(function (rule) {
        const field = document.getElementById(rule.id);
        if (!field) return;
        if (field.type !== 'select-one') field.value = field.value.trim();
        const message = rule.check(field.value);
        if (message) {
            showFieldError(field, message);
            if (!firstInvalid) firstInvalid = field;
        } else {
            clearFieldError(field, field.value !== '');
        }
    });
    if (firstInvalid) firstInvalid.focus();
    return firstInvalid === null;
}
// Ошибка снимается только когда поле реально стало валидным, плюс проверка при потере фокуса
function enableLiveFix(form, rules) {
    function handleFieldEvent(target, isBlur) {
        const rule = rules.find(function (r) { return r.id === target.id; });
        if (!rule) return;
        const val = target.type === 'select-one' ? target.value : target.value.trim();
        const isMarked = target.classList.contains('is-invalid') || target.classList.contains('is-valid');
        if (!isBlur && !isMarked) return;
        if (isBlur && val === '' && !target.classList.contains('is-invalid')) return;
        const message = rule.check(val);
        if (message) {
            showFieldError(target, message);
        } else {
            clearFieldError(target, val !== '');
        }
    }
    form.addEventListener('input', function (e) { handleFieldEvent(e.target, false); });
    form.addEventListener('change', function (e) { handleFieldEvent(e.target, true); });
    form.addEventListener('focusout', function (e) { handleFieldEvent(e.target, true); });
}
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
function enableResetCleanup(form) {
    form.addEventListener('reset', function () {
        clearAllFieldStates(form);
        clearConfirmation(form);
    });
}

// ============================================================
// INDEX: блюдо дня + статус "открыто / закрыто"
// ============================================================
function renderDishOfDay() {
    const container = document.getElementById('dish-of-day');
    const dish = DISHES[cafeNow().getDay()];
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
        '</div></div></div>';
}

function updateStatus() {
    const el = document.getElementById('open-status');
    if (!el) return;
    const now = cafeNow();
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
    setInterval(updateStatus, 60000);
}

// ============================================================
// EVENTS: ближайшие даты, остаток мест в localStorage, бронь
// ============================================================
// Ближайшая суббота (всегда будущая, даже если сегодня суббота)
function nextSaturday(from) {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
    return d;
}
function scheduleEvents() {
    const first = nextSaturday(cafeNow());
    EVENTS.forEach(function (ev) {
        const d = new Date(first);
        d.setDate(d.getDate() + ev.week * 7);
        ev.date = isoDate(d);
    });
}
// Ключ = id + дата: на новой неделе места снова полные
function loadSpots() {
    try {
        const saved = JSON.parse(localStorage.getItem(SPOTS_KEY));
        if (!saved) return;
        EVENTS.forEach(function (ev) {
            const value = saved[ev.id + '|' + ev.date];
            if (typeof value === 'number') ev.spots = value;
        });
    } catch (e) { /* повреждённые данные игнорируем */ }
}
function saveSpots() {
    const data = {};
    EVENTS.forEach(function (ev) { data[ev.id + '|' + ev.date] = ev.spots; });
    try { localStorage.setItem(SPOTS_KEY, JSON.stringify(data)); } catch (e) {}
}

function buildEventCard(ev) {
    const soldOut = ev.spots === 0;
    const badgeClass = soldOut ? 'bg-secondary text-white' : 'bg-warning text-dark';
    const badgeText = soldOut ? 'Sold out' : ev.spots + (ev.spots === 1 ? ' spot left' : ' spots left');
    const button = soldOut
        ? '<a class="btn btn-outline-brand d-block text-decoration-none disabled" aria-disabled="true" tabindex="-1">SOLD OUT</a>'
        : '<a href="#eventBookingForm" class="btn btn-outline-brand d-block text-decoration-none book-btn" data-event-id="' + ev.id + '">BOOK NOW</a>';

    return '<div class="col-md-4">' +
        '<div class="premium-card">' +
        '<div class="event-date-header">' + formatDate(ev.date) + '</div>' +
        '<div class="card-body">' +
        '<h3 class="h5 text-brand">' + ev.title + '</h3>' +
        '<p class="small text-muted mb-3">' + ev.desc + '</p>' +
        '<p class="mb-1 text-dark"><strong>Time:</strong> ' + ev.time + '</p>' +
        '<p class="mb-3 text-dark"><strong>Price:</strong> ' + formatPrice(ev.price) + '</p>' +
        '<div class="mt-auto pt-3">' +
        '<div class="badge ' + badgeClass + ' w-100 py-2 mb-3 rounded-pill fw-bold">' + badgeText + '</div>' +
        button +
        '</div></div></div></div>';
}

function renderEvents() {
    const list = document.getElementById('events-list');
    list.innerHTML = EVENTS.length
        ? EVENTS.map(buildEventCard).join('')
        : '<div class="col-12"><p class="text-muted text-center">No upcoming events yet.</p></div>';
}

// <option> строятся из массива — порядок в HTML больше ни на что не влияет
function fillEventSelect(select) {
    select.innerHTML = '';
    EVENTS.forEach(function (ev) {
        const opt = document.createElement('option');
        opt.value = ev.id;
        opt.textContent = ev.title;
        opt.disabled = ev.spots === 0;
        select.appendChild(opt);
    });
}

function initEvents() {
    const form = document.getElementById('eventBookingForm');
    const list = document.getElementById('events-list');
    const select = document.getElementById('ev-event');
    const dateField = document.getElementById('ev-date');
    form.noValidate = true;

    scheduleEvents();
    loadSpots();
    fillEventSelect(select);
    renderEvents();

    dateField.readOnly = true; // дату задаёт событие, вручную её менять незачем

    function currentEvent() {
        return EVENTS.find(function (ev) { return ev.id === Number(select.value); }) || EVENTS[0];
    }
    function selectEvent(id) {
        select.value = String(id);
        dateField.value = currentEvent().date;
        clearFieldError(select);
        clearFieldError(dateField);
    }
    selectEvent(EVENTS[0].id); // при загрузке дата сразу заполнена

    // Делегирование: карточки перерисовываются, обработчик остаётся
    list.addEventListener('click', function (e) {
        const btn = e.target.closest('.book-btn');
        if (!btn) return;
        selectEvent(Number(btn.dataset.eventId));
    });
    select.addEventListener('change', function () { selectEvent(Number(select.value)); });

    const rules = [
        { id: 'ev-name', check: validateFullName },
        { id: 'ev-phone', check: validatePhone },
        { id: 'ev-event', check: function (v) {
                if (!v) return 'Please select an event.';
                return currentEvent().spots === 0 ? 'This event is sold out.' : '';
            } },
        { id: 'ev-date', check: function (v) {
                if (!v) return 'Event date is required.';
                return v !== currentEvent().date
                    ? 'Event date must match the scheduled date (' + formatDate(currentEvent().date) + ').'
                    : '';
            } },
        { id: 'ev-guests', check: function (v) {
                if (v === '') return 'Please specify the number of guests.';
                if (!/^\d+$/.test(v)) return 'Number of guests must be a whole number.';
                const n = Number(v);
                if (n < 1) return 'Please specify at least 1 guest.';
                if (currentEvent().spots === 0) return 'No spots available for this event.';
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
        const name = document.getElementById('ev-name').value;
        const phone = document.getElementById('ev-phone').value;
        const total = ev.price * guests;

        ev.spots -= guests;
        saveSpots();

        form.reset();
        clearAllFieldStates(form);
        fillEventSelect(select);
        selectEvent(EVENTS[0].id);
        renderEvents();

        showConfirmation(form, name + ', request received for "' + ev.title + '" (' +
            formatDate(ev.date) + ', ' + ev.time + '). Guests: ' + guests +
            '. Total to pay: ' + formatPrice(total) + '. We will call you at ' + phone + ' to confirm.');
    });
}

// ============================================================
// CONTACT: бронь стола (дата + время + гости)
// ============================================================
// Слоты каждый час, последний — за час до закрытия
function fillTimeSlots(select, date) {
    const hours = getWorkingHours(date);
    const now = cafeNow();
    const isToday = isoDate(date) === isoDate(now);
    const currentHour = now.getHours();
    select.innerHTML = '';
    let firstAvailable = '';

    for (let h = hours.open; h < hours.close; h++) {
        const opt = document.createElement('option');
        const timeStr = formatTime(h);
        const passed = isToday && h <= currentHour;
        opt.value = timeStr;
        opt.textContent = passed ? timeStr + ' (unavailable)' : timeStr;
        opt.disabled = passed;
        if (!passed && !firstAvailable) firstAvailable = timeStr;
        select.appendChild(opt);
    }

    if (firstAvailable) {
        select.value = firstAvailable;
    } else {
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = 'No slots left for today';
        placeholder.selected = true;
        select.insertBefore(placeholder, select.firstChild);
    }
}

function initBooking() {
    const form = document.getElementById('bookingForm');
    form.noValidate = true;

    const dateField = document.getElementById('bk-date');
    const timeField = document.getElementById('bk-time');
    const now = cafeNow();
    const maxBookingDate = new Date(now.getFullYear(), now.getMonth() + 6, now.getDate());
    dateField.min = isoDate(now);
    dateField.max = isoDate(maxBookingDate);

    const rules = [
        { id: 'bk-name', check: validateFullName },
        { id: 'bk-email', check: validateEmail },
        { id: 'bk-phone', check: validatePhone },
        { id: 'bk-date', check: function (v) {
                if (v === '') return 'Please choose a reservation date.';
                const picked = new Date(v + 'T00:00:00');
                if (isNaN(picked.getTime())) return 'Please enter a valid date.';
                const today = cafeNow();
                today.setHours(0, 0, 0, 0);
                if (picked < today) return 'The date cannot be in the past.';
                const maxDate = new Date(today.getFullYear(), today.getMonth() + 6, today.getDate());
                if (picked > maxDate) return 'Reservations can be made up to 6 months in advance.';
                return '';
            } },
        { id: 'bk-guests', check: function (v) {
                if (v === '') return 'Please specify the number of guests.';
                if (!/^\d+$/.test(v)) return 'Guests: a whole number from 1 to 20.';
                const n = Number(v);
                return n >= 1 && n <= 20 ? '' : 'Guests: a whole number from 1 to 20.';
            } },
        { id: 'bk-seat', check: function (v) {
                return (!v || v === 'Choose...') ? 'Please select a seating preference.' : '';
            } },
        { id: 'bk-notes', check: function (v) {
                if (v.length > 300) return 'Special requests: up to 300 characters.';
                if (v.length > 0 && v.length < 3) return 'Special requests must be at least 3 characters if provided.';
                return '';
            } }
    ];

    if (timeField) {
        fillTimeSlots(timeField, cafeNow());
        dateField.addEventListener('change', function () {
            const d = dateField.value ? new Date(dateField.value + 'T00:00:00') : cafeNow();
            if (!isNaN(d.getTime())) {
                fillTimeSlots(timeField, d);
                clearFieldError(timeField, false);
            }
        });
        form.addEventListener('reset', function () {
            setTimeout(function () { fillTimeSlots(timeField, cafeNow()); }, 0);
        });
        rules.push({ id: 'bk-time', check: function (v) {
                if (!v) return 'Please choose an available time slot (or pick another date).';
                if (dateField.value === isoDate(cafeNow())) {
                    const selectedHour = parseInt(v.split(':')[0], 10);
                    if (selectedHour <= cafeNow().getHours()) {
                        return 'Selected time has already passed for today. Please choose a later time.';
                    }
                }
                return '';
            } });
    }

    enableLiveFix(form, rules);
    enableResetCleanup(form);

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!validateForm(rules)) return;

        const dateValue = dateField.value;
        const date = new Date(dateValue + 'T00:00:00');
        const guests = Number(document.getElementById('bk-guests').value);
        const seat = document.getElementById('bk-seat');
        const seatText = seat.value ? ' (' + seat.value + ')' : '';
        const timeText = timeField ? ' at ' + timeField.value : '';
        const email = document.getElementById('bk-email').value;

        form.reset();
        clearAllFieldStates(form);
        showConfirmation(form, 'Request received: ' + formatDate(dateValue) + timeText + ', ' +
            guests + (guests === 1 ? ' guest' : ' guests') + seatText + '. That day we are open ' +
            describeHours(getWorkingHours(date)) + '. We will confirm by e-mail: ' + email + '.');
    });
}

// ---------- СТАРТ ----------
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