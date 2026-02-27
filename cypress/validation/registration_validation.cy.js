import RegistrationPage from '../pages/RegistrationPage';
import { generateNZUser } from '../support/utils/user-data';

const viewports = [
    { device: 'Mobile', width: 375, height: 812 }, // iPhone-X size
    { device: 'Desktop', width: 1440, height: 900 }
];

viewports.forEach(({ device, width, height }) => {
    describe(`Spinbet Registration - Step 1 Validation (${device} View)`, () => {
        let newUser;

        const username_tests = [
            { input: 'ab', expected: 'Your username must be at least 6 characters long.' },
            { input: 'thisiswaytoolongforausername', expected: 'Username must not be longer than 15 characters.' },
            { input: 'user name!', expected: 'Usernames can only contain letters (a–z), numbers (0–9), underscores (_), and periods (.), with no spaces.' },
            { input: 'testuser', expected: 'This username has already been taken.' },
            { input: 'test_user', expected: 'The username must only contain letters and numbers.' }
        ];
        const email_tests = [
            { input: 'invalid email', expected: 'Email provided is invalid.' },
            { input: 'testuser@email.com', expected: 'This email has already been taken.' }
        ];

        const password_tests = {
            input: '123',
            expected: 'Password should be at least 6 characters.'
        };

        const phone_tests = [
            { input: '00000000', expected: 'The phone number is invalid phone number.' },
            { input: '02000000000', expected: 'The phone number has already been taken.' }
        ];

        beforeEach(() => {
            newUser = generateNZUser();
            cy.viewport(width, height);
            cy.log(`Running tests in ${device} mode (${width}x${height})`);
            cy.setupRegistrationIntercepts();
            RegistrationPage.visit();
            cy.wait('@getRealtimeGames');
            RegistrationPage.sign_up();
        });

        username_tests.forEach(test => {
            it(`Validation check for username - ${test.input}`, () => {
                RegistrationPage.inputUsername(test.input);
                RegistrationPage.inputEmail(newUser.email);
                RegistrationPage.inputPassword(newUser.password);
                RegistrationPage.inputMobile(newUser.mobile_phone);
                RegistrationPage.verifyNextEnabled('account');
                RegistrationPage.clickNext('account');

                // This is not supposed to be necessary if we are to follow the logic behind other input fields' behavior
                // Will only do this just to show error messages are being displayed when given invalid inputs
                if (test.input == "testuser" || test.input == "test_user") {
                    cy.intercept('POST', "**/player/api/v1/signup", (req) => {
                        req.continue((res) => {
                            expect(res.statusCode).to.eq(422);
                        });
                    }).as('signupFail');

                    RegistrationPage.acceptTerms();
                    RegistrationPage.clickNext('bonus');

                    cy.wait('@signupFail');
                }

                RegistrationPage.getErrorMsg(test.expected);
            });
        });

        email_tests.forEach(test => {
            it(`Validation check for email - ${test.input}`, () => {
                RegistrationPage.inputUsername(newUser.username);
                RegistrationPage.inputEmail(test.input);
                RegistrationPage.inputPassword(newUser.password);
                RegistrationPage.inputMobile(newUser.mobile_phone);
                RegistrationPage.verifyNextEnabled('account');
                RegistrationPage.clickNext('account');

                if (test.input == "testuser@email.com") {
                    cy.intercept('POST', "**/player/api/v1/signup", (req) => {
                        req.continue((res) => {
                            expect(res.statusCode).to.eq(422);
                        });
                    }).as('signupFail');

                    RegistrationPage.acceptTerms();
                    RegistrationPage.clickNext('bonus');

                    cy.wait('@signupFail');
                }

                RegistrationPage.getErrorMsg(test.expected);
            });
        });

        it(`Validation check for password - ${password_tests.input}`, () => {
            RegistrationPage.inputUsername(newUser.username);
            RegistrationPage.inputEmail(newUser.email);
            RegistrationPage.inputPassword(password_tests.input);
            RegistrationPage.inputMobile(newUser.mobile_phone);
            RegistrationPage.verifyNextEnabled('account');
            RegistrationPage.clickNext('account');

            RegistrationPage.getErrorMsg(password_tests.expected);
        });

        phone_tests.forEach(test => {
            it(`Validation check for phone number - ${test.input}`, () => {
                cy.url().should('include', '/?overlay=account-details');
                RegistrationPage.inputUsername(newUser.username);
                RegistrationPage.inputEmail(newUser.email);
                RegistrationPage.inputPassword(newUser.password);
                RegistrationPage.inputMobile(test.input);
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

                RegistrationPage.getErrorMsg(test.expected);
            });
        });

        it('Validation check for invalid promotion code', () => {
            cy.url().should('include', '/?overlay=account-details');
            RegistrationPage.inputUsername(newUser.username);
            RegistrationPage.inputEmail(newUser.email);
            RegistrationPage.inputPassword(newUser.password);
            RegistrationPage.inputMobile(newUser.mobile_phone);
            RegistrationPage.verifyNextEnabled('account');
            RegistrationPage.clickNext('account');

            // Ensure button is disabled by default
            RegistrationPage.verifyNextDisabled('bonus');
            RegistrationPage.verifySkipBonusDisabled();
            RegistrationPage.inputPromoCode('1');
            RegistrationPage.acceptTerms();
            RegistrationPage.verifySkipBonusEnabled();
            RegistrationPage.verifyNextEnabled('bonus');
            RegistrationPage.clickNext('bonus');
            cy.wait('@signup')

            RegistrationPage.getErrorMsg('Invalid promotion code');
        });
    });
});