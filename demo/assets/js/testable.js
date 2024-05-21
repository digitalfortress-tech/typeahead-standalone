const colors = [
  { name: 'Red', value: 'RD', hash: 'red' },
  { name: 'Blue', value: 'BL', hash: 'blue', group: 'Shades of Blue' },
  { name: 'Dark Blue', value: 'DBLD', hash: 'darkblue', group: 'Shades of Blue' },
  { name: 'Blue Dark', value: 'DBL', hash: 'darkblue', group: 'Shades of Blue' },
  { name: 'Blue Darker', value: 'DBXL', hash: 'mnamenightblue', group: 'Shades of Blue' },
  { name: 'Blue Light', value: 'LBL', hash: 'cadetblue', group: 'Shades of Blue' },
  { name: 'Blue Extra Light', value: 'LBLX', hash: 'aliceblue', group: 'Shades of Blue' },
  { name: 'Yellow', value: 'YW', hash: 'yellow' },
  { name: 'Gold', value: 'GD', hash: 'gold' },
  { name: 'Silver', value: 'SV', hash: 'silver' },
  { name: 'Baige', value: 'BG', hash: '#352e2e' },
  { name: 'Orange', value: 'OR', hash: 'orange' },
  { name: 'Green', value: 'GR', hash: 'green' },
  { name: 'White', value: 'WH', hash: 'white' },
  { name: 'Pink', value: 'PI', hash: 'pink' },
  { name: 'Purple', value: 'PR', hash: 'purple' },
  { name: 'Grey', value: 'GR', hash: 'grey' },
  { name: 'Light Grey [GRL]', value: 'GRL', hash: '#352e2e', group: 'Shades of Black' },
  { name: 'Brown', value: 'BR', hash: 'brown' },
  { name: 'Black', value: 'BK', hash: 'black', group: 'Shades of Black' },
  { name: 'Black Light', value: 'LBK', hash: '#352e2e', group: 'Shades of Black' },
];

const colorsCollision = [
  { name: 'Blue Dark', value: 'DBL', hash: 'darkblue', group: 'Shades of Blue' },
  { name: 'Blue Darker', value: 'DBL', hash: 'mnamenightblue', group: 'Shades of Blue' },
  { name: 'Blue Darkest', value: 'DBL', hash: 'cadetblue', group: 'Shades of Blue' },
  { name: 'Blue Black', value: 'DBL', hash: 'aliceblue', group: 'Shades of Blue' },
  { name: 'Black Blue', value: 'DBL', hash: 'black', group: 'Shades of Black' },
  { name: 'Black Dark', value: 'DBL', hash: '#352e2e', group: 'Shades of Black' },
  { name: 'Black Sheeep', hash: '#352e2e', group: 'Shades of Black' },
];

