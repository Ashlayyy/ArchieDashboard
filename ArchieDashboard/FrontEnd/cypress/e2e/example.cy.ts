describe('login page', () => {
  it('shows the login control', () => {
    cy.visit('/login');
    cy.get('button').should('exist');
  });
});
