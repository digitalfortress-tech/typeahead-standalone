document.addEventListener('DOMContentLoaded', function () {
  !(function (o) {
    'use strict';
    o('body')
      .on('input propertychange', '.floating-label-form-group', function (i) {
        o(this).toggleClass('floating-label-form-group-with-value', !!o(i.target).val());
      })
      .on('focus', '.floating-label-form-group', function () {
        o(this).addClass('floating-label-form-group-with-focus');
      })
      .on('blur', '.floating-label-form-group', function () {
        o(this).removeClass('floating-label-form-group-with-focus');
      });
    if (992 < o(window).width()) {
      var s = o('#mainNav').height();
      o(window).on(
        'scroll',
        {
          previousTop: 0,
        },
        function () {
          var i = o(window).scrollTop();
          i < this.previousTop
            ? 0 < i && o('#mainNav').hasClass('is-fixed')
              ? o('#mainNav').addClass('is-visible')
              : o('#mainNav').removeClass('is-visible is-fixed')
            : i > this.previousTop &&
              (o('#mainNav').removeClass('is-visible'),
              s < i && !o('#mainNav').hasClass('is-fixed') && o('#mainNav').addClass('is-fixed')),
          (this.previousTop = i);
        }
      );
    }
    // eslint-disable-next-line no-undef
  })(jQuery);

  $(function () {
    $('[data-toggle="tooltip"]').tooltip();
  });
});

/*****************************************************************************************/
/************************************** CUSTOM *******************************************/
/*****************************************************************************************/

// handle loading fragments
$(document).ready(function () {
  if (window.location.hash) {
    loadFragment(window.location.hash);
  }
  window.onhashchange = function () {
    loadFragment(window.location.hash);
  };

  init();
});

$('.submenu-link').click(function (e) {
  e.preventDefault();
  const pg = $(this).attr('href');
  loadFragment(pg);

  document.getElementById('mainSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
  window.history.pushState('', document.title, pg);
});

function loadFragment(name) {
  if (!name || name === './') {
    // load base template
    name = 'intro';
  }
  $('#mainSection').load(`pages/${name.replace('#', '')}.html`, function (resp, status) {
    // init once fragment is loaded (attach events etc)
    init();

    if (status == 'error') {
      $('#mainSection').load('pages/404.html');
    } else {
      // manage active class
      $('.submenu-link').removeClass('active');
      name === 'intro' ? (name = './') : '';
      $('.submenu-link[href="' + name + '"]').addClass('active');
    }
  });
}

/** Init core functions */
function init() {
  syntaxHighlight();

  // attach event listener
  $('.codeContainer .copy').on('click', function () {
    const that = $(this);
    copyToClipboard($(this).parent().find('pre').text().trim()).then(function () {
      that.find('i').removeClass('fa-copy').addClass('fa-check-circle').attr('title', 'Copied');
      setTimeout(function () {
        that.find('i').removeClass('fa-check-circle').addClass('fa-copy').attr('title', 'Copy to Clipboard');
      }, 3000);
    });
  });

  // attach listener for bottom-nav
  $('.bottom-nav .submenu-link').click(function () {
    document.getElementById('mainSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function syntaxHighlight() {
  document.querySelectorAll('pre').forEach((el) => {
    hljs.highlightElement(el);
  });
}

function copyToClipboard(text) {
  return navigator.clipboard.writeText(text);
}

// handle sticky elements
const stickyEl = (El, stickyConf) => {
  if (!El || !(El instanceof HTMLElement) || !stickyConf || stickyConf.constructor !== Object) return null;

  const { beforeEl, afterEl, offsetTop, offsetBottom } = stickyConf;
  let startPos = 0,
    endPos = 0,
    scrollPos = 0;
  let ticking = false;
  if (beforeEl && beforeEl instanceof HTMLElement) {
    const props = beforeEl.getBoundingClientRect();
    startPos = window.pageYOffset + props.top + props.height;
  }
  if (afterEl && afterEl instanceof HTMLElement) {
    endPos = window.pageYOffset + afterEl.getBoundingClientRect().top;
  }

  const eventHandler = () => {
    if (!ticking) {
      scrollPos = window.scrollY;
      window.requestAnimationFrame(() => {
        if (
          scrollPos > startPos &&
          !(endPos && scrollPos > endPos - El.clientHeight - (parseInt(offsetBottom, 10) || 0))
        ) {
          El.classList.add('stickyElx');
          El.style.position = 'fixed';
          El.style.top = (parseInt(offsetTop, 10) || 0) + 'px';
        } else {
          El.style.top = '0';
          El.style.position = 'relative';
          El.classList.remove('stickyElx');
        }
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', eventHandler);
  return eventHandler;
};

const makeSticky = () => {
  const stickyGAdv = document.querySelector('.gAdvert_sidebar_sticky');
  if (!stickyGAdv || !stickyGAdv.clientHeight || window.screen.availWidth <= 992) return;
  stickyEl(stickyGAdv, {
    beforeEl: document.querySelector('.beforePubbCard'),
    afterEl: document.querySelector('.subscribe-area'),
    offsetTop: 120,
    offsetBottom: 100,
  });
};

// Make Pub sticky after a small delay
setTimeout(makeSticky, 3e3);