const songs = [
  {
    title: 'Sing For Joy In The Lord',
    artist: 'Paul Wilbur',
    album: 'Shalom Jerusalem',
  },
  {
    title: 'Emmanuel',
    artist: 'Blackmores Night',
    album: 'Winter Carols',
  },
  {
    title: 'Come And Go With Me',
    artist: 'Cedarmont Kids',
    album: 'Songs Of Praise',
  },
  {
    title: 'Zion\u0027s daughter',
    artist: 'Boney M',
    album: 'Christmas Album',
  },
  {
    title: 'When a Child is Born',
    artist: 'Boney M',
    album: 'Christmas Album',
  },
  {
    title: 'Cry',
    artist: 'Smokey James Earl',
    album: 'The Rock',
  },
  {
    title: 'We Have Overcome The Shout Of El Shaddai (Reprise)',
    artist: 'Paul Wilbur',
    album: 'Jerusalem Arise',
  },
  {
    title: 'He Lives',
    artist: 'Alan Jackson',
    album: 'Precious Memories Volume 2',
  },
  {
    title: 'It is good',
    artist: 'Paul Wilbur',
    album: 'Jerusalem Arise',
  },
  {
    title: 'Come, Thou Long Expected Jesus',
    artist: 'Fernando Ortega',
    album: 'Christmas Songs',
  },
  {
    title: 'Petit Papa Noel',
    artist: 'Boney M',
    album: 'Christmas Album',
  },
  {
    title: 'O Holy Night',
    artist: 'Unknown Artist',
    album: 'Unknown Album',
  },
  {
    title: 'I love to tell the story',
    artist: 'Alan Jackson',
    album: 'Precious Memories',
  },
  {
    title: 'God will make a way',
    artist: 'Don Moen',
    album: 'God Will Make a Way - The Best of Don Moen',
  },
  {
    title: 'Hark The Herald Angels Sing O Come All Ye Faithful',
    artist: 'Blackmores Night',
    album: 'Winter Carols',
  },
  {
    title: 'All To You / I Surrender All',
    artist: 'Don Moen',
    album: 'Thank you Lord',
  },
  {
    title: 'God Is In Control',
    artist: 'Twila Paris',
    album: 'Beyond  A  Dream',
  },
  {
    title: 'The Shout Of El Shaddai',
    artist: 'Paul Wilbur',
    album: 'Jerusalem Arise',
  },
  {
    title: 'Lamb Of God',
    artist: 'Twila Paris',
    album: 'Kingdom Seekers',
  },
  {
    title: 'Stand Up And Give Him The Praise',
    artist: 'Paul Wilbur',
    album: 'Shalom Jerusalem',
  },
  {
    title: 'Lord I offer my life to you Karaoke v1',
    artist: 'Don Moen',
    album: 'Ultimate Collection',
  },
  {
    title: 'It Takes An Almighty Hand',
    artist: 'Ian White',
    album: 'Childrens Collection',
  },
  {
    title: 'Oh Christmas Tree',
    artist: 'Blackmores Night',
    album: 'Winter Carols',
  },
  {
    title: 'Henei Ma Tov (Behold how good)',
    artist: 'Paul Wilbur',
    album: 'Shalom Jerusalem',
  },
  {
    title: 'Thank you Lord',
    artist: 'Don Moen',
    album: 'Thank you Lord',
  },
  {
    title: 'Carol Of The Birds',
    artist: 'Fernando Ortega',
    album: 'Christmas Songs',
  },
  {
    title: 'O Come All Ye Faithful',
    artist: 'Jim Reeves',
    album: 'Twelve Songs Of Christmas',
  },
  {
    title: 'At The Foot Of The Cross (Ashes To Beauty)',
    artist: 'Don Moen',
    album: 'Thank you Lord',
  },
  {
    title: 'Crowned With Many Crowns',
    artist: 'Paul Wilbur',
    album: 'Jerusalem Arise',
  },
  {
    title: 'I Give You My Heart',
    artist: 'Hillsong Worship',
    album: 'God is In the House',
  },
  {
    title: 'One God',
    artist: 'Bob Fitts',
    album: 'The Lord Reigns',
  },
  {
    title: 'I\u0027ll Fly Away',
    artist: 'Alan Jackson',
    album: 'Precious Memories',
  },
  {
    title: 'Angels We Have Heard On High',
    artist: 'Fernando Ortega',
    album: 'Christmas Songs',
  },
  {
    title: 'He Is Exalted',
    artist: 'Twila Paris',
    album: 'Kingdom Seekers',
  },
  {
    title: 'Days Of Elijah / Kadosh (Reprise)',
    artist: 'Paul Wilbur',
    album: 'Jerusalem Arise',
  },
  {
    title: 'Arms Of Love',
    artist: 'Amy Grant',
    album: 'Age To Age',
  },
  {
    title: 'Change my heart Oh God',
    artist: 'Eddie Espinosa',
    album: 'Unknown Album',
  },
  {
    title: 'Mary\u0027s Boy Child',
    artist: 'Jim Reeves',
    album: 'Twelve Songs Of Christmas',
  },
  {
    title: 'Shalom Jerusalem',
    artist: 'Paul Wilbur',
    album: 'Shalom Jerusalem',
  },
  {
    title: 'Fat Baby',
    artist: 'Amy Grant',
    album: 'Age To Age',
  },
  {
    title: 'The Joy Of The Lord',
    artist: 'Twila Paris',
    album: 'Sanctuary',
  },
  {
    title: 'Christmas Hymn',
    artist: 'Amy Grant',
    album: 'A Christmas Album',
  },
  {
    title: 'Baruch Haba (Blessed Is He Who Comes)',
    artist: 'Paul Wilbur',
    album: 'Shalom Jerusalem',
  },
  {
    title: 'Everlasting God',
    artist: 'Chris Tomlin',
    album: 'See in the morning',
  },
  {
    title: 'Silent Night Medley',
    artist: 'Boney M',
    album: 'Christmas Album',
  },
  {
    title: 'Silent Night',
    artist: 'Jim Reeves',
    album: 'Twelve Songs Of Christmas',
  },
  {
    title: 'Bless the Lord Karaoke piano v2',
    artist: 'Matt Redman',
    album: '10000 Reasons',
  },
  {
    title: 'God is good all the time',
    artist: 'Don Moen',
    album: 'God Is Good - Worship with Don Moen',
  },
  {
    title: 'God is good all the time Karaoke v1',
    artist: 'Don Moen',
    album: 'God Is Good - Worship with Don Moen',
  },
  {
    title: 'God is good all the time Karaoke v2',
    artist: 'Don Moen',
    album: 'God Is Good - Worship with Don Moen',
  },
  {
    title: 'I Stand In Awe',
    artist: 'Bob Fitts',
    album: 'The Lord Reigns',
  },
];

