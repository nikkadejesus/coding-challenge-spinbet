/**
 * Casino Lobby Search – E2E tests
 *
 * Test design: TEST_CASES.md
 *
 * SEARCH_TC_01: Exact Match & Game Launch
 * SEARCH_TC_02: Guest Access Restrictions
 * SEARCH_TC_03: Partial Match (Predictive Search)
 * SEARCH_TC_04: Invalid search shows no results
 */

import SearchPage from "../pages/SearchPage";
import { getExistingUser } from '../support/utils/user-data';

const viewports = [
    { device: 'mobile', width: 375, height: 812 }, // iPhone-X size
    { device: 'desktop', width: 1440, height: 900 }
];

const casino_url = "/casino";
const base_search_url = `https://spinbet-staging-api.sgldemo.xyz/player/api/v1`;
const game_name = "Sweet Bonanza";
const partial_search = "Sweet";
const invalid_search = "thisgamedoesnotexist";

viewports.forEach(({ device, width, height }) => {
    describe("Casino Lobby – Search", () => {
        let existingUser;

        beforeEach(() => {
            cy.viewport(width, height);
            SearchPage.visit();
            cy.url().should("include", casino_url);
        });

        it("SEARCH_TC_01 - Exact Match & Game Launch", () => {
            existingUser = getExistingUser();
            SearchPage.login(existingUser.username, existingUser.password);
            SearchPage.openSearch(device, 'logged in');

            cy.intercept(
                "GET",
                `${base_search_url}/game-assets?query=${game_name.replaceAll(' ', '+')}&includes%5B%5D=restrictedLocales`,
            ).as("searchGames");

            SearchPage.inputSearch(game_name);
            cy.wait("@searchGames");

            SearchPage.verifyGameFunctions(game_name);
            SearchPage.expectGameRunning();
        });

        it("SEARCH_TC_02 - Guest Access Restrictions", () => {
            SearchPage.openSearch(device, 'guest');

            cy.intercept(
                "GET",
                `${base_search_url}/game-assets?query=${game_name.replaceAll(' ', '+')}&includes%5B%5D=restrictedLocales`,
            ).as("searchGames");

            SearchPage.inputSearch(game_name);
            cy.wait("@searchGames");

            SearchPage.verifyLoggedOutGameBehavior(game_name)
        });

        it("TC-03: Partial Match (Predictive Search)", () => {
            SearchPage.openSearch(device, 'guest');

            cy.intercept(
                "GET",
                `${base_search_url}/game-assets?query=${partial_search.replaceAll(' ', '+')}&includes%5B%5D=restrictedLocales`,
            ).as("searchGames");

            SearchPage.inputSearch(partial_search);
            cy.wait("@searchGames").then((res) => {
                const games = res.response.body.data;

                expect(res.response.statusCode).to.eq(200);
                expect(games.length).to.be.greaterThan(0);

                games.forEach((game) => {
                    expect(game.name.toLowerCase()).to.include(partial_search.toLowerCase());
                    cy.log(`You searched for ${partial_search}. ${game.name} ha a partial match.`);
                });
            });
        });

        it("TC-04: Invalid search term shows no results", () => {
            SearchPage.openSearch(device, 'guest');

            cy.intercept(
                "GET",
                `${base_search_url}/game-assets?query=${invalid_search.replaceAll(' ', '+')}&includes%5B%5D=restrictedLocales`,
            ).as("searchGames");

            SearchPage.inputSearch(invalid_search);
            cy.wait("@searchGames").then((res) => {
                const games = res.response.body.data;

                expect(res.response.statusCode).to.eq(200);
                expect(games.length).to.eq(0);

                cy.contains('No results found').should('be.visible');
            });
        });
    });
});
