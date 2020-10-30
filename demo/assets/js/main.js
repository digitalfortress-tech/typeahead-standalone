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

var colors = [
  { label: 'Red', value: 'RD' },
  { label: 'Blue', value: 'BL', group: 'Shades of Blue' },
  { label: 'Blue Dark', value: 'DBL', group: 'Shades of Blue' },
  { label: 'Blue Darker', value: 'DBL', group: 'Shades of Blue' },
  { label: 'Blue Light', value: 'LBL', group: 'Shades of Blue' },
  { label: 'Blue Extra Light', value: 'XLBL', group: 'Shades of Blue' },
  { label: 'Yellow', value: 'YW' },
  { label: 'Gold', value: 'GD' },
  { label: 'Silver', value: 'SV' },
  { label: 'Orange', value: 'OR' },
  { label: 'Green', value: 'GR' },
  { label: 'White', value: 'WH' },
  { label: 'Pink', value: 'PI' },
  { label: 'Grey', value: 'GR' },
  { label: 'Brown', value: 'BR' },
  { label: 'Black', value: 'BK', group: 'Shades of Black' },
  { label: 'Black Xtra', value: 'XBK', group: 'Shades of Black' },
];

var input = document.getElementById('searchInput');

// eslint-disable-next-line no-undef
typeahead({
  input: input,
  fetch: function (text, update) {
    text = text.toLowerCase();
    // you can also use AJAX requests instead of preloaded data
    var suggestions = colors.filter((n) => n.label.toLowerCase().startsWith(text));
    update(suggestions);
  },
  highlight: true,
  templates: {
    suggestion: (item) => {
      return '<div class="custom-class"><div class="logo"></div><div class="text">' + item.label + '</div></div>';
    },
    header: '<span>Available Colors</span>',
    footer: '<a href="#">See more</a>',
  },
});
