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

  it('Shows correct hint', () => {
    cy.get('#input-one').type('g', { delay: 100 });
    cy.get('.typeahead-test-one .tt-hint').should('have.value', 'grey');

    cy.get('#input-one').type('{backspace}black l', { delay: 100 });
    cy.get('.typeahead-test-one .tt-hint').should('have.value', 'black light');
  });

  it('Navigates between suggestions via Keyboard correctly', () => {
    cy.get('#input-one').type('b', { delay: 100 });
    cy.get('.typeahead-test-one .tt-list').as('list').children().should('have.length', 5);

    cy.get('#input-one').type('{downarrow}{downarrow}');
    cy.get('@list').children('.tt-selected').as('selectedSuggestion').should('have.text', 'Black');

    cy.get('#input-one').type('{downarrow}{downarrow}');
    cy.get('@list').children('.tt-selected').as('selectedSuggestion').should('have.text', 'Blue');

    cy.get('#input-one').type('{downarrow}');
    cy.get('@list').children('.tt-selected').as('selectedSuggestion').should('have.text', 'Brown');

    cy.get('#input-one').type('{uparrow}{uparrow}');
    cy.get('@list').children('.tt-selected').as('selectedSuggestion').should('have.text', 'Black Light');
  });

  // https://on.cypress.io/interacting-with-elements
});
