/// <reference types="cypress" />

context('Typeahead Accessibility test', () => {
  beforeEach(() => {
    cy.visit('/demo/accessibility-test.html');
    cy.injectAxe();
  });

  it('markup should be accessible', () => {
    // verify position of typeahead
    cy.get('.input-container').children().should('have.length', 3);
    cy.get('.input-container').children().eq(1).should('have.class', 'typeahead-standalone');

    cy.get('.search').type('fla', { delay: 200 });
    cy.get('.typeahead-accessibility-ex .tt-list').as('list').should('exist');
    cy.get('@list').children().should('have.length', 3);
    cy.get('@list').children('.tt-selected').should('have.length', 0);

    cy.checkA11y();
  });
});