// eslint-disable-next-line no-undef
const test1 = typeahead({
  input: document.getElementById('input-one'),
  source: {
    local: ['Gold', 'Green', 'Grey', 'Golden Brown'],
  },
  classNames: {
    wrapper: 'typeahead-standalone typeahead-test-one',
  }
});
test1.addToIndex(['Purple', 'Pink']);

// eslint-disable-next-line no-undef
const test2 = typeahead({
  input: document.getElementById('input-two'),
  source: {
    local: colors,
    identifier: 'name',
  },
  classNames: {
    wrapper: 'typeahead-standalone typeahead-test-two',
  },
  minLength: 2,
  highlight: true,
  display: (selectedItem, e) => {
    if (e) {
      document.querySelector('#input2-hidden-field').innerHTML = `Evnt-${e.type}`;
    }
    return selectedItem.name + ' - ' + selectedItem.value;
  },
  preventSubmit: true,
  autoSelect: true,
});

// eslint-disable-next-line no-undef
const test2A = typeahead({
  input: document.getElementById('input-two-A'),
  source: {
    local: colors,
    identifier: 'name',
  },
  classNames: {
    wrapper: 'typeahead-standalone typeahead-test-two-A',
  },
  hint: false,
  preventSubmit: true,
});

// eslint-disable-next-line no-undef
const test2B = typeahead({
  input: document.getElementById('input-two-B'),
  source: {
    local: colors,
    identifier: 'name',
  },
  classNames: {
    wrapper: 'typeahead-standalone typeahead-test-two-B',
  },
  preventSubmit: true,
});

// eslint-disable-next-line no-undef
const test3 = typeahead({
  input: document.getElementById('input-three'),
  source: {
    local: colors,
    identifier: 'name',
    groupIdentifier: 'group',
  },
  classNames: {
    wrapper: 'typeahead-standalone typeahead-test-three',
  },
  highlight: true,
  preventSubmit: true,
});

// eslint-disable-next-line no-undef
const test3A = typeahead({
  input: document.getElementById('input-three-A'),
  source: {
    prefetch: {
      url: 'https://example.com/get-suggestions',
      when: 'onFocus',
    },
    identifier: 'id',
    transform: (data) => {
      const newData = [];
      data.forEach((element) => {
        newData.push({ id: element.name.code });
      });
      return newData;
    },
  },
  classNames: {
    wrapper: 'typeahead-standalone typeahead-test-three-A',
  },
  highlight: true,
});

