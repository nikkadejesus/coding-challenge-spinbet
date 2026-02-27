class SearchPage {
    path = "/casino";

    searchButtons = {
        mobile_search: () => cy.contains('[data-testid="mobile-menu-list"] div', 'Search'),
        desktop_search: () => cy.get(".casino-filter-tabs-wrapper").find("button[aria-label='Search']")
    }

    loginFields = {
        login_btn: () => cy.contains('button', 'Login'),
        username: () => cy.get('input[placeholder="e.g. John Doe"]'),
        password: () => cy.get('input[placeholder="Min 6 characters"]'),
        signin_btn: () => cy.contains('button#signin-button', 'Sign In')
    }

    get searchInput() {
        return cy.get('input[placeholder="Search"]');
    }

    get gameFrame() {
        return cy.get('iframe[name="game-launcher-by-url"]', { timeout: 30000 });
    }

    // --- Action Methods ---
    visit() {
        cy.visit(this.path);
    }

    login(username, password) {
        this.loginFields.login_btn().click();
        cy.url().should('include', '/?overlay=login');

        this.loginFields.username().type(username, { delay: 100 });
        this.loginFields.password().type(password, { delay: 100 });

        cy.intercept('POST', "**/player/api/v1/signin", (req) => {
            req.continue((res) => {
                expect(res.statusCode).to.eq(200);
            });
        }).as('signin');

        this.loginFields.signin_btn().click();
        cy.wait('@signin');
    }

    openSearch(device, usertype) {
        this.searchButtons[`${device}_search`]().click();
        this.searchInput.should("be.visible");
    }

    inputSearch(query) {
        this.searchInput.clear().type(query);
    }

    getGameSelector(game_name) {
        return cy.get(`a.game-item-link[aria-label="${game_name}"]`);
    }

    verifyGameFunctions(game_name) {
        this.getGameSelector(game_name)
            .first()
            .trigger("mouseover", { force: true })
            .should('exist')
            .click({ force: true });

        cy.url().should('include', `/casino-game/${game_name.toLowerCase().replace(' ', '-')}`);
    }

    verifyLoggedOutGameBehavior(game_name) {
        this.getGameSelector(game_name)
            .first()
            .trigger("mouseover", { force: true })
            .should('exist')
            .click({ force: true });

        cy.get('body').then(($body) => {
            if ($body.find('.css-1n3k10x').length > 0) {
                // --- MOBILE BEHAVIOR ---
                cy.log('Detected Mobile View');
                // Verify "Play now" and "Demo" buttons exist
                cy.contains('Play now').should('be.visible');
                cy.contains('Demo').should('be.visible');

                // Attempt to play the game
                cy.contains('Play now').click();

                // Verify login form pops up
                cy.url().should('include', '?overlay=login');
            } else {
                // --- DESKTOP BEHAVIOR ---
                cy.log('Detected Desktop View');
                cy.get('.game-error')
                    .should('be.visible')
                    .and('contain', 'Please login or register to play');
            }
        });
    }

    expectGameRunning() {
        this.gameFrame.should("be.visible");
        this.gameFrame.should(($iframe) => {
            const src = $iframe.attr("src") || "";

            // Assert that the src is not empty and looks like a URL
            expect(src).to.not.be.empty;
            expect(src).to.match(/https?:\/\//);
        });
    }

    checkGameLauncherError() {
        cy.contains('login or register to play', { timeout: 15000 })
            .should('be.visible');
    }
}
export default new SearchPage();