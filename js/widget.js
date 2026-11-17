// Floating Contact, Location, 2GIS & Idea Suggestion Widget for Nesibe Ethnic Cafe
(function () {
    function initFloatingWidget() {
        if (document.getElementById('nesibeFloatWidget')) return;

        const wrapper = document.createElement('div');
        wrapper.id = 'nesibeFloatWidget';
        wrapper.className = 'nesibe-float-wrapper';

        wrapper.innerHTML =
            '<div class="nesibe-float-popover" id="nesibeFloatPopover" role="dialog" aria-label="Contact and Location">' +
            '<div class="nesibe-popover-header">' +
            '<h4 class="nesibe-popover-title">Nesibe Ethnic Cafe</h4>' +
            '<button type="button" class="nesibe-popover-close" id="nesibePopoverClose" aria-label="Close">&times;</button>' +
            '</div>' +
            '<div class="nesibe-popover-label">Our Location</div>' +
            '<div class="nesibe-popover-address">Uly dala 41, Astana 010238, Kazakhstan</div>' +
            '<div class="nesibe-popover-links">' +
            '<a href="https://2gis.kz/astana/firm/70000001109879464" target="_blank" rel="noopener noreferrer" class="nesibe-popover-btn btn-2gis">' +
            '<span>Open in 2GIS Map</span>' +
            '<span>↗</span>' +
            '</a>' +
            '<a href="https://wa.me/77712537979" target="_blank" rel="noopener noreferrer" class="nesibe-popover-btn">' +
            '<span>WhatsApp (Questions &amp; Ideas)</span>' +
            '<span>💬</span>' +
            '</a>' +
            '<a href="tel:+77712537979" class="nesibe-popover-btn">' +
            '<span>+7 (771) 253-79-79</span>' +
            '<span>📞</span>' +
            '</a>' +
            '<a href="mailto:info@nesibe-cafe.kz?subject=Idea%20or%20Suggestion%20for%20Nesibe" class="nesibe-popover-btn">' +
            '<span>info@nesibe-cafe.kz</span>' +
            '<span>✉️</span>' +
            '</a>' +
            '</div>' +
            '</div>' +
            '<button type="button" class="nesibe-float-idea-badge" id="nesibeIdeaTrigger">' +
            '<span>💡</span>' +
            '<span>Want to suggest an idea? <strong>Contact us</strong></span>' +
            '</button>' +
            '<div class="nesibe-float-controls">' +
            '<a href="tel:+77712537979" class="nesibe-float-call" title="Call Nesibe Cafe" aria-label="Call Nesibe Cafe">' +
            '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
            '<path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.07 21 3 13.93 3 5a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.25 1.01l-2.2 2.2z"/>' +
            '</svg>' +
            '</a>' +
            '<button type="button" class="nesibe-float-pill" id="nesibeFloatToggle" aria-expanded="false" aria-controls="nesibeFloatPopover">' +
            '<span class="nesibe-float-pill-text">We are online<br>and ready to help!</span>' +
            '<span class="nesibe-float-pill-icon" aria-hidden="true">' +
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>' +
            '<line x1="8" y1="9" x2="16" y2="9"></line>' +
            '<line x1="8" y1="13" x2="13" y2="13"></line>' +
            '</svg>' +
            '</span>' +
            '</button>' +
            '</div>';

        document.body.appendChild(wrapper);

        const toggleBtn = document.getElementById('nesibeFloatToggle');
        const ideaBtn = document.getElementById('nesibeIdeaTrigger');
        const popover = document.getElementById('nesibeFloatPopover');
        const closeBtn = document.getElementById('nesibePopoverClose');

        function setOpen(state) {
            popover.classList.toggle('is-open', state);
            toggleBtn.setAttribute('aria-expanded', String(state));
        }

        toggleBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            setOpen(!popover.classList.contains('is-open'));
        });

        ideaBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            setOpen(true);
        });

        closeBtn.addEventListener('click', function () {
            setOpen(false);
        });

        document.addEventListener('click', function (e) {
            if (!wrapper.contains(e.target)) {
                setOpen(false);
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') setOpen(false);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFloatingWidget);
    } else {
        initFloatingWidget();
    }
})();