// eslint-disable-next-line no-undef
const test3B = typeahead({
  input: document.getElementById('input-three-B'),
  source: {
    remote: {
      url: 'https://example.com/get-suggestions/%QUERY',
      wildcard: '%QUERY',
    },
    identifier: 'id',
    transform: (data) => {
      const newData = [];
      data.forEach((element) => {
        newData.push({ id: element.name.code });
      });
      return newData;
    },
  },
  classNames: {
    wrapper: 'typeahead-standalone typeahead-test-three-B',
  },
  highlight: true,
});

// eslint-disable-next-line no-undef
const test4 = typeahead({
  input: document.getElementById('input-four'),
  source: {
    local: colors,
    identifier: 'name',
    groupIdentifier: 'group',
  },
  classNames: {
    wrapper: 'typeahead-standalone typeahead-test-four',
  },
  highlight: true,
  templates: {
    suggestion: (item, resultSet) => {
      return `<span class="preview" data-resultset="${resultSet.items[0].hash}" style="background-color:${item.hash}"></span>
        <div class="text">${item.name}</div>`;
    },
    group: (name, resultSet) => {
      const count = resultSet.items.filter((i) => i.group === name).length;
      return `<div class="custom-group">${name} (count: ${count})</div>`;
    },
    header: (resultSet) => {
      if (!resultSet.query) return 'Top Colors';
      return `Colors Found (Total: ${resultSet.count})`;
    },
    footer: (resultSet) => {
      if (!resultSet.query) return '';
      return `<a href="#">See${
        resultSet.count > resultSet.limit ? ` ${resultSet.count - resultSet.limit}` : ''
      } more...</a>`;
    },
    notFound: (resultSet) => `Oops...Nothing Found for query - ${resultSet.query} 😪 <br>Try another color...`,
    empty: (resultSet) => {
      resultSet.defaultItems = [
        { name: 'Red', value: 'RD', hash: 'red' },
        { name: 'Green', value: 'GR', hash: 'green' },
        { name: 'Blue', value: 'BL', hash: 'blue', group: 'Shades of Blue' },
      ];
      return 'unimportant'; // this should not be taken into consideration
    },
  },
});

// eslint-disable-next-line no-undef
const test4A = typeahead({
  input: document.getElementById('input-fourA'),
  source: {
    remote: {
      url: () => 'https://restcountries.com/v2/name/%QUERY',
      wildcard: '%QUERY',
    },
    identifier: 'name',
    dataTokens: ['capital'],
  },
  classNames: {
    wrapper: 'typeahead-standalone typeahead-test-fourA',
  },
  highlight: true,
  templates: {
    suggestion: (item) => {
      return item.name + ', ' + item.capital;
    },
    loader: () => 'LOADING...',
    header: () => '',
    footer: () => '',
    notFound: () => 'Oops...Nothing Found 😪 <br>Try another country...',
    empty: () => {
      return 'EMPTY template Html';
    },
  },
});

// eslint-disable-next-line no-undef
const test4B = typeahead({
  input: document.getElementById('input-fourB'),
  source: {
    remote: {
      url: () => 'https://restcountries.com/v2/name/%QUERY',
      wildcard: '%QUERY',
    },
    identifier: 'name',
    dataTokens: ['capital'],
  },
  classNames: {
    wrapper: 'typeahead-standalone typeahead-test-fourB',
  },
  highlight: true,
  templates: {
    suggestion: (item) => {
      return item.name + ', ' + item.capital;
    },
    header: () => 'Countries Found',
    loader: () => '<div style="text-align:center"><img src="./assets/img/spinner.svg" /></div>',
    footer: () => '<a href="#" style="color:blue">See more...</a>',
    notFound: () => '',
    empty: () => '',
  },
});

// eslint-disable-next-line no-undef
const test5 = typeahead({
  input: document.getElementById('input-five'),
  source: {
    local: colors,
    identifier: 'name',
    groupIdentifier: 'group',
    dataTokens: ['value'],
  },
  classNames: {
    wrapper: 'typeahead-standalone typeahead-test-five',
  },
  highlight: true,
});

