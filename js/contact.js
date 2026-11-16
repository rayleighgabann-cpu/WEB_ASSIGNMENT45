// jQuery 3.7.1 — Contact page: FAQ and review form with localStorage persistence.
$(function () {

    // ---------- 1. FAQ: click on question expands / collapses answer ----------
    $('.faq-item h3')
        .attr({ role: 'button', tabindex: 0, 'aria-expanded': 'true' })
        .on('click keydown', function (e) {
            if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
            e.preventDefault();
            const $question = $(this);
            $question.closest('.faq-item').find('p').stop(true, true).slideToggle(250);
            $question.attr('aria-expanded', $question.attr('aria-expanded') === 'true' ? 'false' : 'true');
        });

    // ---------- 2. REVIEW FORM & PERSISTENCE (localStorage) ----------
    const $form = $('#reviewForm');
    const $list = $('#reviews-list');
    $form.prop('noValidate', true); // validation handled in code

    const STORAGE_KEY = 'nesibe_guest_reviews';

    const DEFAULT_REVIEWS = [
        {
            name: 'Marat K.',
            date: '15.02.2024',
            place: 'Main Hall',
            rating: 5,
            text: 'The besbarmak here reminds me of my grandmother\'s cooking. Authentic flavors and heartwarming hospitality!'
        },
        {
            name: 'Saule B.',
            date: '28.03.2024',
            place: 'VIP Room',
            rating: 5,
            text: 'Hosted a business dinner here. The staff was incredibly attentive, and foreign colleagues loved the national drinks.'
        }
    ];

    function getStoredReviews() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved !== null) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (e) {
            console.error('Error reading reviews from localStorage:', e);
        }
        return DEFAULT_REVIEWS.slice();
    }

    function saveStoredReviews(reviewsToSave) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(reviewsToSave));
        } catch (e) {
            console.error('Error saving reviews to localStorage:', e);
        }
    }

    let reviews = getStoredReviews();

    const $nameField = $form.find('input[type="text"]');
    const $dateField = $form.find('input[type="date"]');
    const $placeField = $form.find('select');
    const $ratingField = $form.find('input[type="number"]');
    const $textField = $form.find('textarea');

    const MIN_VISIT_DATE = '2019-01-01';
    const ALLOWED_AREAS = ['Main Hall', 'Terrace', 'VIP Room'];

    function getTodayIso() {
        return new Date().toLocaleDateString('en-CA');
    }

    $dateField.attr({ min: MIN_VISIT_DATE, max: getTodayIso() });

    function showError($field, message) {
        $field.removeClass('is-valid').addClass('is-invalid');
        const $existing = $field.next('.error-msg');
        if ($existing.length) {
            $existing.text(message);
        } else {
            $('<div class="error-msg text-danger small mt-1"></div>')
                .text(message).hide().insertAfter($field).fadeIn(200);
        }
    }

    function clearError($field, markValid) {
        $field.removeClass('is-invalid').next('.error-msg').remove();
        $field.toggleClass('is-valid', Boolean(markValid));
    }

    function checkReviewName(val) {
        const v = val.trim();
        if (!v) return 'Please enter your name.';
        if (v.length < 2 || v.length > 60) return 'Name must be between 2 and 60 characters.';
        if (!/^[A-Za-zА-Яа-яЁёӘәІіҢңҒғҮүҰұҚқӨөҺһ\s.'-]+$/.test(v)) {
            return 'Name can only contain letters, spaces, and hyphens.';
        }
        const letters = v.match(/[A-Za-zА-Яа-яЁёӘәІіҢңҒғҮүҰұҚқӨөҺһ]/g) || [];
        if (letters.length < 2) return 'Name must contain at least 2 letters.';
        return '';
    }

    function checkReviewDate(val) {
        const v = val.trim();
        if (!v) return 'Please select the date of your visit.';
        const today = getTodayIso();
        if (v > today) return 'Visit date cannot be in the future.';
        if (v < MIN_VISIT_DATE) return 'Visit date cannot be earlier than 2019 (cafe opening year).';
        return '';
    }

    function checkReviewArea(val) {
        return ALLOWED_AREAS.indexOf(val) === -1 ? 'Please select a valid cafe area.' : '';
    }

    function checkReviewRating(val) {
        const v = val.trim();
        if (!v) return 'Please enter a rating from 1 to 5.';
        if (!/^[1-5]$/.test(v)) return 'Rating must be a whole number from 1 to 5.';
        return '';
    }

    function checkReviewText(val) {
        const v = val.trim();
        if (!v) return 'Please write your review.';
        if (v.length < 10) return 'Review must contain at least 10 characters.';
        if (v.length > 500) return 'Review cannot exceed 500 characters.';
        const letters = v.match(/[A-Za-zА-Яа-яЁёӘәІіҢңҒғҮүҰұҚқӨөҺһ]/g) || [];
        if (letters.length < 5) return 'Review must contain meaningful text (at least a few words).';
        return '';
    }

    function validateReviewField($field, showValid) {
        let err = '';
        const val = $field.val() || '';
        if ($field.is($nameField)) err = checkReviewName(val);
        else if ($field.is($dateField)) err = checkReviewDate(val);
        else if ($field.is($placeField)) err = checkReviewArea(val);
        else if ($field.is($ratingField)) err = checkReviewRating(val);
        else if ($field.is($textField)) err = checkReviewText(val);

        if (err) {
            showError($field, err);
            return false;
        }
        clearError($field, showValid && val.trim() !== '');
        return true;
    }

    function buildReviewBox(review) {
        return $('<div class="comment-box"></div>')
            .append(
                $('<div class="d-flex justify-content-between align-items-center mb-1"></div>')
                    .append($('<strong></strong>').text(review.name))
                    .append($('<span class="badge-premium"></span>').text('★'.repeat(review.rating) + ' ' + review.rating + '/5'))
            )
            .append($('<div class="small text-muted mb-2"></div>').text(review.place + ' · ' + review.date))
            .append($('<p class="mb-0"></p>').text(review.text));
    }

    function renderReviews() {
        $list.empty();
        if (reviews.length === 0) {
            $list.append('<p class="text-muted text-center" id="no-reviews">No reviews yet — be the first to leave one!</p>');
            return;
        }

        const $section = $('<div class="comment-section"></div>')
            .append('<h3 class="h5 text-brand mb-3">Guest Reviews</h3>')
            .appendTo($list);

        $.each(reviews, function (i, review) {
            $section.append(buildReviewBox(review));
        });
    }

    // Render saved reviews on initial load
    renderReviews();

    // Sync across open browser tabs
    window.addEventListener('storage', function (e) {
        if (e.key === STORAGE_KEY) {
            reviews = getStoredReviews();
            renderReviews();
        }
    });

    $form.on('submit', function (e) {
        e.preventDefault();
        $form.find('.success-msg').remove();

        const fields = [$nameField, $dateField, $placeField, $ratingField, $textField];
        let firstInvalid = null;

        $.each(fields, function (i, $f) {
            if (!$f.is('select')) $f.val($f.val().trim());
            if (!validateReviewField($f, true) && !firstInvalid) {
                firstInvalid = $f;
            }
        });

        if (firstInvalid) {
            firstInvalid.trigger('focus');
            return;
        }

        const ratingVal = parseInt($ratingField.val().trim(), 10);
        const newReview = {
            name: $nameField.val().trim(),
            date: $dateField.val().split('-').reverse().join('.'),
            place: $placeField.val(),
            rating: ratingVal,
            text: $textField.val().trim()
        };

        // Persist new review in localStorage
        reviews.unshift(newReview);
        saveStoredReviews(reviews);

        // Prepend new review to the DOM with animation
        $('#no-reviews').remove();
        let $section = $list.find('.comment-section');
        if ($section.length === 0) {
            $section = $('<div class="comment-section"></div>')
                .append('<h3 class="h5 text-brand mb-3">Guest Reviews</h3>')
                .appendTo($list);
        }

        const $box = buildReviewBox(newReview).hide();
        $section.find('h3').after($box);
        $box.slideDown(300);

        $form[0].reset();
        $form.find('.is-invalid, .is-valid').removeClass('is-invalid is-valid');
        $form.find('.error-msg').remove();
        $('#charCount').text('0');
        $('<div class="alert alert-success mt-3 success-msg">Thank you! Your review has been submitted successfully.</div>')
            .hide()
            .appendTo($form)
            .slideDown(400)
            .delay(3000)
            .slideUp(300, function () { $(this).remove(); });
    });

    // Re-validate field on input/change/blur and clear error only when genuinely valid
    $form.on('input change', 'input, textarea, select', function () {
        const $field = $(this);
        if ($field.hasClass('is-invalid') || $field.hasClass('is-valid')) {
            validateReviewField($field, true);
        }
    });

    $form.on('blur', 'input, textarea, select', function () {
        const $field = $(this);
        if (($field.val() && $field.val().trim() !== '') || $field.hasClass('is-invalid')) {
            validateReviewField($field, true);
        }
    });

    // character counter
    $form.find('textarea').on('input', function () {
        $('#charCount').text($(this).val().length);
    });

    // reset button
    $form.on('reset', function () {
        $('#charCount').text('0');
        $form.find('.error-msg, .success-msg').remove();
        $form.find('.is-invalid, .is-valid').removeClass('is-invalid is-valid');
    });
});
