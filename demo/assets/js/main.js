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

var colors = [
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
  { name: 'Black Light', value: 'LBK', hash: '#352e2e', group: 'Shades of Black' },
];

var input = document.getElementById('searchInput');

var instance;

// eslint-disable-next-line no-undef
if (dev) {
  // eslint-disable-next-line no-undef
  instance = typeahead({
    input: input,
    source: {
      local: colors,
      identifier: 'name',
      groupIdentifier: 'group',
      dataTokens: ['value'],
      // remote: {
      //   url: 'https://restcountries.eu/rest/v2/name/%QUERY',
      //   wildcard: '%QUERY',
      // },
      // prefetch: {
      //   url: 'https://restcountries.eu/rest/v2/name/an',
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