// eslint-disable-next-line no-undef
const test6 = typeahead({
  input: document.getElementById('input-six'),
  source: {
    remote: {
      url: 'https://restcountries.com/v2/name/%QUERY',
      wildcard: '%QUERY',
    },
    identifier: 'name',
    dataTokens: ['capital'],
  },
  classNames: {
    wrapper: 'typeahead-standalone typeahead-test-six',
  },
  highlight: true,
  templates: {
    suggestion: (item) => {
      return item.name + ', ' + item.capital;
    },
  },
});

// eslint-disable-next-line no-undef
const test6andhalf = typeahead({
  input: document.getElementById('input-six-and-half'),
  source: {
    remote: {
      url: () => 'https://restcountries.com/v2/name/%QUERY?test1=data1&test2=data2',
      wildcard: '%QUERY',
    },
    identifier: 'name',
    dataTokens: ['capital'],
  },
  classNames: {
    wrapper: 'typeahead-standalone typeahead-test-six-half',
  },
  highlight: true,
  templates: {
    suggestion: (item) => {
      return item.name + ', ' + item.capital;
    },
  },
});

// eslint-disable-next-line no-undef
const test7 = typeahead({
  input: document.getElementById('input-seven'),
  source: {
    prefetch: {
      url: 'https://restcountries.com/v2/name/p',
      when: 'onFocus',
      process: (suggestions) => {
        document.querySelector('.prefetch_process_cb').innerHTML = suggestions[0].alpha3Code;
      },
    },
    identifier: 'name',
    dataTokens: ['capital'],
  },
  classNames: {
    wrapper: 'typeahead-standalone typeahead-test-seven',
  },
  highlight: true,
  templates: {
    suggestion: (item) => {
      return item.name + ', ' + item.capital;
    },
  },
});

// eslint-disable-next-line no-undef
const test8 = typeahead({
  input: document.getElementById('input-eight'),
  source: {
    local: songs,
    identifier: 'title',
    dataTokens: ['artist', 'album'],
  },
  classNames: {
    wrapper: 'typeahead-standalone typeahead-test-eight',
  },
  highlight: true,
  templates: {
    suggestion: (item) => {
      return (
        '<div class="track"><div class="track-title">' +
        item.title +
        '</div><div class="track-details"><div class="track-artist">' +
        item.artist +
        '</div><div class="track-album">' +
        item.album +
        '</div></div></div>'
      );
    },
  },
});

// eslint-disable-next-line no-undef
const test9 = typeahead({
  input: document.getElementById('input-nine'),
  source: {
    local: colorsCollision,
    identifier: 'name',
    groupIdentifier: 'group',
    dataTokens: ['value'],
  },
  classNames: {
    wrapper: 'typeahead-standalone typeahead-test-nine',
  },
  highlight: true,
  limit: 10,
});

// eslint-disable-next-line no-undef
const test10 = typeahead({
  input: document.getElementById('input-ten'),
  source: {
    identifier: 'name',
    dataTokens: ['value'],
    remote: {
      url: 'https://restcountries.com/v2/name/%QUERY',
      wildcard: '%QUERY',
      requestOptions: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hello: 'world' }),
      },
    },
  },
  classNames: {
    wrapper: 'typeahead-standalone typeahead-test-ten',
  },
  highlight: true,
  limit: 10,
});

// eslint-disable-next-line no-undef
const test11 = typeahead({
  input: document.getElementById('input-eleven'),
  source: {
    local: colors,
    identifier: 'name',
    groupIdentifier: 'group',
  },
  classNames: {
    wrapper: 'typeahead-standalone typeahead-test-eleven',
  },
  highlight: true,
  onSubmit: (e, item) => {
    if (item && item.value) {
      document.querySelector('.onsubmit_test').innerHTML = 'OnSubmit Test Passed #' + item.value;
    } else {
      document.querySelector('.onsubmit_test').innerHTML = 'OnSubmit Test Passed';
    }
  },
  templates: {
    suggestion: (item) => {
      return `
        <a href="${encodeURI(item.name)}">${item.name}</a>
      `;
    },
  },
});

