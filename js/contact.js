// jQuery version: 3.7.1
// $(document).ready() ensures DOM is loaded before validation runs.
$(document).ready(function() {
    // REWRITTEN FEATURE: Form validation using jQuery (.val(), .addClass(), .removeClass())
    // Replaced document.getElementById('reviewForm').addEventListener('submit', ...) with $('#reviewForm').on('submit', ...)
    // The jQuery version is shorter and clearer because it handles form submission and DOM traversal in one line.
    $('#reviewForm').on('submit', function(e) {
        e.preventDefault(); // Prevents page submit & reload. Without this, the form would submit and reload the page, losing all validation feedback.

        // Browser checks (like 'required') improve UX, but they never replace server checks because users can easily bypass HTML/JS validation by disabling JS or sending direct HTTP requests.

        let isValid = true;
        $('.error-msg').fadeOut(200, function() { $(this).remove(); });
        $('#reviewForm .is-invalid').removeClass('is-invalid');

        // Name validation
        const $name = $(this).find('input[type="text"]').first();
        if ($name.val().trim() === '') {
            $name.addClass('is-invalid');
            $name.parent().append('<div class="error-msg text-danger small mt-1" style="display:none;">Name is required.</div>');
            isValid = false;
        }

        // Email validation with regex
        const $email = $(this).find('input[type="email"]');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test($email.val().trim())) {
            $email.addClass('is-invalid');
            $email.parent().append('<div class="error-msg text-danger small mt-1" style="display:none;">Invalid email format.</div>');
            isValid = false;
        }

        // Phone validation with regex
        const $phone = $(this).find('input[type="tel"]');
        const phoneRegex = /^\+?[0-9\s\-()]{7,15}$/;
        if (!phoneRegex.test($phone.val().trim())) {
            $phone.addClass('is-invalid');
            $phone.parent().append('<div class="error-msg text-danger small mt-1" style="display:none;">Invalid phone format.</div>');
            isValid = false;
        }

        // Rating validation
        const $rating = $(this).find('input[type="number"]');
        const ratingVal = parseInt($rating.val().trim());
        if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
            $rating.addClass('is-invalid');
            $rating.parent().append('<div class="error-msg text-danger small mt-1" style="display:none;">Rating must be between 1 and 5.</div>');
            isValid = false;
        }

        // Review validation
        const $review = $(this).find('textarea');
        if ($review.val().trim().length < 10) {
            $review.addClass('is-invalid');
            $review.parent().append('<div class="error-msg text-danger small mt-1" style="display:none;">Review must be at least 10 characters.</div>');
            isValid = false;
        }

        if (!isValid) {
            $('.error-msg').fadeIn(300);
        } else {
            const successHtml = '<div class="alert alert-success mt-3 success-msg" style="display:none;">Спасибо! Ваш отзыв успешно отправлен.</div>';
            $(this).append(successHtml);
            $('.success-msg').slideDown(400);
            $(this)[0].reset();
            $('#charCount').text('0');
            setTimeout(() => {
                $('.success-msg').slideUp(300, function() { $(this).remove(); });
            }, 3000);
        }
    });

    // Character counter for textarea
    $('#reviewForm textarea').on('input', function() {
        const len = $(this).val().length;
        $('#charCount').text(len);
        if ($(this).val().trim() !== '') {
            $(this).removeClass('is-invalid');
            $(this).siblings('.error-msg').fadeOut(200, function() { $(this).remove(); });
        }
    });
});