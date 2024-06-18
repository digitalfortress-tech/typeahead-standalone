// eslint-disable-next-line no-undef
const test = typeahead({
  input: document.getElementById('input-one'),
  source: {
    local: ['Gold', 'Green', 'Grey'],
  },
  className: 'typeahead-test-one',
});

const trie = test.trie;
trie.clear();
console.log(' **** CLEARED **** ');

const colors = [
  { name: 'Red', value: 'RD', hash: 'red' },
  { name: 'Blue', value: 'BL', hash: 'blue', group: 'Shades of Blue' },
  { name: 'Blue Dark', value: 'DBL', hash: 'darkblue', group: 'Shades of Blue' },
  { name: 'Blue Darker', value: 'DBL', hash: 'mnamenightblue', group: 'Shades of Blue' },
  { name: 'Blue Light', value: 'LBL', hash: 'cadetblue', group: 'Shades of Blue' },
  { name: 'Blue Extra Light', value: 'LBL', hash: 'aliceblue', group: 'Shades of Blue' },
  { name: 'Yellow', value: 'YW', hash: 'yellow' },
  { name: 'Gold', value: 'GD', hash: 'gold' },
  { name: 'Silver', value: 'SV', hash: 'silver' },
  { name: 'Baige', value: 'BG', hash: '#352e2e' },
  { name: 'Orange', value: 'OR', hash: 'orange' },
  { name: 'Green', value: 'GRN', hash: 'green' },
  { name: 'White', value: 'WH', hash: 'white' },
  { name: 'Pink', value: 'PN', hash: 'pink' },
  { name: 'Purple', value: 'PR', hash: 'purple' },
  { name: 'Grey', value: 'GRY', hash: 'grey' },
  { name: 'Brown', value: 'BR', hash: 'brown' },
  { name: 'Black', value: 'BK', hash: 'black', group: 'Shades of Black' },
  { name: 'Black Light', value: 'LBK', hash: '#352e2e', group: 'Shades of Black' },
  { name: 'Peach', value: 'PN', hash: 'peach' },
  { name: 'Plum', value: 'PN', hash: 'plum' },
];

const colorsCollision = [
  { name: 'Blue Dark', value: 'DBL', hash: 'darkblue', group: 'Shades of Blue' },
  { name: 'Blue Darker', value: 'DBL', hash: 'mnamenightblue', group: 'Shades of Blue' },
  { name: 'Blue Darkest', value: 'DBL', hash: 'cadetblue', group: 'Shades of Blue' },
  { name: 'Blue Black', value: 'DBL', hash: 'aliceblue', group: 'Shades of Blue' },
  { name: 'Black Blue', value: 'DBL', hash: 'black', group: 'Shades of Black' },
  { name: 'Black Dark', value: 'DBL', hash: '#352e2e', group: 'Shades of Black' },
  { name: 'Black Darker', value: 'DBL', hash: '#352e2e', group: 'Shades of Black' },
  { name: 'Black Sheeep', hash: '#352e2e', group: 'Shades of Black' },
];

const words = ['romAn', 'romAneSquE', 'ROmanesCo', 'cat', 'category', 'romanei', 'another romaneid'];

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

/********************************* TEST ON STRINGS ***************************************/

// trie.add(words);
// console.log('trie1 :>> ', trie.search('romane'));

/********************************* TEST ON COLORS ***************************************/

// trie.add(colors, 'name');
// trie.add(colors, 'value');
// console.log('trie2 :>> Search: "b" => ', trie.search('b', 'name', 5));

/* Colors Collision Test */

trie.add(colorsCollision, 'name');
trie.add(colorsCollision, 'value');
console.log('trie2 : Collision >> Search: "b" => ', trie.search('dbl', 'name', 5));

/********************************* TEST ON SONGS ***************************************/

// trie.add(songs, 'title');
// trie.add(songs, 'artist');
// trie.add(songs, 'album');
// console.log('trie3 :>> Search: "god is good" =>', trie.search('god is good', 'title', 5));
