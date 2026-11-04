
// jQuery version: 3.7.1
// This script executes after the DOM is fully loaded using $(function() { ... })
$(function() {

    // Data store for Cart
    let cart = {};

    // 1. CHANGING THE PAGE: Dynamic dishes addition via .append()
    const dynamicDishes = [
        { name: "Kazakh Besbarmak", price: "4,500 ₸", category: "meat", desc: "Traditional boiled meat with handmade noodles." },
        { name: "Baursak (10pcs)", price: "900 ₸", category: "bread", desc: "Golden fried dough pillows." },
        { name: "Shubat (0.5L)", price: "1,200 ₸", category: "drink", desc: "Fermented camel milk." }
    ];

    if ($('#menu-items').length) {
        $.each(dynamicDishes, function(index, dish) {
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

        updateMenuCount();
    }

    function updateMenuCount() {
        const visibleCards = $('.premium-card:visible').length;
        const totalCards = $('.premium-card').length;
        $('#menu-count').text(`Показано блюд: ${visibleCards} из ${totalCards}`);
    }

    // 2. CART RENDER FUNCTION
    function renderCart() {
        const $cartContainer = $('#cart-items');
        $cartContainer.find('.cart-entry').remove();

        const keys = Object.keys(cart);
        let grandTotal = 0;

        if (keys.length === 0) {
            $('#empty-cart-msg').fadeIn(200);
            $('#cart-total').text('0 ₸');
            return;
        }

        $('#empty-cart-msg').hide();

        $.each(keys, function(i, key) {
            const item = cart[key];
            const itemTotal = item.price * item.qty;
            grandTotal += itemTotal;

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

        $('#cart-total').text(grandTotal.toLocaleString('ru-RU') + ' ₸');
    }

    // 3. EVENTS & DELEGATION: Adding items to cart
    $('main').on('click', '.add-to-cart', function(e) {
        e.preventDefault(); // Prevents default button behavior

        const $card = $(this).closest('.premium-card');
        const dishName = $card.find('h3').text().trim();
        const priceStr = $card.find('.price-tag').text().trim();
        const priceNum = parseInt(priceStr.replace(/[^\d]/g, ''));

        if (!dishName || isNaN(priceNum)) return;

        if (cart[dishName]) {
            cart[dishName].qty += 1;
        } else {
            cart[dishName] = {
                name: dishName,
                price: priceNum,
                qty: 1
            };
        }

        renderCart();

        // Button feedback effect (Chaining & .prop())
        const $btn = $(this);
        const originalText = $btn.text();
        $btn.text('✓ Добавлено').addClass('btn-brand').removeClass('btn-outline-brand').prop('disabled', true);
        setTimeout(() => {
            $btn.text(originalText).removeClass('btn-brand').addClass('btn-outline-brand').prop('disabled', false);
        }, 1000);
    });

    // 4. EVENTS & DELEGATION: Cart Quantity Controls (+, -, remove)
    $('#cart-items').on('click', '.increase-qty', function() {
        const name = $(this).closest('.cart-entry').data('name');
        if (cart[name]) {
            cart[name].qty += 1;
            renderCart();
        }
    });

    $('#cart-items').on('click', '.decrease-qty', function() {
        const name = $(this).closest('.cart-entry').data('name');
        if (cart[name]) {
            cart[name].qty -= 1;
            if (cart[name].qty <= 0) {
                delete cart[name];
            }
            renderCart();
        }
    });

    $('#cart-items').on('click', '.remove-item', function() {
        const name = $(this).closest('.cart-entry').data('name');
        if (cart[name]) {
            delete cart[name];
            renderCart();
        }
    });

    // 5. CATEGORY FILTERING (FIXED TO WORK WITH ALL SECTIONS)
    $('.category-btn').on('click', function(e) {
        e.preventDefault();

        // Active state styling using Chaining
        $(this).siblings().removeClass('btn-brand').addClass('btn-outline-brand bg-white');
        $(this).removeClass('btn-outline-brand bg-white').addClass('btn-brand');

        const cat = $(this).data('category'); // 'all', 'pizza', 'burger', 'tea', 'coffee', 'drink'

        if (cat === 'all') {
            $('.category-section, .premium-card').closest('.col-md-6, .col-lg-4, .col-lg-3, .col-md-3, .col-6, .category-section').fadeIn(300);
            $('h2.border-bottom').fadeIn(300);
        } else {
            // Hide all cards/sections first
            $('.category-section').hide();
            $('h2.border-bottom').hide();

            // Show matching category sections
            $(`.category-section[data-cat="${cat}"]`).fadeIn(300);

            // Show corresponding section heading if available
            $(`.category-section[data-cat="${cat}"]`).prev('h2.border-bottom').fadeIn(300);
        }

        $('#menu-search').val('');
        setTimeout(updateMenuCount, 350);
    });

    // 6. LIVE SEARCH
    $('#menu-search').on('keyup', function() {
        const query = $(this).val().toLowerCase().trim();

        if (query === '') {
            $('.category-btn[data-category="all"]').click();
            return;
        }

        $('h2.border-bottom').show();
        $('.category-section').show();

        $('.premium-card').each(function() {
            const title = $(this).find('h3').text().toLowerCase();
            const $cardCol = $(this).closest('.col-md-6, .col-lg-4, .col-lg-3, .col-md-3, .col-6');

            if (title.includes(query)) {
                $cardCol.fadeIn(200);
            } else {
                $cardCol.fadeOut(200);
            }
        });

        setTimeout(updateMenuCount, 250);
    });

    // 7. PROMO CODE
    $('#promo-btn').on('click', function(e) {
        e.preventDefault();
        const $input = $('#promo-input');
        const $result = $('#promo-result');
        const code = $input.val().trim().toUpperCase();

        if (code === '') {
            $input.addClass('is-invalid');
            $result.html('<span class="text-danger">Введите промокод</span>');
        } else if (code === 'NESIBE10' || code === 'SALE10') {
            $input.removeClass('is-invalid').addClass('is-valid');
            $result.html('<span class="text-success fw-bold">Скидка 10% применена!</span>');
        } else {
            $input.addClass('is-invalid');
            $result.html('<span class="text-danger">Неверный промокод</span>');
        }
    });

    $('#promo-input').on('input', function() {
        $(this).removeClass('is-invalid is-valid');
        $('#promo-result').empty();
    });

    // 8. CHECKOUT BUTTON & EFFECTS
    $('#checkout-btn').on('click', function(e) {
        e.preventDefault();

        if (Object.keys(cart).length === 0) {
            alert('Ваша корзина пуста! Добавьте блюда.');
            return;
        }

        const alertHTML = `
            <div class="alert alert-success checkout-alert mt-3" style="display:none;">
                <h6 class="alert-heading fw-bold mb-1">Заказ успешно оформлен!</h6>
                <small>Спасибо за заказ в Nesibe Cafe. Наш менеджер свяжется с вами.</small>
            </div>
        `;

        $('#checkout-message').html(alertHTML);

        $('.checkout-alert').slideDown(400, function() {
            // Callback function after animation completes
            cart = {};
            renderCart();
            setTimeout(() => {
                $('.checkout-alert').slideUp(300, function() {
                    $(this).remove();
                });
            }, 4000);
        });
    });

    // Initialize menu count on page load
    updateMenuCount();
});