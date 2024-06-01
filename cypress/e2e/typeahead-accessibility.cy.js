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

  it('should highlight all search terms', () => {
    cy.get('.search').clear().type('d doc stran', { delay: 100 });
    cy.get('.typeahead-accessibility-ex .tt-list').as('list').should('exist');
    cy.get('@list').children().should('have.length', 5);
    cy.get('.tt-list .tt-suggestion').eq(0).find('.tt-highlight').as('suggestion1_highlight').should('have.length', 6);
    cy.get('@suggestion1_highlight').first().should('have.text', 'Doc');
    cy.get('@suggestion1_highlight').eq(1).should('have.text', 'Stran');

    cy.get('@list').children('.tt-selected').should('have.length', 0);
  });
});
