// jQuery 3.7.1 — Contact page: FAQ and review form.
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

    // ---------- 2. REVIEW FORM ----------
    const $form = $('#reviewForm');
    const $list = $('#reviews-list');
    $form.prop('noValidate', true); // validation handled in code

    // empty reviews list state
    $list.append('<p class="text-muted text-center" id="no-reviews">No reviews yet — be the first to leave one!</p>');

    function showError($field, message) {
        $field.addClass('is-invalid');
        $('<div class="error-msg text-danger small mt-1"></div>')
            .text(message).hide().insertAfter($field).fadeIn(200);
    }

    function clearError($field) {
        $field.removeClass('is-invalid').next('.error-msg').remove();
    }

    function addReview(review) {
        $('#no-reviews').remove();
        let $section = $list.find('.comment-section');
        if ($section.length === 0) {
            $section = $('<div class="comment-section"></div>')
                .append('<h3 class="h5 text-brand mb-3">Guest Reviews</h3>')
                .appendTo($list);
        }

        const $box = $('<div class="comment-box"></div>')
            .append(
                $('<div class="d-flex justify-content-between align-items-center mb-1"></div>')
                    .append($('<strong></strong>').text(review.name))
                    .append($('<span class="badge-premium"></span>').text('★'.repeat(review.rating) + ' ' + review.rating + '/5'))
            )
            .append($('<div class="small text-muted mb-2"></div>').text(review.place + ' · ' + review.date))
            .append($('<p class="mb-0"></p>').text(review.text))
            .hide();

        $section.find('h3').after($box);
        $box.slideDown(300);
    }

    $form.on('submit', function (e) {
        e.preventDefault();

        $form.find('.error-msg').remove();
        $form.find('.is-invalid').removeClass('is-invalid');
        $form.find('.success-msg').remove();

        const $name = $form.find('input[type="text"]');
        const $date = $form.find('input[type="date"]');
        const $place = $form.find('select');
        const $rating = $form.find('input[type="number"]');
        const $text = $form.find('textarea');

        const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
        const ratingVal = parseInt($rating.val().trim(), 10);
        let isValid = true;

        if ($name.val().trim().length < 2) {
            showError($name, 'Please enter your name (minimum 2 characters).');
            isValid = false;
        }
        if ($date.val() === '') {
            showError($date, 'Please select the date of your visit.');
            isValid = false;
        } else if ($date.val() > today) {
            showError($date, 'Visit date cannot be in the future.');
            isValid = false;
        }
        if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
            showError($rating, 'Rating must be a number from 1 to 5.');
            isValid = false;
        }
        if ($text.val().trim().length < 10) {
            showError($text, 'Review must contain at least 10 characters.');
            isValid = false;
        }

        if (!isValid) return;

        addReview({
            name: $name.val().trim(),
            date: $date.val().split('-').reverse().join('.'),
            place: $place.val(),
            rating: ratingVal,
            text: $text.val().trim()
        });

        $form[0].reset();
        $('#charCount').text('0');
        $('<div class="alert alert-success mt-3 success-msg">Thank you! Your review has been submitted successfully.</div>')
            .hide()
            .appendTo($form)
            .slideDown(400)
            .delay(3000)
            .slideUp(300, function () { $(this).remove(); });
    });

    // clear error as soon as field is fixed
    $form.on('input change', 'input, textarea, select', function () {
        const $field = $(this);
        if ($field.hasClass('is-invalid') && $field.val().trim() !== '') {
            clearError($field);
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
        $form.find('.is-invalid').removeClass('is-invalid');
    });
});
