/// <reference types="cypress" />

context('Typeahead', () => {
  beforeEach(() => {
    cy.visit('/demo/testable.html');
  });

  it('Shows suggestions on keypress', () => {
    cy.get('#input-one').type('g', { delay: 100 });
    cy.get('.typeahead-test-one .tt-list').as('list').should('exist');
    cy.get('@list').children().should('have.length', 4);
    cy.get('@list').children('.tt-selected').should('have.length', 0);
  });

  it('Shows hint', () => {
    cy.get('#input-two').as('input2').type('gr', { delay: 100 });
    cy.get('.typeahead-test-two .tt-hint').as('hint2').should('have.value', 'grey - GR');

    cy.get('@input2').clear().type('black l', { delay: 100 });
    cy.get('@hint2').should('have.value', 'black light - LBK');
  });

  it('Should escape Regex special chars within the hint', () => {
    cy.get('#input-two').clear().type('light grey [gr', { delay: 100 });
    cy.get('.typeahead-test-two .tt-hint').should('have.value', 'light grey [grL] - GRL');
  });

  it('Should not render hint element when disabled', () => {
    cy.get('#input-two-A').clear().type('li', { delay: 100 });
    cy.get('.typeahead-test-A .tt-hint').should('not.exist');
  });

  it('Highlights matched text', () => {
    cy.get('#input-two').as('input2').type('gr', { delay: 100 });
    cy.get('.typeahead-test-two .tt-list .tt-highlight').first().should('have.text', 'Gr');
  });

  it('Shows suggestions on focus', () => {
    cy.get('#input-one').as('input1').type('g', { delay: 100 });
    cy.get('.typeahead-test-one .tt-list').as('list').should('exist');
    cy.get('@list').children().should('have.length', 4);
    cy.get('@input1').focus().blur();
    cy.get('.typeahead-test-one .tt-list.tt-hide').should('exist');
    cy.get('@input1').focus();
    cy.get('@list').should('exist');
    cy.get('@list').children().should('have.length', 4);
    cy.get('.typeahead-test-one .tt-list.tt-hide').should('not.exist');
  });

  it('Sorts suggestions by giving preference to the first letter and the length of the input query', () => {
    cy.get('#input-two').as('input2').type('bl', { delay: 100 });
    cy.get('.typeahead-test-two .tt-list').as('list').children().should('have.length', 5);
    cy.get('@list').children('.tt-suggestion').eq(0).should('have.text', 'Blue');
    cy.get('@list').children('.tt-suggestion').eq(1).should('have.text', 'Black');
    cy.get('@list').children('.tt-suggestion').eq(2).should('have.text', 'Blue Dark');
    cy.get('@list').children('.tt-suggestion').eq(3).should('have.text', 'Black Light');
    cy.get('@list').children('.tt-suggestion').eq(4).should('have.text', 'Dark Blue');

    cy.get('@input2').clear().type('blue d');
    cy.get('@list').children().should('have.length', 3);
    cy.get('@list').children('.tt-suggestion').eq(0).should('have.text', 'Blue Dark');
    cy.get('@list').children('.tt-suggestion').eq(1).should('have.text', 'Blue Darker');
    cy.get('@list').children('.tt-suggestion').eq(2).should('have.text', 'Dark Blue');

    cy.get('@input2').clear().type('dar');
    cy.get('@list').children().should('have.length', 3);
    cy.get('@list').children('.tt-suggestion').eq(0).should('have.text', 'Dark Blue');
    cy.get('@list').children('.tt-suggestion').eq(1).should('have.text', 'Blue Dark');
    cy.get('@list').children('.tt-suggestion').eq(2).should('have.text', 'Blue Darker');

    cy.get('@input2').clear().type('dark b');
    cy.get('@list').children().should('have.length', 3);
    cy.get('@list').children('.tt-suggestion').eq(0).should('have.text', 'Dark Blue');
    cy.get('@list').children('.tt-suggestion').eq(1).should('have.text', 'Blue Dark');
    cy.get('@list').children('.tt-suggestion').eq(2).should('have.text', 'Blue Darker');
  });

  it('Navigates between suggestions via Keyboard with autoSelect disabled (default behaviour)', () => {
    cy.get('#input-one').as('input1').type('g', { delay: 100 });
    cy.get('.typeahead-test-one .tt-list').as('list').children().should('have.length', 4);
    cy.get('@list').children('.tt-selected').should('have.length', 0);

    cy.get('@input1').type('{uparrow}');
    cy.get('@list').children('.tt-selected').should('have.text', 'Golden Brown');

    cy.get('@input1').type('{downarrow}{downarrow}{downarrow}');
    cy.get('@list').children('.tt-selected').should('have.text', 'Gold');

    cy.get('@input1').type('{downarrow}{downarrow}');
    cy.get('@list').children('.tt-selected').should('have.text', 'Golden Brown');

    cy.get('@input1').type('{downarrow}');
    cy.get('@list').children('.tt-selected').should('not.exist');

    cy.get('@input1').type('{downarrow}');
    cy.get('@list').children('.tt-selected').should('have.text', 'Grey');

    cy.get('@input1').type('{uparrow}');
    cy.get('@list').children('.tt-selected').should('not.exist');

    cy.get('@input1').type('{uparrow}{uparrow}');
    cy.get('@list').children('.tt-selected').should('have.text', 'Green');
  });

  it('Navigates between suggestions via Keyboard with autoSelect enabled', () => {
    cy.get('#input-two').as('input2').type('bl', { delay: 100 });
    cy.get('.typeahead-test-two .tt-list').as('list').children().should('have.length', 5);
    cy.get('@list').children('.tt-selected').should('have.text', 'Blue'); // auto selects first suggestion

    cy.get('@input2').type('{downarrow}{downarrow}');
    cy.get('@list').children('.tt-selected').should('have.text', 'Blue Dark');

    cy.get('@input2').type('{downarrow}{downarrow}');
    cy.get('@list').children('.tt-selected').should('have.text', 'Dark Blue');

    cy.get('@input2').type('{downarrow}');
    cy.get('@list').children('.tt-selected').should('not.exist');

    cy.get('@input2').type('{downarrow}{uparrow}{uparrow}{uparrow}');
    cy.get('@list').children('.tt-selected').should('have.text', 'Black Light');
  });

  it('Handles "Esc" key correctly', () => {
    // when input type="search", hitting Esc clears contents of input. (Browser behaviour)
    // Currently a bug in cypress doesn't replicate this browser behaviour. (https://github.com/cypress-io/cypress/issues/21313)
    // cy.get('#input-two-A').as('input2A').type('bl', { delay: 100 });
    // cy.get('.typeahead-test-two-A .tt-list').as('listA').children().should('have.length', 5);
    // cy.get('@input2A').type('{esc}');
    // cy.get('@input2A').should('have.value', '');

    // when input type="text"
    cy.get('#input-two-B').as('input2B').type('bl', { delay: 100 });
    cy.get('.typeahead-test-two-B .tt-list').as('listB').children().should('have.length', 5);
    cy.get('@input2B').type('{esc}');
    cy.get('@input2B').should('have.value', 'bl');
  });

  it('Uses custom display() function with optional arg', () => {
    cy.get('#input-two').as('input2').type('ye', { delay: 100 });
    cy.get('.typeahead-test-two .tt-list').as('list').children().first().should('have.length', 1);
    cy.get('.typeahead-test-two .tt-hint').should('have.value', 'yellow - YW');
    cy.get('@list').children().first().click();
    cy.get('@input2').should('have.value', 'Yellow - YW');
    cy.get('#input2-hidden-field').as('hiddenField').should('have.text', 'Evnt-click');

    // typing {tab} key is not supported yet
    cy.get('@input2').clear().type('ye{enter}', { delay: 100 });
    cy.get('@input2').should('have.value', 'Yellow - YW');
    // verify that 2nd optional arg was used to set hidden field
    cy.get('@hiddenField').should('have.text', 'Evnt-keydown');
  });

  it('Submits correct data', () => {
    cy.get('#input-two').type('li', { delay: 100 });
    cy.get('.typeahead-test-two .tt-list').as('list').children().eq(2).should('have.text', 'Blue Extra Light');

    // typing {tab} key is not supported yet
    cy.get('#input-two').type('{downarrow}{downarrow}{enter}');
    cy.get('#input-two').should('have.value', 'Blue Extra Light - LBLX');

    cy.get('.section-two button').click();
    cy.url().should('include', 'color-test-2=Blue+Extra+Light+-+LBLX');
  });

  it('Displays grouped results', () => {
    cy.get('#input-three').as('input3').type('b', { delay: 100 });
    cy.get('.typeahead-test-three .tt-list').as('list').children().should('have.length', 7);
    cy.get('@list').children('.tt-suggestion').should('have.length', 5);
    cy.get('@list').children('.tt-group').as('groups').should('have.length', 2);
    cy.get('@groups').first().should('have.text', 'Shades of Black');

    cy.get('@list').children().eq(3).should('have.text', 'Black');
    cy.get('@list').children().eq(4).should('have.text', 'Black Light');
    cy.get('@list').children().eq(5).should('have.text', 'Shades of Blue');
    cy.get('@list').children().eq(6).should('have.text', 'Blue');

    cy.get('@input3').clear().type('bl');
    cy.get('@list').children().should('have.length', 7);
    cy.get('@list').children('.tt-suggestion').should('have.length', 5);
    cy.get('@list').children().eq(1).should('have.text', 'Black');
    cy.get('@list').children().eq(4).should('have.text', 'Blue');
    cy.get('@list').children().eq(5).should('have.text', 'Blue Dark');
    cy.get('@list').children().eq(6).should('have.text', 'Dark Blue');

    cy.get('@input3').clear().type('dar');
    cy.get('@list').children().should('have.length', 4);
    cy.get('@list').children().eq(1).should('have.text', 'Dark Blue');
    cy.get('@list').children().eq(2).should('have.text', 'Blue Dark');
    cy.get('@list').children().eq(3).should('have.text', 'Blue Darker');
  });

  it('Stored query must be updated on input event', () => {
    cy.get('#input-three').as('input3').type('blue', { delay: 100 });
    cy.get('.typeahead-test-three .tt-list').as('list').children().should('have.length', 6);

    cy.get('@input3').type('{downarrow}{enter}');
    cy.get('@input3').should('have.value', 'Blue');

    cy.get('@input3').clear().type('blue{uparrow}{backspace}{esc}');
    cy.get('@input3').should('have.value', 'Dark Blu');
  });

  it('Transforms data from prefetch', () => {
    cy.intercept('GET', 'https://example.com/*', { fixture: 'toTransform-colors.json' }).as('getColors3A');
    // incremented delay to fix CI (CircleCI takes time to load fixtures from disk)
    cy.get('#input-three-A').as('input3A').type('bl', { delay: 300 });
    cy.wait('@getColors3A');
    cy.get('.typeahead-test-three-A .tt-list').children().should('have.length', 5);
  });

  it('Transforms data from remote', () => {
    cy.intercept('GET', 'https://example.com/get-suggestions/*', { fixture: 'toTransform-colors.json' }).as(
      'getColors'
    );
    cy.get('#input-three-B').as('input3B').type('bl', { delay: 100 });
    cy.wait('@getColors');
    cy.get('.typeahead-test-three-B .tt-list').as('list').children().should('have.length', 5);
  });

  it('Displays Templates', () => {
    // empty template
    cy.get('#input-four').as('input4').focus();
    cy.get('.typeahead-test-four .tt-list').as('list').children().should('have.length', 5);
    cy.get('@list').children('.tt-empty').should('not.exist');
    cy.get('@list').children('.tt-suggestion').should('have.length', 3);
    cy.get('@list').children('.tt-header').should('have.text', 'Top Colors');
    cy.get('@list').children('.tt-footer').should('have.length', 0);

    // header, footer, suggestion template
    cy.get('@input4').type('p', { delay: 100 });
    cy.get('@list').children().should('have.length', 4);
    cy.get('@list').children('.tt-header').should('have.length', 1);
    cy.get('.typeahead-test-four .tt-header').should('have.text', 'Colors Found (Total: 2)');
    cy.get('@list').children('.tt-footer').should('have.length', 1);
    cy.get('.typeahead-test-four .tt-footer a').should('contain.text', 'See more');
    cy.get('@list').children('.tt-suggestion').should('have.length', 2);
    cy.get('@list').children('.tt-selected').should('have.length', 0);
    cy.get('@input4').type('{downarrow}{downarrow}');
    cy.get('.typeahead-test-four .tt-selected .preview').should('exist');
    cy.get('.typeahead-test-four .tt-selected .text').should('exist');

    // notFound template
    cy.get('@input4').type('p', { delay: 100 });
    cy.get('@list').children().should('have.length', 1);
    cy.get('.typeahead-test-four .tt-notFound').should('contain.text', 'Nothing Found for query - Pinkp');

    // group template + header/footer/group count
    cy.get('@input4').clear().type('bl', { delay: 100 });
    cy.get('@list').children('.tt-group').as('group').should('have.length', 2);
    cy.get('@group').children('.custom-group').should('have.length', 2);
    // verify count
    cy.get('@group')
      .children('.custom-group')
      .should('have.text', 'Shades of Black (count: 2)Shades of Blue (count: 3)');
    cy.get('.tt-header').should('contain.text', 'Total: 8');
    cy.get('.tt-footer').should('contain.text', 'See 3 more');
    cy.get('@input4').clear();

    cy.intercept('GET', 'https://restcountries.com/v2/name/qsdd', (req) => {
      req.reply({
        body: [],
        delay: 1000, // milliseconds
        throttleKbps: 1000, // to simulate a 3G connection
        forceNetworkError: false, // default
      });
    }).as('getEmptyResult');

    // Input4A empty template
    cy.get('#input-fourA').as('input4A').focus();
    cy.get('.typeahead-test-fourA .tt-list').as('list4A').children().should('have.length', 1);
    cy.get('@list4A').children('.tt-empty').should('exist');
    cy.get('@list4A').children('.tt-empty').should('have.text', 'EMPTY template Html');

    // Input4A Loader Template
    cy.get('@input4A').clear({ force: true }).type('qsdd', { delay: 0 });
    cy.get('.typeahead-test-fourA .tt-loader').should('exist');
    cy.wait('@getEmptyResult');
    cy.get('.typeahead-test-fourA .tt-notFound').should('exist');

    cy.intercept('GET', 'https://restcountries.com/v2/name/ar', {
      fixture: 'countries.json',
      throttleKbps: 1000,
      delay: 1000,
    }).as('getCountries');
    cy.get('@input4A').clear({ force: true }).type('ar', { delay: 0 });
    cy.get('.typeahead-test-fourA .tt-loader').should('exist');
    cy.get('@list4A').children().should('have.length', 1);
    cy.wait('@getCountries');
    cy.get('@list4A').children().should('have.length', 5);
    cy.get('.typeahead-test-fourA .tt-header').should('not.exist');
    cy.get('.typeahead-test-fourA .tt-footer').should('not.exist');
    cy.get('@input4A').clear();

    // Input4B empty template
    cy.get('#input-fourB').as('input4B').focus();
    cy.get('.typeahead-test-fourB .tt-list').as('list4B').children().should('have.length', 0);
    cy.get('@list4B').children('.tt-empty').should('not.exist');

    // Input4B Loader Template
    cy.get('@input4B').clear().type('ar', { delay: 0 });
    cy.get('.typeahead-test-fourB .tt-loader').should('exist');
    cy.get('.typeahead-test-fourB .tt-footer').should('exist');
    cy.wait('@getCountries');
    cy.get('@list4B').children().should('have.length', 7);
    cy.intercept('GET', 'https://restcountries.com/v2/name/ar!', (req) => {
      req.reply({
        body: [],
      });
    }).as('getEmptyResult');
    cy.get('@input4B').type('!', { delay: 0 });
    cy.get('.typeahead-test-fourB .tt-notFound').should('not.exist');

    cy.intercept('GET', 'https://restcountries.com/v2/name/fran', {
      fixture: 'countries_remote.json',
      delay: 1000,
      throttleKbps: 1000,
    }).as('getCountriesRemote');
    cy.get('@input4B').clear().type('fran', { delay: 0 });
    cy.get('.typeahead-test-fourB .tt-loader').should('exist');
    cy.get('@list4B').children().should('have.length', 4);
    cy.wait('@getCountriesRemote');
    cy.get('@list4B').children().should('have.length', 5);
  });

  it('Displays suggestions as links and navigates via click', () => {
    cy.get('#input-eleven').as('input11').type('dar', { delay: 100 });
    cy.get('.typeahead-test-eleven .tt-list').as('list').children().should('have.length', 4);
    cy.get('@list').children('.tt-suggestion').eq(1).should('contain.text', 'Blue Dark');
    cy.get('@list').children('.tt-suggestion').get('a').eq(1).click();
    cy.url().should('include', 'Blue%20Dark');
  });

  it('Displays expected suggestions with Data-Tokens', () => {
    cy.get('#input-five').as('input5').type('yw', { delay: 100 });
    cy.get('.typeahead-test-five .tt-list').as('list').children().should('have.length', 1);
    cy.get('@list').children('.tt-suggestion').should('have.text', 'Yellow');
    cy.get('.typeahead-test-five .tt-hint').as('hint').should('have.value', '');
    cy.get('.typeahead-test-five .tt-highlight').should('not.exist');

    cy.get('@input5').clear().type('lbl', { delay: 100 });
    cy.get('@list').children('.tt-suggestion').as('suggestions').should('have.length', 2);
    cy.get('@list').children('.tt-group').as('groups').should('have.length', 1);
    cy.get('@suggestions').first().should('have.text', 'Blue Light');
    cy.get('@suggestions').eq(1).should('have.text', 'Blue Extra Light');
    cy.get('@hint').should('have.value', '');
    cy.get('.typeahead-test-five .tt-highlight').should('not.exist');
  });

  it('Displays suggestions from a Remote Source (url: string)', () => {
    cy.intercept('GET', 'https://restcountries.com/v2/name/*', { fixture: 'countries.json' }).as('getCountries');
    cy.get('#input-six').as('input6').type('par', { delay: 150 });
    cy.wait('@getCountries');

    cy.get('.typeahead-test-six .tt-list').as('list').children().should('have.length', 5);
    cy.get('@list').children('.tt-suggestion').eq(1).should('have.text', 'France, Paris');

    // verify that suggestions retrieved from remote endpoint are deduplicated.
    cy.get('@input6').clear().type('er');
    cy.get('@list').children('.tt-suggestion').eq(0).should('have.text', 'Eritrea, Asmara');
    cy.get('.typeahead-test-six .tt-list .tt-suggestion:nth-child(2)').should('have.text', 'Afghanistan, Kabul');
  });

  it('Displays suggestions from a Remote Source (url: callback)', () => {
    cy.intercept('GET', 'https://restcountries.com/v2/name/*', (req) => {
      expect(req.query).to.include({
        test1: 'data1',
        test2: 'data2',
      });
      req.reply({
        fixture: 'countries.json',
      });
    }).as('getCountries');

    cy.get('#input-six-and-half').as('input6half').type('p');
    cy.wait('@getCountries');
  });

  it('Displays suggestions from Prefetch, executes process() hook', () => {
    cy.intercept('GET', 'https://restcountries.com/v2/name/*', { fixture: 'countries.json' }).as('getCountries');
    cy.get('#input-seven').as('input7').focus();
    cy.wait('@getCountries');

    // ensure process callback was executed
    cy.get('.prefetch_process_cb').should('contain.text', 'AFG');

    cy.get('@input7').type('pa', { delay: 100 });
    cy.get('.typeahead-test-seven .tt-list').as('list').children().should('have.length', 5);
    cy.get('@list').children('.tt-suggestion').eq(1).should('have.text', 'France, Paris');
  });

  it('Displays suggestions for multiple space-separated queries having correct/reverse order', () => {
    cy.get('#input-eight').as('input8').type('or', { delay: 100 });
    cy.get('.typeahead-test-eight .tt-list').as('list').children().should('have.length', 3);
    cy.get('@list').children('.tt-selected').should('have.length', 0);
    cy.get('@input8').type('{downarrow}');
    cy.get('@list').children('.tt-selected').find('.track-artist').should('have.text', 'Fernando Ortega');
    cy.get('.typeahead-test-eight .tt-hint').as('hint').should('have.value', '');

    cy.get('@input8').clear().type('ortega fernando', { delay: 100 });
    cy.get('@list').children('.tt-suggestion').as('suggestions').should('have.length', 3);
    cy.get('@input8').type('{downarrow}');
    cy.get('@list').children('.tt-selected').find('.track-artist').should('have.text', 'Fernando Ortega');
    cy.get('.typeahead-test-eight .tt-hint').as('hint').should('have.value', '');

    cy.get('@input8').clear().type('sh', { delay: 100 });
    cy.get('@list').children('.tt-suggestion').as('suggestions').should('have.length', 5);
    cy.get('@suggestions').first().find('.track-title').should('have.text', 'Shalom Jerusalem');
    cy.get('@suggestions').eq(1).find('.track-album').should('have.text', 'Shalom Jerusalem');
    cy.get('@hint').should('have.value', 'shalom Jerusalem');
  });

  it('Displays correct hint for multiple space-separated queries', () => {
    cy.get('#input-eight').as('input8').type('    it', { delay: 100 });
    cy.get('.typeahead-test-eight .tt-hint').as('hint').should('have.value', '    it is good');

    cy.get('@input8').clear().type('   it   i', { delay: 100 });
    cy.get('@hint').should('have.value', '   it   is good');

    cy.get('@input8').clear().type('it    ', { delay: 100 });
    cy.get('@hint').should('have.value', 'it    is good');

    cy.get('@input8').clear().type('   it   i s', { delay: 100 });
    cy.get('@hint').should('have.value', '');
  });

  it('Displays suggestions for data-collisions with default identity function (identifier)', () => {
    cy.get('#input-nine').as('input9').type('sh', { delay: 100 });
    cy.get('.typeahead-test-nine .tt-list')
      .as('list')
      .children('.tt-suggestion')
      .should('contain.text', 'Black Sheeep');

    cy.get('@input9').clear().type('dbl', { delay: 100 });
    cy.get('@list').children('.tt-suggestion').as('suggestions').should('have.length', 6);
    cy.get('@suggestions').each(($item) => {
      cy.wrap($item).should('not.contain.text', 'Sheeep');
    });
  });

  it('Display suggestions for data-collisions with custom identity function', () => {
    cy.get('#input-twelve').as('input12').type('O night', { delay: 100 });
    cy.get('.typeahead-test-twelve .tt-list').as('list').children().should('have.length', 3);
  });

  it('Displays remote suggestions with custom requestOptions (POST with payload)', () => {
    cy.intercept('POST', 'https://restcountries.com/v2/name/*', (req) => {
      expect(req.body).to.include({
        hello: 'world',
      });
      req.reply({
        fixture: 'countries.json',
      });
    }).as('getCountries');
    cy.get('#input-ten').as('input10').type('au', { delay: 100 });
    cy.wait('@getCountries');
    cy.get('.typeahead-test-ten .tt-list').as('list').children('.tt-suggestion').should('contain.text', 'Australia');
  });

  it('Executes onSubmit hook', () => {
    cy.get('#input-eleven').as('input11').type('dar', { delay: 100 });
    cy.get('.typeahead-test-eleven .tt-list').as('list').children().should('have.length', 4);

    // select value via kbd
    cy.get('@input11').type('{downarrow}{enter}');
    cy.get('.onsubmit_test').should('contain.text', '#DBLD');

    // select value via mouse
    cy.get('@input11').clear().type('p');
    cy.get('@list').children().first().click();
    cy.get('@input11').type('{enter}');
    cy.get('.onsubmit_test').should('contain.text', '#PR');

    // submit without selecting a value
    cy.get('@input11').clear().type('dar{enter}');
    cy.get('.onsubmit_test').should('contain.text', 'Passed');
  });

  it('Displays correct suggestions with diacritics enabled', () => {
    cy.get('#input-thirteen').as('input13').type('e', { delay: 100 });
    cy.get('.typeahead-test-thirteen .tt-list').as('list').children().should('have.length', 4);

    cy.get('@input13').clear().type('rhô', { delay: 100 });
    cy.get('@list').children('.tt-suggestion').should('contain.text', 'Rhône');
    cy.get('.typeahead-test-thirteen .tt-list .tt-suggestion .tt-highlight').should('contain.text', 'Rhô');
    cy.get('.typeahead-test-thirteen .tt-hint').as('hint13').should('have.value', 'rhône');

    cy.get('@input13').clear().type('rho'); // query without accents
    cy.get('@list').children('.tt-suggestion').should('contain.text', 'Rhône');
    cy.get('.typeahead-test-thirteen .tt-list .tt-suggestion .tt-highlight').should('contain.text', 'Rhô'); // diacritics must be applied to the highlight element too
    cy.get('.typeahead-test-thirteen .tt-hint').as('hint13').should('have.value', 'rhone'); // diacritics must be applied to the hint too
  });

  it('Retains events that are added before or/and after initialising typeahead', () => {
    cy.get('.section-fourteen button').click();
    //  check required attr
    cy.get('#input-fourteen').as('input14').should('have.attr', 'required');
    cy.get('.section-fourteen input:invalid').should('have.length', 1);

    // verify that the attached event listeners are called
    cy.get('#input-fourteen').as('input14').type('z', { delay: 100 });
    cy.get('.pre_typeahead_handler').should('contain.text', 'z');
    cy.get('.post_typeahead_handler').should('contain.text', 'z');
  });

  it('Emits a custom event when a suggestion is selected', () => {
    // via mouse click
    cy.get('#input-fifteen').as('input15').type('d', { delay: 100 });
    cy.get('.customInputEvent_handler').as('textField').should('contain.text', 'd');
    cy.get('.typeahead-test-fifteen .tt-list').as('list').children().should('have.length', 3);
    cy.get('@list').children('.tt-suggestion').eq(2).click();
    cy.get('@textField').should('contain.text', 'Blue Darker');

    // via keyboard
    cy.get('@input15').clear().type('g{uparrow}{enter}', { delay: 100 });
    cy.get('@textField').should('contain.text', 'Light Grey [GRL]');
  });

  // https://on.cypress.io/interacting-with-elements
});
