/// <reference types="cypress" />

context('Typeahead', () => {
  beforeEach(() => {
    cy.visit('/demo/testable.html');
  });

  it('Shows suggestions on keypress', () => {
    cy.get('#input-one').type('g', { delay: 100 });
    cy.get('.typeahead-test-one .tt-list').as('list').should('exist');
    cy.get('@list').children().should('have.length', 3);
    cy.get('@list').children('.tt-selected').as('selectedSuggestion').should('have.length', 1);
    cy.get('@selectedSuggestion').should('have.text', 'Grey');
  });

  it('Shows hint', () => {
    cy.get('#input-two').as('input2').type('gr', { delay: 100 });
    cy.get('.typeahead-test-two .tt-hint').as('hint2').should('have.value', 'grey');

    cy.get('@input2').type('{backspace}{backspace}black l', { delay: 100 });
    cy.get('@hint2').should('have.value', 'black light');
  });

  it('Highlights matched text', () => {
    cy.get('#input-two').as('input2').type('gr', { delay: 100 });
    cy.get('.typeahead-test-two .tt-list .tt-highlight').first().should('have.text', 'Gr');
  });

  it('Navigates between suggestions via Keyboard', () => {
    cy.get('#input-two').as('input2').type('bl', { delay: 100 });
    cy.get('.typeahead-test-two .tt-list').as('list').children().should('have.length', 5);

    cy.get('@input2').type('{downarrow}{downarrow}');
    cy.get('@list').children('.tt-selected').as('selectedSuggestion').should('have.text', 'Blue');

    cy.get('@input2').type('{downarrow}{downarrow}');
    cy.get('@list').children('.tt-selected').as('selectedSuggestion').should('have.text', 'Blue Light');

    cy.get('@input2').type('{downarrow}');
    cy.get('@list').children('.tt-selected').as('selectedSuggestion').should('have.text', 'Black');

    cy.get('@input2').type('{uparrow}{uparrow}');
    cy.get('@list').children('.tt-selected').as('selectedSuggestion').should('have.text', 'Blue Extra Light');
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
    cy.get('.typeahead-test-four .tt-selected .preview').should('exist');
    cy.get('.typeahead-test-four .tt-selected .text').should('exist');

    // notFound template
    cy.get('@input4').type('p', { delay: 100 });
    cy.get('@list').children().should('have.length', 1);
    cy.get('.typeahead-test-four .tt-notFound').should('contain.text', 'Nothing Found');

    // group template
    cy.get('@input4').type('{backspace}{backspace}bla', { delay: 100 });
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

    cy.get('@input5').type('{backspace}{backspace}lbl', { delay: 100 });
    cy.get('@list').children('.tt-suggestion').as('suggestions').should('have.length', 2);
    cy.get('@list').children('.tt-group').as('groups').should('have.length', 1);
    cy.get('@suggestions').first().should('have.text', 'Blue Light');
    cy.get('@suggestions').eq(1).should('have.text', 'Blue Extra Light');
    cy.get('@hint').should('have.value', '');
    cy.get('@highlight').should('not.exist');
  });

  it('Displays suggestions from a Remote Source', () => {
    cy.intercept('GET', 'https://restcountries.eu/rest/v2/name/*', { fixture: 'countries.json' }).as('getCountries');
    cy.get('#input-six').as('input6').type('pa', { delay: 100 });
    cy.wait('@getCountries');

    cy.get('.typeahead-test-six .tt-list').as('list').children().should('have.length', 5);
    cy.get('@list').children('.tt-suggestion').eq(1).should('have.text', 'France, Paris');
  });

  it('Displays suggestions from Prefetch', () => {
    cy.intercept('GET', 'https://restcountries.eu/rest/v2/name/*', { fixture: 'countries.json' }).as('getCountries');
    cy.get('#input-seven').as('input7').focus();
    cy.wait('@getCountries');

    cy.get('@input7').type('pa', { delay: 100 });
    cy.get('.typeahead-test-seven .tt-list').as('list').children().should('have.length', 5);
    cy.get('@list').children('.tt-suggestion').eq(1).should('have.text', 'France, Paris');
  });

  // https://on.cypress.io/interacting-with-elements
});
