// jQuery version: 3.7.1
// Ensures the DOM is fully loaded before executing interactions.
$(document).ready(function() {

    // 1. REWRITTEN FEATURE: Hover effect on cards and info blocks using jQuery Chaining and Traversal
    $('.static-block').on('mouseenter', function() {
        $(this).find('h3').css('color', 'var(--brand-secondary)');
    }).on('mouseleave', function() {
        $(this).find('h3').css('color', 'var(--brand-primary)');
    });

    // 2. Traversal and Chaining example: .closest() and .find()
    $('.premium-card').on('click', '.btn-outline-brand', function(e) {
        // e.preventDefault() stops default anchor navigation behavior
        $(this).closest('.premium-card').find('.card-img-top').toggleClass('opacity-75');
    });

});
