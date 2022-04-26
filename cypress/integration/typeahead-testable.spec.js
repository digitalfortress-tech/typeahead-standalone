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

  it('Highlights matched text', () => {
    cy.get('#input-two').as('input2').type('gr', { delay: 100 });
    cy.get('.typeahead-test-two .tt-list .tt-highlight').first().should('have.text', 'Gr');
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
    cy.get('@list').children('.tt-selected').as('selectedSuggestion').should('have.text', 'Golden Brown');

    cy.get('@input1').type('{downarrow}{downarrow}{downarrow}');
    cy.get('@list').children('.tt-selected').as('selectedSuggestion').should('have.text', 'Gold');

    cy.get('@input1').type('{downarrow}{downarrow}');
    cy.get('@list').children('.tt-selected').as('selectedSuggestion').should('have.text', 'Golden Brown');

    cy.get('@input1').type('{downarrow}');
    cy.get('@list').children('.tt-selected').as('selectedSuggestion').should('have.length', 0);

    cy.get('@input1').type('{downarrow}');
    cy.get('@list').children('.tt-selected').as('selectedSuggestion').should('have.text', 'Grey');

    cy.get('@input1').type('{uparrow}');
    cy.get('@list').children('.tt-selected').as('selectedSuggestion').should('have.length', 0);

    cy.get('@input1').type('{uparrow}{uparrow}');
    cy.get('@list').children('.tt-selected').as('selectedSuggestion').should('have.text', 'Green');
  });

  it('Navigates between suggestions via Keyboard with autoSelect enabled', () => {
    cy.get('#input-two').as('input2').type('bl', { delay: 100 });
    cy.get('.typeahead-test-two .tt-list').as('list').children().should('have.length', 5);
    cy.get('@list').children('.tt-selected').as('selectedSuggestion').should('have.text', 'Blue'); // auto selects first suggestion

    cy.get('@input2').type('{downarrow}{downarrow}');
    cy.get('@list').children('.tt-selected').as('selectedSuggestion').should('have.text', 'Blue Dark');

    cy.get('@input2').type('{downarrow}{downarrow}');
    cy.get('@list').children('.tt-selected').as('selectedSuggestion').should('have.text', 'Dark Blue');

    cy.get('@input2').type('{downarrow}');
    cy.get('@list').children('.tt-selected').as('selectedSuggestion').should('have.length', 0);

    cy.get('@input2').type('{downarrow}{uparrow}{uparrow}{uparrow}');
    cy.get('@list').children('.tt-selected').as('selectedSuggestion').should('have.text', 'Black Light');
  });

  it('Uses custom display config option', () => {
    cy.get('#input-two').type('ye', { delay: 100 });
    cy.get('.typeahead-test-two .tt-list').as('list').children().first().should('have.length', 1);
    cy.get('.typeahead-test-two .tt-hint').should('have.value', 'yellow - YW');
    cy.get('@list').children().first().click();
    cy.get('#input-two').should('have.value', 'Yellow - YW');

    // typing {tab} key is not supported yet
    cy.get('#input-two').clear().type('ye{enter}');
    cy.get('#input-two').should('have.value', 'Yellow - YW');
  });

  it('Submits correct data', () => {
    cy.get('#input-two').type('li', { delay: 100 });
    cy.get('.typeahead-test-two .tt-list').as('list').children().eq(1).should('have.text', 'Blue Extra Light');

    // typing {tab} key is not supported yet
    cy.get('#input-two').type('{downarrow}{enter}');
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

  it('Displays Templates', () => {
    cy.get('#input-four').as('input4').type('p', { delay: 100 });
    cy.get('.typeahead-test-four .tt-list').as('list').children().should('have.length', 4);

    // header, footer, suggestion template
    cy.get('@list').children('.tt-header').should('have.length', 1);
    cy.get('.typeahead-test-four .tt-header').should('have.text', 'Colors Found');
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
    cy.get('.typeahead-test-four .tt-notFound').should('contain.text', 'Nothing Found');

    // group template
    cy.get('@input4').clear().type('bla', { delay: 100 });
    cy.get('@list').children('.tt-group').as('group').should('have.length', 1);
    cy.get('@group').children('.custom-group').should('have.length', 1);
    cy.get('@group').children('.custom-group').should('have.text', 'Shades of Black');
  });

  it('Displays expected suggestions with Data-Tokens', () => {
    cy.get('#input-five').as('input5').type('yw', { delay: 100 });
    cy.get('.typeahead-test-five .tt-list').as('list').children().should('have.length', 1);
    cy.get('@list').children('.tt-suggestion').should('have.text', 'Yellow');
    cy.get('.typeahead-test-five .tt-hint').as('hint').should('have.value', '');
    cy.get('.typeahead-test-five .tt-highlight').as('highlight').should('not.exist');

    cy.get('@input5').clear().type('lbl', { delay: 100 });
    cy.get('@list').children('.tt-suggestion').as('suggestions').should('have.length', 2);
    cy.get('@list').children('.tt-group').as('groups').should('have.length', 1);
    cy.get('@suggestions').first().should('have.text', 'Blue Light');
    cy.get('@suggestions').eq(1).should('have.text', 'Blue Extra Light');
    cy.get('@hint').should('have.value', '');
    cy.get('@highlight').should('not.exist');
  });

  it('Displays suggestions from a Remote Source', () => {
    cy.intercept('GET', 'https://restcountries.com/v2/name/*', { fixture: 'countries.json' }).as('getCountries');
    cy.get('#input-six').as('input6').type('par', { delay: 100 });
    cy.wait('@getCountries');

    cy.get('.typeahead-test-six .tt-list').as('list').children().should('have.length', 5);
    cy.get('@list').children('.tt-suggestion').eq(1).should('have.text', 'France, Paris');
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

  it('displays suggestions for multiple space-separated queries having correct/reverse order', () => {
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

  it('displays correct hint for multiple space-separated queries', () => {
    cy.get('#input-eight').as('input8').type('    it', { delay: 100 });
    cy.get('.typeahead-test-eight .tt-hint').as('hint').should('have.value', '    it is good');

    cy.get('@input8').clear().type('   it   i', { delay: 100 });
    cy.get('@hint').should('have.value', '   it   is good');

    cy.get('@input8').clear().type('it    ', { delay: 100 });
    cy.get('@hint').should('have.value', 'it    is good');

    cy.get('@input8').clear().type('   it   i s', { delay: 100 });
    cy.get('@hint').should('have.value', '');
  });

  it('displays suggestions for data-collisions', () => {
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

  it('displays remote suggestions with custom requestOptions (POST with payload)', () => {
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
    cy.get('@input11').type('{downarrow}{enter}');
    cy.get('.onsubmit_test').should('contain.text', '#DBLD');

    cy.get('@input11').clear().type('dar{enter}');
    cy.get('.onsubmit_test').should('contain.text', 'Passed');
  });

  // https://on.cypress.io/interacting-with-elements
});
