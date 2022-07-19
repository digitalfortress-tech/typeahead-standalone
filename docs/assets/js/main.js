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

const mainSectionEl = document.getElementById('mainSection');
let stickyEvtHandler;
let previousFragment;

$(document).ready(function () {
  // handle loading fragments
  if (window.location.hash) {
    loadFragment(window.location.hash);
  }
  window.onhashchange = function () {
    loadFragment(window.location.hash, false);
  };

  init();

  $('#back-to-top').click(function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  $(window).scroll(function () {
    // handle scroll-to-top btn
    if ($(this).scrollTop() > window.innerHeight) {
      $('#back-to-top').css('opacity', 1);
    } else {
      $('#back-to-top').css('opacity', 0);
    }

    // For mobile, adjust main div so that sticky subnav does not overlap heading of mainSection on navigation/fragment load
    if (window.screen.availWidth <= 992) {
      if ($(this).scrollTop() > mainSectionEl.offsetTop - 50) {
        mainSectionEl.style.paddingTop = '65px';
      } else {
        mainSectionEl.style.paddingTop = 0;
      }
    }
  });
});

window.addEventListener('load', () => {
  makeSticky();
});

$('.submenu-link').click(function (e) {
  e.preventDefault();
  const pg = $(this).attr('href');
  loadFragment(pg);

  window.history.pushState('', document.title, pg);
});

function loadFragment(fragment, firstLoad = true) {
  if (!fragment || fragment === './') {
    // load base template
    fragment = 'intro';
  }

  // handle sections if existing
  let subSection = null;
  if (fragment.indexOf('?') !== -1) {
    const urlParts = fragment.split('?');
    fragment = urlParts[0];
    const params = new URLSearchParams(urlParts[1]);
    subSection = params.get('id');
  }

  $('#mainSection').load(`pages/${fragment.replace('#', '')}.html`, function (resp, status) {
    // init once fragment is loaded (attach events etc)
    init();

    if (status == 'error') {
      $('#mainSection').load('pages/404.html');
      return;
    }

    // manage active class
    $('.submenu-link').removeClass('active');
    fragment === 'intro' ? (fragment = './') : '';
    $('.submenu-link[href="' + fragment + '"]').addClass('active');

    // recalculate stickyness
    if (previousFragment && previousFragment !== fragment) {
      removeStickyHandler();
      setTimeout(makeSticky, 2e3);
    }

    /* scroll to top of fragment */
    if (!subSection) {
      mainSectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (!firstLoad) {
      /* subSection exists, scroll to subSection */
      document.getElementById(subSection)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      /*  first page load. subSection exists, scroll to subSection */
      window.addEventListener('load', () => {
        document.getElementById(subSection)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    previousFragment = fragment;
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
}

function syntaxHighlight() {
  document.querySelectorAll('pre').forEach((el) => {
    hljs.highlightElement(el);
  });
}

function copyToClipboard(text) {
  return navigator.clipboard.writeText(text);
}

function removeStickyHandler() {
  if (stickyEvtHandler) {
    window.removeEventListener('scroll', stickyEvtHandler);
    stickyEvtHandler = undefined;
  }
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

  stickyEvtHandler = () => {
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

  window.addEventListener('scroll', stickyEvtHandler);
  return stickyEvtHandler;
};

const makeSticky = () => {
  const stickyGAdv = document.querySelector('.gAdvert_sidebar_sticky');
  if (!stickyGAdv || !stickyGAdv.clientHeight || window.screen.availWidth <= 992) return;
  stickyEl(stickyGAdv, {
    beforeEl: document.querySelector('.beforePubbCard'),
    afterEl: document.querySelector('.subscribe-area'),
    offsetTop: 60,
    offsetBottom: 100,
  });
};
