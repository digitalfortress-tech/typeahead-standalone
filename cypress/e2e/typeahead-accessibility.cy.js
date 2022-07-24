/// <reference types="cypress" />

context('Typeahead Accessibility test', () => {
  beforeEach(() => {
    cy.visit('/demo/accessibility-test.html');
    cy.injectAxe();
  });

  it('markup should be accessible', () => {
    cy.get('.search').type('fla', { delay: 100 });
    cy.get('.typeahead-example-1 .tt-list').as('list').should('exist');
    cy.get('@list').children().should('have.length', 3);
    cy.get('@list').children('.tt-selected').should('have.length', 0);

    cy.checkA11y();
  });
});
