// Cart, Delivery/Pickup & Online Payment Logic for Nesibe Ethnic Cafe
(function () {
    const DELIVERY_COST = 1000;
    let cart = [];
    let discountPercent = 0;

    function formatPrice(num) {
        return num.toLocaleString('ru-RU') + ' ₸';
    }

    function getOrderMethod() {
        const checked = document.querySelector('input[name="orderMethod"]:checked');
        return checked ? checked.value : 'delivery';
    }

    function getSelectedPayment() {
        const checked = document.querySelector('input[name="paymentMethod"]:checked');
        return checked ? checked.value : 'Kaspi.kz / QR';
    }

    function updateTotals() {
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
        const discount = Math.round(subtotal * (discountPercent / 100));
        const method = getOrderMethod();
        const delivery = (subtotal > 0 && method === 'delivery') ? DELIVERY_COST : 0;
        const total = Math.max(0, subtotal - discount + delivery);

        const count = cart.reduce((sum, item) => sum + item.qty, 0);
        document.getElementById('cartCountBadge').textContent = count + (count === 1 ? ' item' : ' items');
        document.getElementById('cartSubtotal').textContent = formatPrice(subtotal);
        document.getElementById('cartDiscount').textContent = '-' + formatPrice(discount);
        document.getElementById('fulfillmentFeeLabel').textContent =
            method === 'pickup' ? 'Pickup Fee:' : 'Delivery Fee:';
        document.getElementById('cartDeliveryFee').textContent =
            method === 'pickup' ? 'Free (0 ₸)' : formatPrice(delivery);
        document.getElementById('cartTotal').textContent = formatPrice(total);
    }

    function renderCart() {
        const container = document.getElementById('cartItemsContainer');
        if (!container) return;

        if (cart.length === 0) {
            container.innerHTML = '<p class="text-muted text-center py-3 mb-0">Your cart is empty. Click «Add to Order» on any dish or drink above.</p>';
            updateTotals();
            return;
        }

        let html = '<div class="list-group rounded-4 shadow-sm">';
        cart.forEach((item, idx) => {
            html +=
                '<div class="list-group-item d-flex justify-content-between align-items-center flex-wrap gap-2 py-3">' +
                '<div>' +
                '<strong class="text-brand">' + item.name + '</strong>' +
                '<div class="small text-muted">' + formatPrice(item.price) + ' each</div>' +
                '</div>' +
                '<div class="d-flex align-items-center gap-2">' +
                '<button type="button" class="btn btn-sm btn-outline-secondary rounded-circle px-2 cart-dec" data-idx="' + idx + '">−</button>' +
                '<span class="fw-bold px-2">' + item.qty + '</span>' +
                '<button type="button" class="btn btn-sm btn-outline-secondary rounded-circle px-2 cart-inc" data-idx="' + idx + '">+</button>' +
                '<span class="fw-bold ms-3" style="min-width: 85px; text-align: right;">' + formatPrice(item.price * item.qty) + '</span>' +
                '<button type="button" class="btn btn-sm btn-link text-danger text-decoration-none cart-del" data-idx="' + idx + '">✕</button>' +
                '</div>' +
                '</div>';
        });
        html += '</div>';
        container.innerHTML = html;
        updateTotals();
    }

    function initCart() {
        if (!document.getElementById('cart-section')) return;

        // Add item buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const name = btn.dataset.name;
                const price = Number(btn.dataset.price);
                const existing = cart.find(i => i.name === name);
                if (existing) {
                    existing.qty += 1;
                } else {
                    cart.push({ name, price, qty: 1 });
                }
                renderCart();

                const orig = btn.textContent;
                btn.textContent = '✓ Added';
                btn.classList.add('btn-success');
                setTimeout(() => {
                    btn.textContent = orig;
                    btn.classList.remove('btn-success');
                }, 900);
            });
        });

        // Quantity +/- and remove
        document.getElementById('cartItemsContainer').addEventListener('click', function (e) {
            const idx = e.target.dataset.idx;
            if (idx === undefined) return;
            const i = Number(idx);

            if (e.target.classList.contains('cart-inc')) {
                cart[i].qty += 1;
            } else if (e.target.classList.contains('cart-dec')) {
                cart[i].qty -= 1;
                if (cart[i].qty <= 0) cart.splice(i, 1);
            } else if (e.target.classList.contains('cart-del')) {
                cart.splice(i, 1);
            }
            renderCart();
        });

        // Toggle Delivery vs Pickup
        document.querySelectorAll('input[name="orderMethod"]').forEach(radio => {
            radio.addEventListener('change', function () {
                const isPickup = getOrderMethod() === 'pickup';
                document.getElementById('deliveryAddressGroup').classList.toggle('d-none', isPickup);
                document.getElementById('pickupInfoGroup').classList.toggle('d-none', !isPickup);
                updateTotals();
            });
        });

        // Online Payment Pill Highlight
        document.querySelectorAll('#paymentMethodsGroup .payment-pill').forEach(pill => {
            pill.addEventListener('click', function () {
                document.querySelectorAll('#paymentMethodsGroup .payment-pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
            });
        });

        // Promo code
        document.getElementById('applyPromoBtn').addEventListener('click', function () {
            const code = document.getElementById('promoInput').value.trim().toUpperCase();
            const status = document.getElementById('promoStatus');
            if (code === 'NESIBE10') {
                discountPercent = 10;
                status.className = 'small mt-1 text-success fw-semibold';
                status.textContent = '✓ Promo code NESIBE10 applied (10% off)!';
            } else {
                discountPercent = 0;
                status.className = 'small mt-1 text-danger';
                status.textContent = 'Invalid promo code. Try NESIBE10.';
            }
            updateTotals();
        });

        // Clear cart
        document.getElementById('clearCartBtn').addEventListener('click', function () {
            cart = [];
            discountPercent = 0;
            document.getElementById('promoInput').value = '';
            document.getElementById('promoStatus').textContent = '';
            document.getElementById('checkoutMessage').innerHTML = '';
            renderCart();
        });

        // Checkout validation & confirmation
        document.getElementById('checkoutBtn').addEventListener('click', function () {
            const msgBox = document.getElementById('checkoutMessage');
            if (cart.length === 0) {
                msgBox.innerHTML = '<div class="alert alert-warning py-2 small mb-0">Please add at least one item to your cart first.</div>';
                return;
            }

            const method = getOrderMethod();
            const address = document.getElementById('deliveryAddress').value.trim();
            const phone = document.getElementById('orderPhone').value.trim();
            const phoneDigits = phone.replace(/\D/g, '');
            const payment = getSelectedPayment();

            if (method === 'delivery' && address.length < 5) {
                msgBox.innerHTML = '<div class="alert alert-danger py-2 small mb-0">Please enter your delivery address in Astana.</div>';
                document.getElementById('deliveryAddress').focus();
                return;
            }

            if (phoneDigits.length !== 11 || !phoneDigits.startsWith('77')) {
                msgBox.innerHTML = '<div class="alert alert-danger py-2 small mb-0">Please enter a valid Kazakhstan phone number (+7 7XX ...).</div>';
                document.getElementById('orderPhone').focus();
                return;
            }

            const totalText = document.getElementById('cartTotal').textContent;
            const summaryText = method === 'pickup'
                ? 'Pickup at Uly dala 41 (ready in ~30 min)'
                : 'Delivery to ' + address;

            msgBox.innerHTML =
                '<div class="alert alert-success py-3 small mb-0">' +
                '<strong>Order Confirmed!</strong><br>' +
                summaryText + '<br>' +
                'Payment: <strong>' + payment + '</strong> (' + totalText + ')<br>' +
                'Confirmation sent to <strong>' + phone + '</strong>.' +
                '</div>';

            cart = [];
            discountPercent = 0;
            renderCart();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCart);
    } else {
        initCart();
    }
})();