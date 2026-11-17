// jQuery 3.7.1 — Menu: фильтр, поиск, корзина (localStorage), доставка/самовывоз, онлайн-оплата, авто +7.
$(function () {

    // ---------- DATA ----------
    const CART_KEY = 'nesibe_cart';
    const MAX_QTY = 20;
    const DELIVERY_FEE = 1000;
    const PROMOS = { NESIBE10: 10, SALE10: 10 };
    const PHONE_RE = /^\+?[0-9\s\-()]+$/;

    const dynamicDishes = [
        { name: 'Kazakh Besbarmak', price: '4,500 ₸', category: 'national', img: 'images/besbarmak.jpg',
            desc: 'Traditional boiled meat with handmade noodles.' },
        { name: 'Baursak (10pcs)',  price: '900 ₸',   category: 'national', img: 'images/baursak.jpg',
            desc: 'Golden fried dough pillows.' },
        { name: 'Shubat (0.5L)',    price: '1,200 ₸', category: 'national', img: 'images/kumis.jpg',
            desc: 'Fermented camel milk.' }
    ];

    let cart = {};
    let discountPct = 0;
    const filter = { cat: 'all', query: '' };

    // ---------- HELPERS ----------
    function setVisible($el, show) {
        $el.stop(true, true)[show ? 'fadeIn' : 'fadeOut'](200);
    }
    function showError($field, message) {
        $field.removeClass('is-valid').addClass('is-invalid');
        const $existing = $field.next('.error-msg');
        if ($existing.length) {
            $existing.text(message);
        } else {
            $field.after($('<div class="error-msg text-danger small mt-1"></div>').text(message));
        }
    }
    function clearError($field, markValid) {
        $field.removeClass('is-invalid').next('.error-msg').remove();
        $field.toggleClass('is-valid', Boolean(markValid));
    }
    function formatKzPhone(raw) {
        let digits = raw.replace(/\D/g, '');
        if (!digits) return '';
        if (digits.startsWith('8')) {
            digits = '7' + digits.slice(1);
        } else if (!digits.startsWith('7')) {
            digits = '7' + digits;
        }
        digits = digits.slice(0, 11);

        if (digits.length === 1) return '+7 ';
        if (digits.length <= 4) return '+7 (' + digits.slice(1);
        if (digits.length <= 7) return '+7 (' + digits.slice(1, 4) + ') ' + digits.slice(4);
        if (digits.length <= 9) return '+7 (' + digits.slice(1, 4) + ') ' + digits.slice(4, 7) + '-' + digits.slice(7);
        return '+7 (' + digits.slice(1, 4) + ') ' + digits.slice(4, 7) + '-' + digits.slice(7, 9) + '-' + digits.slice(9, 11);
    }
    function validateSearch(value) {
        const v = value.trim();
        if (!v) return '';
        if (v.length > 50) return 'Search query is too long (maximum 50 characters).';
        if (!/^[A-Za-zА-Яа-яЁёӘәІіҢңҒғҮүҰұҚқӨөҺһ0-9\s.,'()-]+$/.test(v)) {
            return 'Search can only contain letters, numbers, and spaces.';
        }
        return '';
    }
    function validateStreet(value) {
        const v = value.trim();
        if (!v) return 'Please enter your street address and building number.';
        if (v.length < 5 || v.length > 100) return 'Street address must be between 5 and 100 characters.';
        if (!/^[A-Za-zА-Яа-яЁёӘәІіҢңҒғҮүҰұҚқӨөҺһ0-9\s.,\-\/#№]+$/.test(v)) {
            return 'Address contains invalid characters.';
        }
        const letters = v.match(/[A-Za-zА-Яа-яЁёӘәІіҢңҒғҮүҰұҚқӨөҺһ]/g) || [];
        if (letters.length < 3) return 'Please include a valid street name (at least 3 letters).';
        if (!/\d/.test(v)) return 'Please include the building/house number (e.g. Uly Dala 41).';
        return '';
    }
    function validateApt(value) {
        const v = value.trim();
        if (!v) return '';
        if (!/^[1-9]\d{0,3}[A-Za-zА-Яа-яЁё]?$/.test(v)) {
            return 'Enter a valid apt (e.g. 12 or 12A).';
        }
        return '';
    }
    function validateFloor(value) {
        const v = value.trim();
        if (!v) return '';
        if (!/^\d+$/.test(v)) return 'Floor must be a whole number.';
        const n = Number(v);
        if (n < 1 || n > 100) return 'Floor must be between 1 and 100.';
        return '';
    }
    function validatePhone(value) {
        const v = value.trim();
        if (!v || v === '+7') return 'Please enter your phone number.';
        if (!PHONE_RE.test(v) || /--|\(\)/.test(v)) {
            return 'Enter a valid phone, e.g. +7 (701) 123-45-67.';
        }
        const digits = v.replace(/\D/g, '');
        if (!/^7[67]\d{9}$/.test(digits) || /^(\d)\1{6}$/.test(digits.slice(-7))) {
            return 'Enter a valid Kazakhstan phone, e.g. +7 (701) 123-45-67.';
        }
        return '';
    }
    function cartCount() {
        return Object.keys(cart).reduce(function (sum, key) { return sum + cart[key].qty; }, 0);
    }
    function getOrderMethod() {
        return $('input[name="order-method"]:checked').val() || 'delivery';
    }
    function getPaymentMethod() {
        return $('input[name="payment-method"]:checked').val() || 'Visa';
    }

    // ---------- 1. КОРЗИНА В localStorage ----------
    function loadCart() {
        try {
            const saved = JSON.parse(localStorage.getItem(CART_KEY));
            if (saved && typeof saved === 'object') {
                const sanitized = {};
                Object.keys(saved).forEach(function (key) {
                    const entry = saved[key];
                    if (
                        entry &&
                        typeof entry.name === 'string' &&
                        typeof entry.price === 'number' &&
                        entry.price > 0 &&
                        Number.isInteger(entry.qty) &&
                        entry.qty >= 1 &&
                        entry.qty <= MAX_QTY
                    ) {
                        sanitized[key] = entry;
                    }
                });
                cart = sanitized;
            }
        } catch (e) { cart = {}; }
    }
    function saveCart() {
        try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {}
    }

    // ---------- 2. ДИНАМИЧЕСКИЕ БЛЮДА ----------
    if ($('#menu-items').length) {
        $.each(dynamicDishes, function (i, dish) {
            const $card = $('<div class="premium-card border-warning"></div>')
                .append($('<img class="card-img-top" alt="">').attr({ src: dish.img, alt: dish.name }))
                .append(
                    $('<div class="card-body p-3"></div>')
                        .append($('<h3 class="h6 text-brand"></h3>').text(dish.name))
                        .append($('<div class="small text-muted mb-2"></div>').text(dish.desc))
                        .append($('<div class="fw-bold small mb-3 price-tag"></div>').text(dish.price))
                        .append('<button type="button" class="btn btn-sm btn-outline-brand w-100 mt-auto add-to-cart">Add</button>')
                );
            $('<div class="col-md-6 col-lg-4 mb-4" data-cat="' + dish.category + '"></div>')
                .append($card)
                .appendTo('#menu-items');
        });
    }

    // ---------- 3. ФИЛЬТР + ПОИСК ----------
    function applyFilter() {
        const total = $('.premium-card').length;
        let matched = 0;

        $('.premium-card').each(function () {
            const $card = $(this);
            const cardCat = $card.closest('[data-cat]').data('cat');
            const haystack = ($card.find('h3').text() + ' ' +
                $card.find('.card-body').children().not('h3, button, .btn, .price-tag').text()).toLowerCase();
            const isMatch = (filter.cat === 'all' || cardCat === filter.cat) && haystack.includes(filter.query);
            $card.data('match', isMatch);
            if (isMatch) matched++;
            setVisible($card.closest('[class*="col-"]'), isMatch);
        });

        $('.col-lg-8 > .row').each(function () {
            const $row = $(this);
            const hasMatch = $row.find('.premium-card').filter(function () {
                return $(this).data('match');
            }).length > 0;
            setVisible($row, hasMatch);
            setVisible($row.prev('h2.border-bottom'), hasMatch);
        });

        $('#menu-count').text(matched === 0
            ? 'No dishes found matching your search'
            : 'Showing ' + matched + ' of ' + total + ' dishes');
    }

    $('.category-btn').on('click', function (e) {
        e.preventDefault();
        $(this).siblings().removeClass('btn-brand').addClass('btn-outline-brand bg-white');
        $(this).removeClass('btn-outline-brand bg-white').addClass('btn-brand');
        filter.cat = $(this).data('category');
        applyFilter();
    });
    $('#menu-search').on('input search', function () {
        const $search = $(this);
        const raw = $search.val();
        const err = validateSearch(raw);
        if (err) {
            showError($search, err);
            return;
        }
        clearError($search, false);
        filter.query = raw.toLowerCase().trim();
        applyFilter();
    });

    // ---------- 4. ОТРИСОВКА КОРЗИНЫ ----------
    function showPromoNote(discount) {
        const $res = $('#promo-result');
        if (!$res.length || discountPct === 0) return;
        let text = 'Discount of ' + discountPct + '% applied!';
        if (discount > 0) text += ' Savings: ' + discount.toLocaleString('en-US') + ' ₸';
        $res.empty().append($('<span class="text-success fw-bold"></span>').text(text));
    }

    function buildCartEntry(item) {
        const itemTotal = item.price * item.qty;
        const $info = $('<div></div>')
            .append($('<h6 class="mb-0 text-brand small fw-bold"></h6>').text(item.name))
            .append($('<small class="text-muted"></small>').text(
                item.price.toLocaleString('en-US') + ' ₸ × ' + item.qty +
                ' = ' + itemTotal.toLocaleString('en-US') + ' ₸'));

        const $controls = $('<div class="d-flex align-items-center gap-1"></div>')
            .append('<button type="button" class="btn btn-sm btn-outline-secondary decrease-qty px-2 py-0 fw-bold">-</button>')
            .append($('<span class="fw-bold px-1 small"></span>').text(item.qty))
            .append('<button type="button" class="btn btn-sm btn-outline-brand increase-qty px-2 py-0 fw-bold">+</button>')
            .append('<button type="button" class="btn btn-sm btn-outline-danger remove-item ms-1 px-2 py-0 fw-bold">×</button>');

        return $('<div class="cart-entry d-flex justify-content-between align-items-center mb-3 border-bottom pb-2"></div>')
            .data('name', item.name)
            .append($info)
            .append($controls);
    }

    function renderCart() {
        const $container = $('#cart-items');
        $container.find('.cart-entry').remove();
        const keys = Object.keys(cart);
        let subtotal = 0;
        const method = getOrderMethod();

        if (keys.length === 0) {
            $('#empty-cart-msg').fadeIn(200);
            $('#fee-label').text(method === 'pickup' ? 'Pickup fee:' : 'Delivery fee:');
            $('#delivery-fee').text(method === 'pickup' ? 'Free' : '0 ₸');
            $('#cart-total').text('0 ₸');
            showPromoNote(0);
            saveCart();
            return;
        }
        $('#empty-cart-msg').hide();

        $.each(keys, function (i, key) {
            const item = cart[key];
            subtotal += item.price * item.qty;
            $container.append(buildCartEntry(item));
        });

        const discount = Math.round(subtotal * discountPct / 100);
        const fee = method === 'delivery' ? DELIVERY_FEE : 0;
        const grandTotal = subtotal - discount + fee;

        $('#fee-label').text(method === 'pickup' ? 'Pickup fee:' : 'Delivery fee:');
        $('#delivery-fee').text(method === 'pickup' ? 'Free (0 ₸)' : fee.toLocaleString('en-US') + ' ₸');
        $('#cart-total').text(grandTotal.toLocaleString('en-US') + ' ₸');
        showPromoNote(discount);
        saveCart();
    }

    // ---------- 5. ДОБАВЛЕНИЕ / ИЗМЕНЕНИЕ КОЛИЧЕСТВА ----------
    function addDish(name, price) {
        if (cart[name] && cart[name].qty >= MAX_QTY) {
            showCheckoutMessage('alert-warning', 'Limit reached', 'Maximum ' + MAX_QTY + ' portions per dish.');
            return false;
        }
        if (cart[name]) cart[name].qty += 1;
        else cart[name] = { name: name, price: price, qty: 1 };
        renderCart();
        return true;
    }

    $('main').on('click', '.add-to-cart', function (e) {
        e.preventDefault();
        const $card = $(this).closest('.premium-card');
        const name = $card.find('h3').text().trim();
        const price = parseInt($card.find('.price-tag').text().replace(/[^\d]/g, ''), 10);
        if (!name || isNaN(price)) return;
        if (!addDish(name, price)) return;

        const $btn = $(this);
        clearTimeout($btn.data('flashTimer'));
        if (!$btn.data('origText')) $btn.data('origText', $btn.text());
        $btn.text('✓ Added').addClass('btn-brand').removeClass('btn-outline-brand');
        $btn.data('flashTimer', setTimeout(function () {
            $btn.text($btn.data('origText')).removeClass('btn-brand').addClass('btn-outline-brand');
        }, 1000));
    });

    $('#cart-items').on('click', '.increase-qty', function () {
        const name = $(this).closest('.cart-entry').data('name');
        if (cart[name]) addDish(name, cart[name].price);
    });
    $('#cart-items').on('click', '.decrease-qty', function () {
        const name = $(this).closest('.cart-entry').data('name');
        if (!cart[name]) return;
        cart[name].qty -= 1;
        if (cart[name].qty <= 0) delete cart[name];
        renderCart();
    });
    $('#cart-items').on('click', '.remove-item', function () {
        const name = $(this).closest('.cart-entry').data('name');
        if (cart[name]) { delete cart[name]; renderCart(); }
    });

    // ---------- 6. ДОСТАВКА / САМОВЫВОЗ И СПОСОБ ОПЛАТЫ ----------
    $('input[name="order-method"]').on('change', function () {
        const isPickup = getOrderMethod() === 'pickup';
        $('#delivery-address-fields').toggleClass('d-none', isPickup);
        $('#pickup-note').toggleClass('d-none', !isPickup);
        if (isPickup) {
            clearError($('#delivery-street'), false);
            clearError($('#delivery-apt'), false);
            clearError($('#delivery-floor'), false);
        }
        renderCart();
    });

    $('#payment-methods').on('change', 'input[name="payment-method"]', function () {
        $('#payment-methods .payment-box, #payment-methods .payment-pill').removeClass('active');
        $(this).closest('.payment-box, .payment-pill').addClass('active');
    });

    // ---------- 7. ПРОМОКОД (если присутствует в DOM) ----------
    function applyPromoCode() {
        const $input = $('#promo-input');
        const $result = $('#promo-result');
        if (!$input.length) return;
        const code = ($input.val() || '').trim().toUpperCase();

        if (code === '') {
            discountPct = 0; renderCart();
            $input.removeClass('is-valid').addClass('is-invalid');
            $result.html('<span class="text-danger">Please enter a promo code.</span>');
        } else if (!/^[A-Z0-9]{3,15}$/.test(code)) {
            discountPct = 0; renderCart();
            $input.removeClass('is-valid').addClass('is-invalid');
            $result.html('<span class="text-danger">Promo code must be 3–15 letters or digits.</span>');
        } else if (Object.prototype.hasOwnProperty.call(PROMOS, code)) {
            discountPct = PROMOS[code];
            $input.val(code).removeClass('is-invalid').addClass('is-valid');
            renderCart();
        } else {
            discountPct = 0; renderCart();
            $input.removeClass('is-valid').addClass('is-invalid');
            $result.html('<span class="text-danger">Invalid promo code (try NESIBE10 or SALE10).</span>');
        }
    }
    $('#promo-btn').on('click', function (e) {
        e.preventDefault();
        applyPromoCode();
    });
    $('#promo-input').on('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            applyPromoCode();
        }
    }).on('input', function () {
        $(this).removeClass('is-invalid is-valid');
        $('#promo-result').empty();
        if (discountPct !== 0) { discountPct = 0; renderCart(); }
    });

    // ---------- 8. ВАЛИДАЦИЯ ДОСТАВКИ И CHECKOUT ----------
    const deliveryValidators = {
        'delivery-street': validateStreet,
        'delivery-apt': validateApt,
        'delivery-floor': validateFloor,
        'delivery-phone': validatePhone
    };

    function validateDeliveryField($field, showValidState) {
        const validator = deliveryValidators[$field.attr('id')];
        if (!validator) return true;
        const val = $field.val();
        const err = validator(val);
        if (err) {
            showError($field, err);
            return false;
        }
        clearError($field, showValidState && val.trim() !== '');
        return true;
    }

    $('#delivery-street, #delivery-apt, #delivery-floor')
        .on('input', function () {
            const $field = $(this);
            if ($field.hasClass('is-invalid') || $field.hasClass('is-valid')) {
                validateDeliveryField($field, true);
            }
        })
        .on('blur', function () {
            const $field = $(this);
            if ($field.val().trim() !== '' || $field.hasClass('is-invalid')) {
                validateDeliveryField($field, true);
            }
        });

    $('#delivery-phone')
        .on('focus', function () {
            if (!$(this).val().trim()) {
                $(this).val('+7 ');
            }
        })
        .on('keydown', function (e) {
            if ((e.key === 'Backspace' || e.key === 'Delete') && $(this).val().length <= 3) {
                e.preventDefault();
                $(this).val('+7 ');
            }
        })
        .on('input', function () {
            const $field = $(this);
            $field.val(formatKzPhone($field.val()));
            if ($field.hasClass('is-invalid') || $field.hasClass('is-valid')) {
                validateDeliveryField($field, true);
            }
        })
        .on('blur', function () {
            const $field = $(this);
            if ($field.val().trim() === '+7') {
                $field.val('');
            }
            if ($field.val().trim() !== '' || $field.hasClass('is-invalid')) {
                validateDeliveryField($field, true);
            }
        });

    function showCheckoutMessage(type, title, text) {
        const $alert = $('<div class="alert checkout-alert mt-3"></div>')
            .addClass(type).hide()
            .append($('<h6 class="alert-heading fw-bold mb-1"></h6>').text(title))
            .append($('<small></small>').text(text));
        $('#checkout-message').empty().append($alert);
        $alert.slideDown(300);
    }

    $('#checkout-btn').on('click', function (e) {
        e.preventDefault();

        if (Object.keys(cart).length === 0) {
            showCheckoutMessage('alert-warning', 'Your cart is empty!', 'Please add dishes to your order.');
            return;
        }

        const isPickup = getOrderMethod() === 'pickup';
        const $fields = isPickup
            ? [$('#delivery-phone')]
            : [$('#delivery-street'), $('#delivery-apt'), $('#delivery-floor'), $('#delivery-phone')];

        let firstInvalid = null;
        $.each($fields, function (i, $f) {
            $f.val($f.val().trim());
            if (!validateDeliveryField($f, true) && !firstInvalid) {
                firstInvalid = $f;
            }
        });

        if (firstInvalid) {
            firstInvalid.trigger('focus');
            return;
        }

        const totalText = $('#cart-total').text();
        const count = cartCount();
        const phone = $('#delivery-phone').val().trim();
        const payment = getPaymentMethod();
        let fulfillmentSummary = '';

        if (isPickup) {
            fulfillmentSummary = 'Pickup at Uly dala 41 (ready in ~30 min).';
        } else {
            let address = $('#delivery-street').val().trim();
            const apt = $('#delivery-apt').val().trim();
            const floor = $('#delivery-floor').val().trim();
            if (apt) address += ', apt. ' + apt;
            if (floor) address += ', floor ' + floor;
            fulfillmentSummary = 'Delivery address: ' + address + '.';
        }

        showCheckoutMessage(
            'alert-success',
            'Order & Payment Confirmed!',
            'Items: ' + count + ', total: ' + totalText + ' via ' + payment + '. ' +
            fulfillmentSummary + ' Our manager will call you at ' + phone + ' to confirm.'
        );

        cart = {};
        discountPct = 0;
        if ($('#promo-input').length) {
            $('#promo-input').val('').removeClass('is-valid is-invalid');
            $('#promo-result').empty();
        }
        $.each([$('#delivery-street'), $('#delivery-apt'), $('#delivery-floor'), $('#delivery-phone')], function (i, $f) {
            $f.val('');
            clearError($f, false);
        });
        renderCart();
    });

    // ---------- INIT ----------
    loadCart();
    renderCart();
    applyFilter();
});