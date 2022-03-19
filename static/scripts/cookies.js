let cookieModalHtml = `
<div class="outer-cookie">
    <div class="cookieModal">
        <div class="cookieModal-header">
            <h3 class="cookieModal-header-title">DIESE SEITE BENUTZT COOKIES!</h3>
        </div>
        <div class="cookieModal-main">
            <i class="fas fa-cookie-bite fa-5x"></i>
            <p>Damit wir unsere Webseiten für Sie optimieren und personalisieren können verwenden wir Cookies. 
            Zudem werden Cookies gebraucht, um Funktionen von Soziale Media Plattformen anbieten zu können und Zugriffe auf unsere Webseiten zu analysieren
            Mit der Benutzung dieser Seite sind Sie damit einverstanden!</p>
        </div>

        <div>
            <a id="cookie-accept" class="cookie-accept" href="javascript:void(0);">Okay!</a>
        </div>
    </div>
</div>
`;

function createCookie(name, value, days) {
    var expires;
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = '; expires=' + date.toGMTString();
    } else {
        expires = '';
    }
    document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value) + expires + '; path=/';
}

function readCookie(name) {
    var nameEQ = encodeURIComponent(name) + '=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}

window.addEventListener('DOMContentLoaded', () => {
    let acceptedCookies = 0 + readCookie('acceptedCookies') || 0;

    if (acceptedCookies <= 0) {
        var tmpDiv = document.createElement('div');
        tmpDiv.innerHTML = cookieModalHtml;
        let cookieModal = tmpDiv.firstChild;
        cookieModal.onclick = (clickEvent) => {
            clickEvent.preventDefault();
        };
        document.body.append(tmpDiv);

        $('.outer-cookie').addClass('outer-active');

        try {
            $('#cookie-accept').click(() => {
                createCookie('acceptedCookies', 1, 365);
                $('.outer-cookie').removeClass('outer-active');
                setTimeout(() => {
                    tmpDiv.remove();
                }, 1000);
            });
        } catch (err) {}
    }
});
