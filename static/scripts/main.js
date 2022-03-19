window.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    let scrollBefore = 0;
    document.onscroll = () => {
        if (window.scrollY > scrollBefore && window.scrollY >= 20) {
            $('#navbar-header').addClass('hide-nav');
        } else $('#navbar-header').removeClass('hide-nav');

        scrollBefore = window.scrollY;
    };

    $('!.disabled').click((event) => {
        event.preventDefault();
    });
});
