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
  { label: 'Red', value: 'RD', hash: 'red' },
  { label: 'Blue', value: 'BL', hash: 'blue', group: 'Shades of Blue' },
  { label: 'Blue Dark', value: 'DBL', hash: 'darkblue', group: 'Shades of Blue' },
  { label: 'Blue Darker', value: 'DBL', hash: 'midnightblue', group: 'Shades of Blue' },
  { label: 'Blue Light', value: 'LBL', hash: 'cadetblue', group: 'Shades of Blue' },
  { label: 'Blue Extra Light', value: 'XLBL', hash: 'aliceblue', group: 'Shades of Blue' },
  { label: 'Yellow', value: 'YW', hash: 'yellow' },
  { label: 'Gold', value: 'GD', hash: 'gold' },
  { label: 'Silver', value: 'SV', hash: 'silver' },
  { label: 'Orange', value: 'OR', hash: 'orange' },
  { label: 'Green', value: 'GR', hash: 'green' },
  { label: 'White', value: 'WH', hash: 'white' },
  { label: 'Pink', value: 'PI', hash: 'pink' },
  { label: 'Purple', value: 'PR', hash: 'purple' },
  { label: 'Grey', value: 'GR', hash: 'grey' },
  { label: 'Brown', value: 'BR', hash: 'brown' },
  { label: 'Black', value: 'BK', hash: 'black', group: 'Shades of Black' },
  { label: 'Black Light', value: 'LBK', hash: '#352e2e', group: 'Shades of Black' },
];

var colors1 = [
  { id: 'Red', value: 'RD', hash: 'red' },
  { id: 'Blue', value: 'BL', hash: 'blue', group: 'Shades of Blue' },
  { id: 'Blue Dark', value: 'DBL', hash: 'darkblue', group: 'Shades of Blue' },
  { id: 'Blue Darker', value: 'DBL', hash: 'midnightblue', group: 'Shades of Blue' },
  { id: 'Blue Light', value: 'LBL', hash: 'cadetblue', group: 'Shades of Blue' },
  { id: 'Blue Extra Light', value: 'XLBL', hash: 'aliceblue', group: 'Shades of Blue' },
  { id: 'Yellow', value: 'YW', hash: 'yellow' },
  { id: 'Gold', value: 'GD', hash: 'gold' },
  { id: 'Silver', value: 'SV', hash: 'silver' },
  { id: 'Orange', value: 'OR', hash: 'orange' },
  { id: 'Green', value: 'GR', hash: 'green' },
  { id: 'White', value: 'WH', hash: 'white' },
  { id: 'Pink', value: 'PI', hash: 'pink' },
  { id: 'Purple', value: 'PR', hash: 'purple' },
  { id: 'Grey', value: 'GR', hash: 'grey' },
  { id: 'Brown', value: 'BR', hash: 'brown' },
  { id: 'Black', value: 'BK', hash: 'black', group: 'Shades of Black' },
  { id: 'Black Light', value: 'LBK', hash: '#352e2e', group: 'Shades of Black' },
];

var input = document.getElementById('searchInput');

// eslint-disable-next-line no-undef
typeahead({
  input: input,
  // fetch: function () {
  //   console.log(' here :>> ');
  // },
  fetch: function (text, update) {
    text = text.toLowerCase();
    // you can also use AJAX requests instead of preloaded data
    var suggestions = colors.filter((n) => n.label.toLowerCase().startsWith(text));
    update(suggestions);
  },
  // source: {
  //   local: colors1,
  //   identifier: 'id',
  // },
  highlight: true,
  className: 'typeahead-example',
  templates: {
    suggestion: (item) => {
      return (
        '<span class="preview" style="background-color:' +
        item.hash +
        '"></span><div class="text">' +
        item.label +
        '</div>'
      );
    },
    group: (name) => {
      return '<div class="custom-group">' + name + '</div>';
    },
    header: 'Colors Found',
    footer: '<a href="#">See more...</a>',
    notFound: 'Oops...Nothing Found 😪 <br>Try another color...',
  },
});
