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

/** Manually add dark theme classes */
function styleKlipseSnippet() {
  const snippet = document.querySelector('.klipse-snippet .CodeMirror.cm-s-default');
  const output = document.querySelector('.klipse-result .CodeMirror.cm-s-default');
  if (snippet && output) {
    [snippet, output].forEach((el) => {
      el.classList.add('cm-s-solarized', 'cm-s-dark');
      el.classList.remove('cm-s-default');
    });
  }
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

let dataset = [
  { name: 'Red', value: 'RD', hash: 'red' },
  { name: 'Blue', value: 'BL', hash: 'blue', group: 'Shades of Blue' },
  { name: 'Dark Blue', value: 'DBLD', hash: 'darkblue', group: 'Shades of Blue' },
  { name: 'Blue Darker', value: 'DBL', hash: 'mnamenightblue', group: 'Shades of Blue' },
  { name: 'Blue Dark', value: 'DBL', hash: 'darkblue', group: 'Shades of Blue' },
  { name: 'Blue Light', value: 'LBL', hash: 'cadetblue', group: 'Shades of Blue' },
  { name: 'Blue Extra Light', value: 'LBL', hash: 'aliceblue', group: 'Shades of Blue' },
  { name: 'Yellow', value: 'YW', hash: 'yellow' },
  { name: 'Gold', value: 'GD', hash: 'gold' },
  { name: 'Silver', value: 'SV', hash: 'silver' },
  { name: 'Baige', value: 'BG', hash: '#352e2e' },
  { name: 'Orange', value: 'OR', hash: 'orange' },
  { name: 'Green', value: 'GRN', hash: 'green' },
  { name: 'White', value: 'WH', hash: 'white' },
  { name: 'Pink', value: 'PI', hash: 'pink' },
  { name: 'Purple', value: 'PR', hash: 'purple' },
  { name: 'Grey', value: 'GRY', hash: 'grey' },
  { name: 'Brown', value: 'BR', hash: 'brown' },
  { name: 'Black', value: 'BK', hash: 'black', group: 'Shades of Black' },
  { name: 'Black Light', value: 'LBK', hash: '#352f2e', group: 'Shades of Black' },
];

// dataset = [
//   'BART [4, BAA]',
//   'BARTLFI [2207, BAA]',
//   'BART23 [1081, BAA]',
//   'BART23BER [1140, BAA]',
//   'BART123 [1082, BAA]',
// ];

let typeaheadTest = false;
const input = document.getElementById('searchInput');

let instance;
// eslint-disable-next-line no-undef
if (typeaheadTest) {
  // eslint-disable-next-line no-undef
  instance = typeahead({
    input,
    source: {
      local: dataset,
      identifier: 'name',
      groupIdentifier: 'group',
      dataTokens: ['value'],
      // remote: {
      //   url: 'https://restcountries.com/v2/name/%QUERY',
      //   wildcard: '%QUERY',
      //   requestOptions: {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({ hello: 'world' }),
      //   },
      // },
      // prefetch: {
      //   url: 'https://restcountries.com/v2/name/an',
      //   when: 'onFocus',
      // },
    },
    highlight: true,
    autoSelect: false,
    className: 'typeahead-example',
    templates: {
      // suggestion: (item) => {
      //   return (
      //     '<span class="preview" style="background-color:' +
      //     item.hash +
      //     '"></span><div class="text">' +
      //     item.name +
      //     '</div>'
      //   );
      // },
      // group: (name) => {
      //   return '<div class="custom-group">' + name + '</div>';
      // },
      header: 'Colors Found',
      footer: '<a href="#">See more...</a>',
      notFound: 'Oops...Nothing Found 😪 <br>Try another color...',
    },
  });
}
