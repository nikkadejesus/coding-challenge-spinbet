/**
 * Spinbet Registration – E2E tests
 *
 * Test design: see TEST_CASES.md
 *
 * REG_TC_01 - Should successfully register a new user (Happy Path)
 * REG_TC_02 - Form Validation (Existing user)
 * REG_TC_03 - Terms & Conditions Compliance
 */

import RegistrationPage from '../pages/RegistrationPage';
import { generateNZUser } from '../support/utils/user-data';

const viewports = [
    { device: 'Mobile', width: 375, height: 812 }, // iPhone-X size
    { device: 'Desktop', width: 1440, height: 900 }
];

viewports.forEach(({ device, width, height }) => {
    describe(`Spinbet End-to-End Registration Flow (${device} View)`, () => {
        let newUser;

        beforeEach(() => {
            newUser = generateNZUser();
            cy.viewport(width, height);
            cy.log(`Running tests in ${device} mode (${width}x${height})`);
            cy.setupRegistrationIntercepts();
            RegistrationPage.visit();
            cy.wait('@getRealtimeGames');
            RegistrationPage.sign_up();
        });

        it('REG_TC_01 - Should successfully register a new user (Happy Path)', () => {
            // --- Step 1: Account Details ---
            cy.url().should('include', '/?overlay=account-details');
            RegistrationPage.inputUsername(newUser.username);
            RegistrationPage.inputEmail(newUser.email);
            RegistrationPage.inputPassword(newUser.password);
            RegistrationPage.inputMobile(newUser.mobile_phone);
            RegistrationPage.verifyNextEnabled('account');
            RegistrationPage.clickNext('account');

            // --- Step 2: Bonus Selection ---
            cy.url().should('include', '/?overlay=bonus-selection');
            RegistrationPage.verifyNextDisabled('bonus');
            RegistrationPage.acceptTerms();
            RegistrationPage.verifyNextEnabled('bonus');
            RegistrationPage.clickNext('bonus');
            cy.wait(['@signup', '@getProfile']);

            // --- Step 3: Personal Information ---
            cy.url().should('include', '/?overlay=personal-information');
            RegistrationPage.verifyNextDisabled('personal_address');
            RegistrationPage.inputFirstName(newUser.first_name);
            RegistrationPage.inputLastName(newUser.last_name);
            RegistrationPage.inputDoB(newUser.dob);
            RegistrationPage.verifyNextEnabled('personal_address');
            RegistrationPage.clickNext('personal_address');
            cy.wait('@getWallets');

            // --- Step 4: Address Details ---
            cy.url().should('include', '/?overlay=address-details');
            RegistrationPage.verifyNextDisabled('personal_address');
            RegistrationPage.inputAddress(newUser.address);
            RegistrationPage.inputCity(newUser.city);
            RegistrationPage.selectRegion(newUser.region);
            RegistrationPage.inputZipcode(newUser.zipcode);
            RegistrationPage.verifyNextEnabled('personal_address');
            RegistrationPage.clickNext('personal_address');
            cy.wait('@paymentOptions');

            // --- Step 5: Payment Information ---
            cy.url().should('include', '/?overlay=payment-information');
            RegistrationPage.selectPayment(newUser.payment_provider);
            RegistrationPage.inputCustomAmount(newUser.amount);
            // RegistrationPage.selectPredefinedAmount();

            RegistrationPage.clickDeposit();

            RegistrationPage.verifySnackbarIsVisible("deposit");
            RegistrationPage.verifyTotalPaymentAmount(newUser.amount);
            RegistrationPage.completePayment(newUser.email);
            RegistrationPage.verifySnackbarIsVisible("payment");
        });

        it('REG_TC_02 - Form Validation (Existing user)', () => {
            const taken_email = 'testuser@email.com';

            RegistrationPage.inputUsername(newUser.username);
            RegistrationPage.inputEmail(taken_email);
            RegistrationPage.inputPassword(newUser.password);
            RegistrationPage.inputMobile(newUser.mobile_phone);
            RegistrationPage.verifyNextEnabled('account');
            RegistrationPage.clickNext('account');

            cy.intercept('POST', "**/player/api/v1/signup", (req) => {
                req.continue((res) => {
                    expect(res.statusCode).to.eq(422);
                });
            }).as('signupFail');

            RegistrationPage.acceptTerms();
            RegistrationPage.clickNext('bonus');

            cy.wait('@signupFail');

            RegistrationPage.getErrorMsg('This email has already been taken.');
        });

        it('REG_TC_03 - Terms & Conditions Compliance', () => {
            // --- Step 1: Account Details ---
            RegistrationPage.inputUsername(newUser.username);
            RegistrationPage.inputEmail(newUser.email);
            RegistrationPage.inputPassword(newUser.password);
            RegistrationPage.inputMobile(newUser.mobile_phone);
            RegistrationPage.verifyNextEnabled('account');
            RegistrationPage.clickNext('account');

            // Ensure button is disabled by default
            RegistrationPage.verifyNextDisabled('bonus');
            RegistrationPage.verifySkipBonusDisabled();
            RegistrationPage.acceptTerms();
            RegistrationPage.verifyNextEnabled('bonus');
            RegistrationPage.verifySkipBonusEnabled();

            // Uncheck to see if buttons a disabled
            RegistrationPage.unacceptTerms();
            RegistrationPage.verifyNextDisabled('bonus');
            RegistrationPage.verifySkipBonusDisabled();
        })
    });
});