// eslint-disable-next-line no-undef
const test12 = typeahead({
  input: document.getElementById('input-twelve'),
  source: {
    local: [
      {
        title: 'O Holy Night',
        artist: 'Unknown Artist',
        album: 'Unknown Album',
      },
      {
        title: 'O Holy Night',
        artist: 'Kutless',
        album: 'This is Christmas',
      },
      {
        title: 'O Holy Night',
        artist: 'Mariah Carey',
        album: 'Merry Christmas',
      },
    ],
    identifier: 'title',
    dataTokens: ['artist', 'album'],
    identity: (item) => {
      return `${item.title}##${item.artist}`;
    },
  },
  classNames: {
    wrapper: 'typeahead-standalone typeahead-test-twelve',
  },
  highlight: true,
  templates: {
    suggestion: (item) => {
      return (
        '<div class="track"><div class="track-title">' +
        item.title +
        '</div><div class="track-details"><div class="track-artist">' +
        item.artist +
        '</div><div class="track-album">' +
        item.album +
        '</div></div></div>'
      );
    },
  },
});

// eslint-disable-next-line no-undef
const test13 = typeahead({
  input: document.getElementById('input-thirteen'),
  source: {
    local: [
      'Kraków',
      'Łódź',
      'Wrocław',
      'Gdańsk',
      'Częstochowa',
      'Bielsko-Biała',
      'Rzeszów',
      'Ruda Śląska',
      'Kielce',
      'Rhône',
      'Évry',
      'Épinal',
      'Élancourt',
      'Essonne',
      'Saint-Étienne',
      'Le Kremlin-Bicêtre',
    ],
  },
  classNames: {
    wrapper: 'typeahead-standalone typeahead-test-thirteen',
  },
  highlight: true,
  diacritics: true,
});

const El14 = document.getElementById('input-fourteen');
El14.addEventListener('keyup', (evt) => {
  document.querySelector('.pre_typeahead_handler').innerHTML = evt.key;
});

// eslint-disable-next-line no-undef
const test14 = typeahead({
  input: El14,
  source: {
    local: colors,
    identifier: 'name',
  },
  classNames: {
    wrapper: 'typeahead-standalone typeahead-test-fourteen',
  },
  highlight: true,
});
document.getElementById('input-fourteen').addEventListener('keyup', (evt) => {
  document.querySelector('.post_typeahead_handler').innerHTML = evt.key;
});

const El15 = document.getElementById('input-fifteen');
El15.addEventListener('input', (evt) => {
  document.querySelector('.customInputEvent_handler').innerHTML = evt.data;
});

// eslint-disable-next-line no-undef
const test15 = typeahead({
  input: El15,
  source: {
    local: colors,
    identifier: 'name',
  },
  classNames: {
    wrapper: 'typeahead-standalone typeahead-test-fifteen',
  },
  highlight: true,
  preventSubmit: true,
});

let test16_reset1Called = false;
let test16_reset2Called = false;
// eslint-disable-next-line no-undef
const test16 = typeahead({
  input: document.getElementById('input-sixteen'),
  source: {
    local: colors,
    prefetch: {
      url: 'https://restcountries.com/v2/name/p',
      when: 'onFocus',
      process: (suggestions) => {
        setTimeout(() => {
          if (test16_reset1Called) return;
          test16.reset();
          test16_reset1Called = true;
        }, 1000);
        setTimeout(() => {
          if (test16_reset2Called) return;
          test16.reset(true);
          test16_reset2Called = true;
        }, 3000);
      },
    },
    remote: {
      url: 'https://restcountries.com/v2/name/%QUERY',
      wildcard: '%QUERY',
    },
    identifier: 'name',
  },
  classNames: {
    wrapper: 'typeahead-standalone typeahead-test-sixteen',
  },
  highlight: true,
  preventSubmit: true,
});

// eslint-disable-next-line no-undef
const test17 = typeahead({
  input: document.getElementById('input-seventeen'),
  source: {
    local: colors,
    prefetch: {
      url: 'https://restcountries.com/v2/name/p',
      when: 'onFocus',
      process: (suggestions) => {
        setTimeout(() => {
          if (test16_reset1Called) return;
          test17.destroy();
        }, 1000);
      },
    },
    identifier: 'name',
  },
  classNames: {
    wrapper: 'typeahead-standalone typeahead-test-seventeen',
  },
  highlight: true,
});
