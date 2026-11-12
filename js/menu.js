// jQuery 3.7.1 — страница Menu: фильтр, поиск, корзина, промокод, оформление заказа.
$(function () {

    // ---------- ДАННЫЕ ----------
    const dynamicDishes = [
        { name: "Kazakh Besbarmak", price: "4,500 ₸", category: "meat", desc: "Traditional boiled meat with handmade noodles." },
        { name: "Baursak (10pcs)", price: "900 ₸", category: "bread", desc: "Golden fried dough pillows." },
        { name: "Shubat (0.5L)", price: "1,200 ₸", category: "drink", desc: "Fermented camel milk." }
    ];
    const PROMOS = { NESIBE10: 10, SALE10: 10 }; // код -> скидка в %
    const PHONE_RE = /^\+?[0-9\s\-()]+$/;

    let cart = {};
    let discountPct = 0;
    const filter = { cat: 'all', query: '' };

    // ---------- ВСПОМОГАТЕЛЬНЫЕ ----------
    function setVisible($el, show) {
        $el.stop(true, true)[show ? 'fadeIn' : 'fadeOut'](200);
    }

    function isValidPhone(value) {
        const digits = value.replace(/\D/g, '');
        return PHONE_RE.test(value) && digits.length >= 10 && digits.length <= 15;
    }

    function showError($field, message) {
        $field.addClass('is-invalid')
            .after($('<div class="error-msg text-danger small mt-1"></div>').text(message));
    }

    function clearError($field) {
        $field.removeClass('is-invalid').next('.error-msg').remove();
    }

    // ---------- 1. ДИНАМИЧЕСКИЕ БЛЮДА ----------
    if ($('#menu-items').length) {
        $.each(dynamicDishes, function (index, dish) {
            const itemHTML = `
                <div class="col-md-6 col-lg-4 mb-4 category-section" data-cat="${dish.category}">
                    <div class="premium-card border-warning">
                        <img src="images/pizza.jpg" class="card-img-top" alt="${dish.name}" style="height:140px">
                        <div class="card-body p-3">
                            <h3 class="h6 text-brand">${dish.name}</h3>
                            <div class="small text-muted mb-2">${dish.desc}</div>
                            <div class="fw-bold small mb-3 price-tag">${dish.price}</div>
                            <button class="btn btn-sm btn-outline-brand w-100 mt-auto add-to-cart">Add</button>
                        </div>
                    </div>
                </div>
            `;
            $('#menu-items').append(itemHTML);
        });
    }

    // ---------- 2. ФИЛЬТР КАТЕГОРИЙ + ПОИСК (работают вместе) ----------
    function applyFilter() {
        const total = $('.premium-card').length;
        let matched = 0;

        $('.premium-card').each(function () {
            const $card = $(this);
            const cardCat = $card.closest('[data-cat]').data('cat');
            const title = $card.find('h3').text().toLowerCase();
            const isMatch = (filter.cat === 'all' || cardCat === filter.cat) && title.includes(filter.query);

            $card.data('match', isMatch);
            if (isMatch) matched++;
            setVisible($card.closest('[class*="col-"]'), isMatch);
        });

        // секции и заголовки показываем, только если в них есть подходящие блюда
        $('.col-lg-8 > .row').each(function () {
            const $row = $(this);
            const hasMatch = $row.find('.premium-card').filter(function () {
                return $(this).data('match');
            }).length > 0;
            setVisible($row, hasMatch);
            setVisible($row.prev('h2.border-bottom'), hasMatch);
        });

        $('#menu-count').text(matched === 0
            ? 'По вашему запросу ничего не найдено'
            : `Показано блюд: ${matched} из ${total}`);
    }

    $('.category-btn').on('click', function (e) {
        e.preventDefault();
        $(this).siblings().removeClass('btn-brand').addClass('btn-outline-brand bg-white');
        $(this).removeClass('btn-outline-brand bg-white').addClass('btn-brand');
        filter.cat = $(this).data('category');
        applyFilter();
    });

    $('#menu-search').on('input', function () {
        filter.query = $(this).val().toLowerCase().trim();
        applyFilter();
    });

    // ---------- 3. КОРЗИНА ----------
    function showPromoNote(discount) {
        if (discountPct === 0) return;
        let text = `Скидка ${discountPct}% применена!`;
        if (discount > 0) text += ` Экономия: ${discount.toLocaleString('ru-RU')} ₸`;
        $('#promo-result').empty().append($('<span class="text-success fw-bold"></span>').text(text));
    }

    function renderCart() {
        const $cartContainer = $('#cart-items');
        $cartContainer.find('.cart-entry').remove();

        const keys = Object.keys(cart);
        let subtotal = 0;

        if (keys.length === 0) {
            $('#empty-cart-msg').fadeIn(200);
            $('#cart-total').text('0 ₸');
            showPromoNote(0);
            return;
        }

        $('#empty-cart-msg').hide();

        $.each(keys, function (i, key) {
            const item = cart[key];
            const itemTotal = item.price * item.qty;
            subtotal += itemTotal;

            const cartItemHTML = `
                <div class="cart-entry d-flex justify-content-between align-items-center mb-3 border-bottom pb-2" data-name="${item.name}">
                    <div>
                        <h6 class="mb-0 text-brand small fw-bold">${item.name}</h6>
                        <small class="text-muted">${item.price.toLocaleString('ru-RU')} ₸ × ${item.qty} = ${itemTotal.toLocaleString('ru-RU')} ₸</small>
                    </div>
                    <div class="d-flex align-items-center gap-1">
                        <button class="btn btn-sm btn-outline-secondary decrease-qty px-2 py-0 fw-bold">-</button>
                        <span class="fw-bold px-1 small">${item.qty}</span>
                        <button class="btn btn-sm btn-outline-brand increase-qty px-2 py-0 fw-bold">+</button>
                        <button class="btn btn-sm btn-outline-danger remove-item ms-1 px-2 py-0 fw-bold">×</button>
                    </div>
                </div>
            `;
            $cartContainer.append(cartItemHTML);
        });

        const discount = Math.round(subtotal * discountPct / 100);
        $('#cart-total').text((subtotal - discount).toLocaleString('ru-RU') + ' ₸');
        showPromoNote(discount);
    }

    // Добавление в корзину (делегирование — работает и для блюд, созданных кодом)
    $('main').on('click', '.add-to-cart', function (e) {
        e.preventDefault();

        const $card = $(this).closest('.premium-card');
        const dishName = $card.find('h3').text().trim();
        const priceNum = parseInt($card.find('.price-tag').text().replace(/[^\d]/g, ''), 10);

        if (!dishName || isNaN(priceNum)) return;

        if (cart[dishName]) {
            cart[dishName].qty += 1;
        } else {
            cart[dishName] = { name: dishName, price: priceNum, qty: 1 };
        }
        renderCart();

        const $btn = $(this);
        const originalText = $btn.text();
        $btn.text('✓ Добавлено').addClass('btn-brand').removeClass('btn-outline-brand').prop('disabled', true);
        setTimeout(function () {
            $btn.text(originalText).removeClass('btn-brand').addClass('btn-outline-brand').prop('disabled', false);
        }, 1000);
    });

    $('#cart-items').on('click', '.increase-qty', function () {
        const name = $(this).closest('.cart-entry').data('name');
        if (cart[name]) {
            cart[name].qty += 1;
            renderCart();
        }
    });

    $('#cart-items').on('click', '.decrease-qty', function () {
        const name = $(this).closest('.cart-entry').data('name');
        if (cart[name]) {
            cart[name].qty -= 1;
            if (cart[name].qty <= 0) delete cart[name];
            renderCart();
        }
    });

    $('#cart-items').on('click', '.remove-item', function () {
        const name = $(this).closest('.cart-entry').data('name');
        if (cart[name]) {
            delete cart[name];
            renderCart();
        }
    });

    // ---------- 4. ПРОМОКОД (скидка реально меняет итог) ----------
    $('#promo-btn').on('click', function (e) {
        e.preventDefault();
        const $input = $('#promo-input');
        const $result = $('#promo-result');
        const code = $input.val().trim().toUpperCase();

        if (code === '') {
            discountPct = 0;
            renderCart();
            $input.addClass('is-invalid');
            $result.html('<span class="text-danger">Введите промокод</span>');
        } else if (Object.prototype.hasOwnProperty.call(PROMOS, code)) {
            discountPct = PROMOS[code];
            $input.removeClass('is-invalid').addClass('is-valid');
            renderCart();
            if (Object.keys(cart).length === 0) {
                $result.html(`<span class="text-success fw-bold">Скидка ${discountPct}% применена!</span>`);
            }
        } else {
            discountPct = 0;
            renderCart();
            $input.addClass('is-invalid');
            $result.html('<span class="text-danger">Неверный промокод</span>');
        }
    });

    $('#promo-input').on('input', function () {
        $(this).removeClass('is-invalid is-valid');
        $('#promo-result').empty();
        if (discountPct !== 0) {
            discountPct = 0;
            renderCart();
        }
    });

    // ---------- 5. ОФОРМЛЕНИЕ ЗАКАЗА (с проверкой адреса и телефона) ----------
    $('#delivery-street, #delivery-phone').on('input', function () {
        clearError($(this));
    });

    function showCheckoutMessage(type, title, text) {
        const $alert = $('<div class="alert checkout-alert mt-3"></div>')
            .addClass(type)
            .hide()
            .append($('<h6 class="alert-heading fw-bold mb-1"></h6>').text(title))
            .append($('<small></small>').text(text));
        $('#checkout-message').empty().append($alert);
        $alert.slideDown(400).delay(4000).slideUp(300, function () { $(this).remove(); });
    }

    $('#checkout-btn').on('click', function (e) {
        e.preventDefault();

        if (Object.keys(cart).length === 0) {
            showCheckoutMessage('alert-warning', 'Ваша корзина пуста!', 'Добавьте блюда в заказ.');
            return;
        }

        const $street = $('#delivery-street');
        const $phone = $('#delivery-phone');
        let isValid = true;

        clearError($street);
        clearError($phone);

        if ($street.val().trim().length < 5) {
            showError($street, 'Укажите улицу и номер дома.');
            isValid = false;
        }
        if (!isValidPhone($phone.val().trim())) {
            showError($phone, 'Введите телефон, например +7 701 123 45 67.');
            isValid = false;
        }
        if (!isValid) return;

        const totalText = $('#cart-total').text();
        const count = Object.keys(cart).reduce(function (sum, key) { return sum + cart[key].qty; }, 0);
        const apt = $('#delivery-apt').val().trim();
        const floor = $('#delivery-floor').val().trim();
        let address = $street.val().trim();
        if (apt) address += ', кв. ' + apt;
        if (floor) address += ', этаж ' + floor;

        showCheckoutMessage('alert-success', 'Заказ успешно оформлен!',
            `Спасибо за заказ в Nesibe Cafe. Позиций: ${count}, итого: ${totalText}. Адрес: ${address}. Менеджер позвонит на ${$phone.val().trim()}.`);

        // новый заказ — с чистого листа
        cart = {};
        discountPct = 0;
        $('#promo-input').val('').removeClass('is-valid is-invalid');
        $('#promo-result').empty();
        $('#delivery-street, #delivery-apt, #delivery-floor, #delivery-phone').val('');
        renderCart();
    });

    // ---------- СТАРТ ----------
    applyFilter();
});