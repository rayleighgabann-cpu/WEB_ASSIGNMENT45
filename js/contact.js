// jQuery version: 3.7.1
$(document).ready(function() {

    // REWRITTEN FEATURE: Form validation using jQuery (.val(), .addClass(), .removeClass())
    $('#reviewForm').on('submit', function(e) {
        e.preventDefault(); // Prevents page submit & reload
        let isValid = true;
        
        $('.error-msg').fadeOut(200, function() { $(this).remove(); });
        $('#reviewForm .is-invalid').removeClass('is-invalid');

        const $name = $(this).find('input[type="text"]').first();
        if ($name.val().trim() === '') {
            $name.addClass('is-invalid');
            $name.parent().append('<div class="error-msg text-danger small mt-1" style="display:none;">Name is required.</div>');
            isValid = false;
        }

        const $rating = $(this).find('input[type="number"]');
        const ratingVal = parseInt($rating.val().trim());
        if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
            $rating.addClass('is-invalid');
            $rating.parent().append('<div class="error-msg text-danger small mt-1" style="display:none;">Rating must be between 1 and 5.</div>');
            isValid = false;
        }

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
