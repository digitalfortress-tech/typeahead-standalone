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
  { name: 'Red', value: 'RD', hash: 'red' },
  { name: 'Blue', value: 'BL', hash: 'blue', group: 'Shades of Blue' },
  { name: 'Blue Dark', value: 'DBL', hash: 'darkblue', group: 'Shades of Blue' },
  { name: 'Blue Darker', value: 'DBXL', hash: 'mnamenightblue', group: 'Shades of Blue' },
  { name: 'Blue Light', value: 'LBL', hash: 'cadetblue', group: 'Shades of Blue' },
  { name: 'Blue Extra Light', value: 'LBLX', hash: 'aliceblue', group: 'Shades of Blue' },
  { name: 'Yellow', value: 'YW', hash: 'yellow' },
  { name: 'Gold', value: 'GD', hash: 'gold' },
  { name: 'Silver', value: 'SV', hash: 'silver' },
  { name: 'Orange', value: 'OR', hash: 'orange' },
  { name: 'Green', value: 'GR', hash: 'green' },
  { name: 'White', value: 'WH', hash: 'white' },
  { name: 'Pink', value: 'PI', hash: 'pink' },
  { name: 'Purple', value: 'PR', hash: 'purple' },
  { name: 'Grey', value: 'GR', hash: 'grey' },
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
