// jQuery version: 3.7.1
// $(document).ready() is needed to ensure the DOM is fully loaded before we try to select or manipulate elements, preventing 'null' errors.
$(document).ready(function() {
    // REWRITTEN FEATURE: Hover effect on cards and info blocks using jQuery Chaining and Traversal
    // Replaced document.querySelectorAll('.static-block').forEach(block => block.addEventListener('mouseenter', ...)) with $('.static-block').on('mouseenter', ...)
    // The jQuery version is shorter and clearer because it handles event binding and traversal in one line.
    $('.static-block').on('mouseenter', function() {
        $(this).find('h3').addClass('text-brand').removeClass('text-muted');
    }).on('mouseleave', function() {
        $(this).find('h3').removeClass('text-brand').addClass('text-muted');
    });

    // 2. Traversal and Chaining example: .closest() and .find()
    $('.premium-card').on('click', '.btn-outline-brand', function(e) {
        e.preventDefault();
        $(this).closest('.premium-card').find('.card-img-top').toggleClass('opacity-75');
    });

    // Using :not() filter to find inactive category buttons
    $('.category-btn:not(.active)').on('click', function() {
        console.log('Category filter clicked');
    });

    // Using .hasClass() to check button state
    $('.btn-brand').on('click', function() {
        if (!$(this).hasClass('disabled')) {
            console.log('Button is active');
        }
    });
});