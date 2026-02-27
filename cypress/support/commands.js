// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('setupRegistrationIntercepts', (expectedSignupStatus = 200) => {
    // Kill cookie
    cy.intercept('GET', '**/otSDKStub.js', { body: '' });
    cy.intercept('GET', '**/onetrust.org/**', { body: '' });

    const base_url = 'https://spinbet-staging-api.sgldemo.xyz/player/api/v1';

    // Helper function to avoid repeating codes
    const interceptAndVerify = (method, url, alias, status = 200) => {
        cy.intercept(method, url, (req) => {
            req.continue((res) => {
                expect(res.statusCode, `Check status of ${alias}`).to.eq(status);
            });
        }).as(alias);
    };

    interceptAndVerify('GET', `${base_url}/realtime/games`, 'getRealtimeGames');
    interceptAndVerify('POST', `${base_url}/signup`, 'signup');
    interceptAndVerify('GET', `${base_url}/profile`, 'getProfile');
    interceptAndVerify('GET', `${base_url}/wallets`, 'getWallets');
    interceptAndVerify('GET', `${base_url}/payment-options?ipo=true&currency_code=NZD`, 'paymentOptions');

    interceptAndVerify('POST', `${base_url}/signup`, 'signup', expectedSignupStatus);
});