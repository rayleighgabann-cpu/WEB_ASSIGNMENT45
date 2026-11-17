/* ==========================================================================
   Nesibe Ethnic Cafe — Reviews, Booking & Careers Logic (js/app.js)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', function () {
    function getTodayISO() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    const todayISO = getTodayISO();

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function setFieldError(input, message) {
        if (!input) return false;
        const next = input.nextElementSibling;
        if (next && next.classList.contains('error-msg')) {
            next.remove();
        }
        if (message) {
            input.classList.remove('is-valid');
            input.classList.add('is-invalid');
            const err = document.createElement('div');
            err.className = 'error-msg text-danger mt-1';
            err.textContent = message;
            input.insertAdjacentElement('afterend', err);
            return false;
        } else {
            input.classList.remove('is-invalid');
            if (String(input.value || '').trim() !== '') {
                input.classList.add('is-valid');
            } else {
                input.classList.remove('is-valid');
            }
            return true;
        }
    }

    function clearFieldState(input) {
        if (!input) return;
        input.classList.remove('is-valid', 'is-invalid');
        const next = input.nextElementSibling;
        if (next && next.classList.contains('error-msg')) {
            next.remove();
        }
    }

    function formatKzPhone(raw) {
        let digits = raw.replace(/\D/g, '');
        if (!digits) return '';
        if (digits[0] === '8') digits = '7' + digits.slice(1);
        if (digits[0] !== '7') digits = '7' + digits;
        digits = digits.slice(0, 11);

        if (digits.length === 1) return '+7 ';
        if (digits.length <= 4) return '+7 (' + digits.slice(1);
        if (digits.length <= 7) return '+7 (' + digits.slice(1, 4) + ') ' + digits.slice(4);
        if (digits.length <= 9) return '+7 (' + digits.slice(1, 4) + ') ' + digits.slice(4, 7) + '-' + digits.slice(7);
        return '+7 (' + digits.slice(1, 4) + ') ' + digits.slice(4, 7) + '-' + digits.slice(7, 9) + '-' + digits.slice(9, 11);
    }

    function isValidPhone(val) {
        const digits = val.replace(/\D/g, '');
        if (digits.length !== 11 || !(digits.startsWith('77') || digits.startsWith('76'))) {
            return false;
        }
        return !/^(\d)\1{6}$/.test(digits.slice(-7));
    }

    function isValidEmail(val) {
        return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(val.trim());
    }

    function isGibberish(str) {
        const clean = str.trim().toLowerCase();
        if (/(.)\1{3,}/i.test(clean)) return true;
        if (/^(asdf|qwer|zxcv|hjkl|1234|test|dfgh|cvbn)+$/i.test(clean.replace(/\s+/g, ''))) return true;
        return false;
    }

    function countLetters(str) {
        const matches = str.match(/[a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ]/g);
        return matches ? matches.length : 0;
    }

    function isValidPersonName(val) {
        const trimmed = val.trim();
        if (trimmed.length < 2 || trimmed.length > 60) return false;
        if (!/^[a-zA-Zа-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ0-9\s."'-]+$/.test(trimmed)) return false;
        if (isGibberish(trimmed)) return false;
        return countLetters(trimmed) >= 2;
    }

    function attachPhoneMask(phoneInput, validateFn) {
        if (!phoneInput) return;

        phoneInput.addEventListener('focus', function () {
            if (!this.value.trim()) {
                this.value = '+7 ';
            }
        });

        phoneInput.addEventListener('keydown', function (e) {
            if ((e.key === 'Backspace' || e.key === 'Delete') && this.value.length <= 3) {
                e.preventDefault();
                this.value = '+7 ';
            }
        });

        phoneInput.addEventListener('input', function () {
            this.value = formatKzPhone(this.value);
            if (this.classList.contains('is-invalid') || this.classList.contains('is-valid')) {
                validateFn();
            }
        });

        phoneInput.addEventListener('blur', function () {
            if (this.value.trim() === '+7') {
                this.value = '';
            }
            if (this.value.trim() !== '' || this.classList.contains('is-invalid')) {
                validateFn();
            }
        });
    }

    /* ----------------------------------------------------------------------
       1. Guest Reviews Form & List (about.html)
       ---------------------------------------------------------------------- */
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.noValidate = true;

        const STORAGE_KEY = 'nesibe_guest_reviews_v1';
        const MIN_VISIT_DATE = '2015-01-01';
        const ALLOWED_AREAS = ['Main Hall', 'Terrace', 'VIP Room'];
        const DEFAULT_REVIEWS = [
            {
                name: 'Marat K.',
                area: 'Main Hall',
                date: '15.02.2024',
                rating: 5,
                text: "The besbarmak here reminds me of my grandmother's cooking. Authentic flavors and heartwarming hospitality!"
            },
            {
                name: 'Saule B.',
                area: 'VIP Room',
                date: '28.03.2024',
                rating: 5,
                text: 'Hosted a business dinner here. The staff was incredibly attentive, and foreign colleagues loved the national drinks.'
            }
        ];

        const revName = document.getElementById('rev-name');
        const revDate = document.getElementById('rev-date');
        const revArea = document.getElementById('rev-area');
        const revRating = document.getElementById('rev-rating');
        const revText = document.getElementById('rev-text');
        const charCount = document.getElementById('charCount');
        const reviewsList = document.getElementById('reviews-list');
        const reviewStatus = document.getElementById('review-status');

        if (revDate) {
            revDate.setAttribute('min', MIN_VISIT_DATE);
            revDate.setAttribute('max', todayISO);
            if (!revDate.value) revDate.value = todayISO;
        }

        function formatDisplayDate(isoDate) {
            if (!isoDate || !isoDate.includes('-')) return isoDate;
            const parts = isoDate.split('-');
            return `${parts[2]}.${parts[1]}.${parts[0]}`;
        }

        function renderStars(rating) {
            const safeRating = Math.min(5, Math.max(1, Number(rating) || 5));
            return `${'★'.repeat(safeRating)}${'☆'.repeat(5 - safeRating)} ${safeRating}/5`;
        }

        function loadReviews() {
            try {
                const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
                if (Array.isArray(saved) && saved.length > 0) return saved;
            } catch (e) {}
            return DEFAULT_REVIEWS.slice();
        }

        function saveReviews(list) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
            } catch (e) {}
        }

        function renderReviews(list) {
            if (!reviewsList) return;
            reviewsList.innerHTML = list.map(function (rev) {
                return `
                    <div class="static-block">
                        <h3 class="mb-1">${escapeHtml(rev.name)} — ${escapeHtml(rev.area)}, ${escapeHtml(rev.date)}</h3>
                        <div class="small fw-bold mb-2" style="color: #F5C518;">${renderStars(rev.rating)}</div>
                        <p class="mb-0 text-muted">"${escapeHtml(rev.text)}"</p>
                    </div>
                `;
            }).join('');
        }

        let reviewsData = loadReviews();
        renderReviews(reviewsData);

        window.addEventListener('storage', function (e) {
            if (e.key === STORAGE_KEY) {
                reviewsData = loadReviews();
                renderReviews(reviewsData);
            }
        });

        function validateRevName() {
            const val = revName.value.trim();
            if (!val) return setFieldError(revName, 'Please enter your name.');
            if (!isValidPersonName(val)) return setFieldError(revName, 'Please enter a valid name (letters only, min 2 characters).');
            return setFieldError(revName, '');
        }

        function validateRevDate() {
            const val = revDate.value;
            const currentToday = getTodayISO();
            if (!val) return setFieldError(revDate, 'Please select your visit date.');
            if (val > currentToday) return setFieldError(revDate, 'Visit date cannot be in the future.');
            if (val < MIN_VISIT_DATE) return setFieldError(revDate, 'Date cannot be earlier than 2015.');
            return setFieldError(revDate, '');
        }

        function validateRevArea() {
            if (!ALLOWED_AREAS.includes(revArea.value)) return setFieldError(revArea, 'Please select a valid area.');
            return setFieldError(revArea, '');
        }

        function validateRevRating() {
            const raw = revRating.value.trim();
            const num = Number(raw);
            if (!raw || !Number.isInteger(num) || num < 1 || num > 5) {
                return setFieldError(revRating, 'Enter a whole rating from 1 to 5.');
            }
            return setFieldError(revRating, '');
        }

        function validateRevText() {
            const val = revText.value.trim();
            if (!val) return setFieldError(revText, 'Please write your review.');
            if (val.length < 10) return setFieldError(revText, 'Review must be at least 10 characters.');
            if (val.length > 500) return setFieldError(revText, 'Review cannot exceed 500 characters.');
            if (countLetters(val) < 5 || isGibberish(val)) {
                return setFieldError(revText, 'Please write a meaningful review about your experience.');
            }
            return setFieldError(revText, '');
        }

        revName.addEventListener('input', function () {
            if (this.classList.contains('is-invalid') || this.classList.contains('is-valid')) validateRevName();
        });
        revName.addEventListener('blur', validateRevName);
        revDate.addEventListener('change', validateRevDate);
        revArea.addEventListener('change', validateRevArea);
        revRating.addEventListener('input', validateRevRating);
        revRating.addEventListener('blur', validateRevRating);

        revText.addEventListener('input', function () {
            if (charCount) charCount.textContent = this.value.length;
            if (this.classList.contains('is-invalid') || this.classList.contains('is-valid')) {
                validateRevText();
            }
        });
        revText.addEventListener('blur', validateRevText);

        reviewForm.addEventListener('submit', function (e) {
            e.preventDefault();
            if (reviewStatus) reviewStatus.innerHTML = '';

            const ok = [
                validateRevName(),
                validateRevDate(),
                validateRevArea(),
                validateRevRating(),
                validateRevText()
            ].every(Boolean);

            if (!ok) {
                if (reviewStatus) {
                    reviewStatus.innerHTML = '<div class="alert alert-danger rounded-4 py-2 px-3 small mb-0">Please fix the highlighted fields above before submitting.</div>';
                }
                const firstErr = reviewForm.querySelector('.is-invalid');
                if (firstErr) firstErr.focus();
                return;
            }

            reviewsData.unshift({
                name: revName.value.trim(),
                area: revArea.value,
                date: formatDisplayDate(revDate.value),
                rating: parseInt(revRating.value, 10),
                text: revText.value.trim()
            });

            saveReviews(reviewsData);
            renderReviews(reviewsData);

            reviewForm.reset();
            if (revDate) revDate.value = getTodayISO();
            if (charCount) charCount.textContent = '0';
            [revName, revDate, revArea, revRating, revText].forEach(clearFieldState);

            if (reviewStatus) {
                reviewStatus.innerHTML = '<div class="alert alert-success rounded-4 py-2 px-3 small mb-0">Thank you! Your review has been published below.</div>';
            }
        });

        reviewForm.addEventListener('reset', function () {
            setTimeout(function () {
                if (revDate) revDate.value = getTodayISO();
                if (charCount) charCount.textContent = '0';
                if (reviewStatus) reviewStatus.innerHTML = '';
                [revName, revDate, revArea, revRating, revText].forEach(clearFieldState);
            }, 0);
        });
    }

    /* ----------------------------------------------------------------------
       2. Booking Form (booking.html)
       ---------------------------------------------------------------------- */
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.noValidate = true;

        const bkName = document.getElementById('bk-name');
        const bkEmail = document.getElementById('bk-email');
        const bkPhone = document.getElementById('bk-phone');
        const bkSeat = document.getElementById('bk-seat');
        const bkDate = document.getElementById('bk-date');
        const bkTime = document.getElementById('bk-time');
        const bkGuests = document.getElementById('bk-guests');
        const bkNotes = document.getElementById('bk-notes');

        const SPACE_LIMITS = {
            'Main Hall & Terrace': { min: 1, max: 10, msg: 'Main Hall tables fit 1 to 10 guests. Choose VIP or Banquet Hall for larger groups.' },
            'Private VIP Cabins': { min: 4, max: 14, msg: 'VIP Cabins are designed for 4 to 14 guests.' },
            'Banquet & Yurt Halls': { min: 15, max: 50, msg: 'Banquet & Yurt Halls are for 15 to 50 guests.' }
        };

        function populateTimeSlots() {
            if (!bkTime) return;
            const prevValue = bkTime.value;
            bkTime.innerHTML = '';

            const defaultOpt = document.createElement('option');
            defaultOpt.value = '';
            defaultOpt.textContent = 'Select time...';
            bkTime.appendChild(defaultOpt);

            const now = new Date();
            const isToday = bkDate && bkDate.value === getTodayISO();
            const currentMinutes = now.getHours() * 60 + now.getMinutes();

            for (let h = 10; h <= 22; h++) {
                ['00', '30'].forEach(function (m) {
                    const slot = `${String(h).padStart(2, '0')}:${m}`;
                    const slotMinutes = h * 60 + Number(m);
                    const opt = document.createElement('option');
                    opt.value = slot;
                    opt.textContent = slot;
                    if (isToday && slotMinutes <= currentMinutes) {
                        opt.disabled = true;
                    }
                    bkTime.appendChild(opt);
                });
            }

            if (prevValue) {
                const matching = Array.from(bkTime.options).find(o => o.value === prevValue && !o.disabled);
                bkTime.value = matching ? prevValue : '';
            }
        }

        function syncGuestBounds() {
            if (!bkGuests || !bkSeat) return;
            const rule = SPACE_LIMITS[bkSeat.value];
            bkGuests.min = rule ? String(rule.min) : '1';
            bkGuests.max = rule ? String(rule.max) : '50';
        }

        if (bkDate) {
            bkDate.setAttribute('min', todayISO);
            if (!bkDate.value) bkDate.value = todayISO;
        }
        populateTimeSlots();
        syncGuestBounds();

        function validateBkName() {
            const val = bkName.value.trim();
            if (!val) return setFieldError(bkName, 'Please enter your full name.');
            if (!isValidPersonName(val)) return setFieldError(bkName, 'Enter your full name (at least 2 letters).');
            return setFieldError(bkName, '');
        }

        function validateBkEmail() {
            const val = bkEmail.value.trim();
            if (!val) return setFieldError(bkEmail, 'Please enter your email address.');
            if (!isValidEmail(val)) return setFieldError(bkEmail, 'Enter a valid email address (e.g. name@example.com).');
            return setFieldError(bkEmail, '');
        }

        function validateBkPhone() {
            const val = bkPhone.value.trim();
            if (!val || val === '+7') return setFieldError(bkPhone, 'Please enter your phone number.');
            if (!isValidPhone(val)) return setFieldError(bkPhone, 'Enter a valid Kazakhstan number: +7 (7XX) XXX-XX-XX.');
            return setFieldError(bkPhone, '');
        }

        function validateBkSeat() {
            if (!bkSeat.value || !Object.prototype.hasOwnProperty.call(SPACE_LIMITS, bkSeat.value)) {
                return setFieldError(bkSeat, 'Please choose a hall or VIP cabin.');
            }
            return setFieldError(bkSeat, '');
        }

        function validateBkDate() {
            const currentToday = getTodayISO();
            if (!bkDate.value || bkDate.value < currentToday) {
                return setFieldError(bkDate, 'Select today or a future date.');
            }
            return setFieldError(bkDate, '');
        }

        function validateBkTime() {
            if (!bkTime.value) return setFieldError(bkTime, 'Please select a reservation time.');
            const selectedOpt = bkTime.options[bkTime.selectedIndex];
            if (selectedOpt && selectedOpt.disabled) {
                return setFieldError(bkTime, 'Selected time has already passed today. Choose a later slot.');
            }
            return setFieldError(bkTime, '');
        }

        function validateBkGuests() {
            const raw = bkGuests.value.trim();
            const guests = Number(raw);
            if (!raw || !Number.isInteger(guests) || guests < 1 || guests > 50) {
                return setFieldError(bkGuests, 'Enter guest count from 1 to 50.');
            }
            const rule = SPACE_LIMITS[bkSeat.value];
            if (rule && (guests < rule.min || guests > rule.max)) {
                return setFieldError(bkGuests, rule.msg);
            }
            return setFieldError(bkGuests, '');
        }

        function validateBkNotes() {
            if (!bkNotes) return true;
            const val = bkNotes.value.trim();
            if (!val) {
                clearFieldState(bkNotes);
                return true;
            }
            if (val.length > 300) return setFieldError(bkNotes, 'Notes cannot exceed 300 characters.');
            if (isGibberish(val)) return setFieldError(bkNotes, 'Please enter valid notes or leave this field empty.');
            return setFieldError(bkNotes, '');
        }

        attachPhoneMask(bkPhone, validateBkPhone);

        bkName.addEventListener('input', function () {
            if (this.classList.contains('is-invalid') || this.classList.contains('is-valid')) validateBkName();
        });
        bkName.addEventListener('blur', validateBkName);

        bkEmail.addEventListener('input', function () {
            if (this.classList.contains('is-invalid') || this.classList.contains('is-valid')) validateBkEmail();
        });
        bkEmail.addEventListener('blur', validateBkEmail);

        bkSeat.addEventListener('change', function () {
            syncGuestBounds();
            validateBkSeat();
            if (bkGuests.value.trim() !== '' || bkGuests.classList.contains('is-invalid')) {
                validateBkGuests();
            }
        });

        bkDate.addEventListener('change', function () {
            validateBkDate();
            populateTimeSlots();
            if (bkTime.classList.contains('is-invalid') || bkTime.value !== '') {
                validateBkTime();
            }
        });

        bkTime.addEventListener('change', validateBkTime);

        bkGuests.addEventListener('input', function () {
            if (this.classList.contains('is-invalid') || this.classList.contains('is-valid')) validateBkGuests();
        });
        bkGuests.addEventListener('blur', validateBkGuests);

        if (bkNotes) {
            bkNotes.addEventListener('input', function () {
                if (this.classList.contains('is-invalid') || this.classList.contains('is-valid')) validateBkNotes();
            });
            bkNotes.addEventListener('blur', validateBkNotes);
        }

        document.querySelectorAll('.select-space-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const space = this.getAttribute('data-space');
                if (bkSeat && space) {
                    bkSeat.value = space;
                    syncGuestBounds();
                    validateBkSeat();
                    if (bkGuests.value.trim() !== '' || bkGuests.classList.contains('is-invalid')) {
                        validateBkGuests();
                    }
                }
            });
        });

        bookingForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const oldAlert = bookingForm.querySelector('.booking-alert');
            if (oldAlert) oldAlert.remove();

            const ok = [
                validateBkName(),
                validateBkEmail(),
                validateBkPhone(),
                validateBkSeat(),
                validateBkDate(),
                validateBkTime(),
                validateBkGuests(),
                validateBkNotes()
            ].every(Boolean);

            if (!ok) {
                const firstErr = bookingForm.querySelector('.is-invalid');
                if (firstErr) firstErr.focus();
                return;
            }

            const alertBox = document.createElement('div');
            alertBox.className = 'booking-alert alert alert-success rounded-4 mt-3 mb-0';
            alertBox.innerHTML = `<strong>Reservation Confirmed!</strong> We have reserved <strong>${escapeHtml(bkSeat.value)}</strong> for <strong>${escapeHtml(bkGuests.value)} guest(s)</strong> on <strong>${escapeHtml(bkDate.value)}</strong> at <strong>${escapeHtml(bkTime.value)}</strong>. Our administrator will call ${escapeHtml(bkPhone.value)} shortly.`;
            bookingForm.appendChild(alertBox);

            bookingForm.reset();
            if (bkDate) bkDate.value = getTodayISO();
            populateTimeSlots();
            syncGuestBounds();
            [bkName, bkEmail, bkPhone, bkSeat, bkDate, bkTime, bkGuests, bkNotes].forEach(clearFieldState);
        });

        bookingForm.addEventListener('reset', function () {
            setTimeout(function () {
                if (bkDate) bkDate.value = getTodayISO();
                populateTimeSlots();
                syncGuestBounds();
                [bkName, bkEmail, bkPhone, bkSeat, bkDate, bkTime, bkGuests, bkNotes].forEach(clearFieldState);
                bookingForm.querySelectorAll('.booking-alert').forEach(el => el.remove());
            }, 0);
        });
    }

    /* ----------------------------------------------------------------------
       3. Careers & Partnership Form (careers.html)
       ---------------------------------------------------------------------- */
    const careerForm = document.getElementById('careerForm');
    if (careerForm) {
        careerForm.noValidate = true;

        const crName = document.getElementById('cr-name');
        const crPhone = document.getElementById('cr-phone');
        const crEmail = document.getElementById('cr-email');
        const crRole = document.getElementById('cr-role');
        const crMessage = document.getElementById('cr-message');

        function validateCrName() {
            const val = crName.value.trim();
            if (!val) return setFieldError(crName, 'Please enter your full name or company name.');
            if (!isValidPersonName(val)) return setFieldError(crName, 'Enter a valid name or company name (at least 2 letters).');
            return setFieldError(crName, '');
        }

        function validateCrPhone() {
            const val = crPhone.value.trim();
            if (!val || val === '+7') return setFieldError(crPhone, 'Please enter your phone number.');
            if (!isValidPhone(val)) return setFieldError(crPhone, 'Enter a valid phone number: +7 (7XX) XXX-XX-XX.');
            return setFieldError(crPhone, '');
        }

        function validateCrEmail() {
            const val = crEmail.value.trim();
            if (!val) return setFieldError(crEmail, 'Please enter your email address.');
            if (!isValidEmail(val)) return setFieldError(crEmail, 'Enter a valid email address.');
            return setFieldError(crEmail, '');
        }

        function validateCrRole() {
            if (!crRole.value) return setFieldError(crRole, 'Please select a position or cooperation type.');
            return setFieldError(crRole, '');
        }

        function validateCrMessage() {
            const msg = crMessage.value.trim();
            if (!msg) return setFieldError(crMessage, 'Please tell us about your experience or proposal.');
            if (msg.length < 15) return setFieldError(crMessage, 'Please provide at least 15 characters.');
            if (msg.length > 500) return setFieldError(crMessage, 'Message cannot exceed 500 characters.');
            if (countLetters(msg) < 5 || isGibberish(msg)) {
                return setFieldError(crMessage, 'Please write a meaningful description of your experience or proposal.');
            }
            return setFieldError(crMessage, '');
        }

        attachPhoneMask(crPhone, validateCrPhone);

        crName.addEventListener('input', function () {
            if (this.classList.contains('is-invalid') || this.classList.contains('is-valid')) validateCrName();
        });
        crName.addEventListener('blur', validateCrName);

        crEmail.addEventListener('input', function () {
            if (this.classList.contains('is-invalid') || this.classList.contains('is-valid')) validateCrEmail();
        });
        crEmail.addEventListener('blur', validateCrEmail);

        crRole.addEventListener('change', validateCrRole);

        crMessage.addEventListener('input', function () {
            if (this.classList.contains('is-invalid') || this.classList.contains('is-valid')) validateCrMessage();
        });
        crMessage.addEventListener('blur', validateCrMessage);

        document.querySelectorAll('.apply-role-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const role = this.getAttribute('data-role');
                if (crRole && role) {
                    crRole.value = role;
                    validateCrRole();
                }
            });
        });

        careerForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const oldAlert = careerForm.querySelector('.career-alert');
            if (oldAlert) oldAlert.remove();

            const ok = [
                validateCrName(),
                validateCrPhone(),
                validateCrEmail(),
                validateCrRole(),
                validateCrMessage()
            ].every(Boolean);

            if (!ok) {
                const firstErr = careerForm.querySelector('.is-invalid');
                if (firstErr) firstErr.focus();
                return;
            }

            const alertBox = document.createElement('div');
            alertBox.className = 'career-alert alert alert-success rounded-4 mt-3 mb-0';
            alertBox.innerHTML = `<strong>Application Sent!</strong> Thank you, <strong>${escapeHtml(crName.value.trim())}</strong>. Your inquiry for <strong>${escapeHtml(crRole.value)}</strong> has been received — we will contact you within 24 hours.`;
            careerForm.appendChild(alertBox);

            careerForm.reset();
            [crName, crPhone, crEmail, crRole, crMessage].forEach(clearFieldState);
        });

        careerForm.addEventListener('reset', function () {
            setTimeout(function () {
                [crName, crPhone, crEmail, crRole, crMessage].forEach(clearFieldState);
                careerForm.querySelectorAll('.career-alert').forEach(el => el.remove());
            }, 0);
        });
    }
});