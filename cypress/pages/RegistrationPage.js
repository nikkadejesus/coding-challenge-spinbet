class RegistrationPage {
    // --- Step 1: Account Details ---
    accountDetails = {
        username: () => cy.get('input[placeholder="e.g. John Doe"]'),
        email: () => cy.get('input[placeholder="your@email.address"]'),
        password: () => cy.get('input[placeholder="Min 6 characters"]'),
        country_dropdown: () => cy.get('div[role="combobox"]'),
        country_code: (code) => cy.get(`li[role="option"][data-value="${code}"]`),
        mobile_phone: () => cy.get('input[data-testid="phone_number"]'),
        ref_code: () => cy.get('input[placeholder="Type it here"]'),
    };

    // --- Step 2: Bonus Selection ---
    bonusSelection = {
        welcome_offer: () => cy.get('input[name="promo-radio-buttons-group"]'),
        promo_code: () => cy.get('input#promo_code'),
        subscribe_checkbox: () => cy.get('input[name="subscribe_promotion_campaign"]'),
        terms_checkbox: () => cy.get('input[name="terms"]'),
        skip_bonus: () => cy.get('#submit-no-bonus'),
    };

    // --- Step 3: Personal Information ---
    personalInformation = {
        first_name: () => cy.get('input[placeholder="First Name"]'),
        last_name: () => cy.get('input[placeholder="Last Name"]'),
        dob: () => cy.get('input[placeholder="DD/MM/YYYY"]'),
    };

    // --- Step 4: Address Details ---
    addressDetails = {
        address: () => cy.get('input[placeholder="Address"]'),
        city: () => cy.get('input[placeholder="City"]'),
        region: () => cy.get('div[role="combobox"]#state_id'),
        zipcode: () => cy.get('input[placeholder="Zip Code"]'),
    };

    // --- Step 5: Payment Information ---
    paymentInformation = {
        show_more_payments: () => cy.get('.show-more-payments'),
        cashier_iframe: 'iframe[data-cy="cashier-iframe"]:visible',
        provider_iframe: 'iframe[name="provider-redirect-iframe_PROCESS_PROCESS_REDIRECT"]:visible',

        getFormIframe: () => cy.iframe('iframe[data-cy="cashier-iframe"]:visible'),
        paysafe_submit_btn: 'button[ps-primary-button]',
        paysafe_amount_display: 'ps-balance .balance',
        paysafe_email: 'input[data-cy="email"]'
    };

    // --- Next Buttons ---
    nextButtons = {
        account: () => cy.get('button[data-testid="next-button"]'),
        bonus: () => cy.get('#submit-button'),
        personal_address: () => cy.get('button[aria-label="Next"]')
    }

    // --- Action Methods ---
    visit() {
        cy.visit('/')
    }

    sign_up() {
        cy.contains('button', 'Sign Up').click();
    }

    // --- Step 1: Account Details ---
    inputUsername(username) {
        this.accountDetails.username().type(username, { delay: 100 });
    }

    inputEmail(email) {
        this.accountDetails.email().type(email, { delay: 100 });
    }

    inputPassword(password) {
        this.accountDetails.password().type(password, { delay: 100 });
    }

    selectCountryCode(code) {
        this.accountDetails.country_dropdown().click();
        this.accountDetails.country_code(code).click();
    }

    inputMobile(mobile_phone) {
        this.accountDetails.mobile_phone().type(mobile_phone, { delay: 250 });
    }

    inputReferral(ref_code) {
        this.accountDetails.ref_code().type(ref_code);
    }

    // --- Step 2: Bonus Selection ---
    inputPromoCode(promo_code) {
        this.bonusSelection.promo_code().type(promo_code, { force: true });
    }

    acceptTerms() {
        this.bonusSelection.terms_checkbox().check({ force: true })
    }

    unacceptTerms() {
        this.bonusSelection.terms_checkbox().uncheck({ force: true })
    }

    clickSkipBonus() {
        this.bonusSelection.skip_bonus().click()
    }

    verifySkipBonusEnabled() {
        this.bonusSelection.skip_bonus().should('be.enabled');
    }

    verifySkipBonusDisabled() {
        this.bonusSelection.skip_bonus().should('be.disabled');
    }

    // --- Step 3: Personal Information ---
    inputFirstName(first_name) {
        this.personalInformation.first_name().click().type(first_name, { delay: 100 });
    }

    inputLastName(last_name) {
        this.personalInformation.last_name().click().type(last_name, { delay: 100 });
    }

    inputDoB(dob) {
        cy.get('input[placeholder="DD/MM/YYYY"]').then(($input) => {
            const isReadonly = $input.prop('readOnly');
            const [day, month, year] = dob.split('-');

            // Convert month to abbreviated form, e.g. '01' to 'Jan'
            // const month_abbrev = new Date(0, month - 1).toLocaleString('en-US', { month: 'short' });

            if (isReadonly) {
                // MOBILE
                cy.log('Handling mobile wheel datepicker');

                cy.wrap($input).click();

                cy.get('.datepicker').should('be.visible');

                // --- SELECT YEAR ---
                this.scrollWheelUntilVisible(2, year);

                // Intentionally commented this out as this choosing year was prioritized
                // --- SELECT MONTH ---
                // this.scrollWheelUntilVisible(1, month_abbrev);

                // --- SELECT DAY ---
                // this.scrollWheelUntilVisible(0, day);

                // Confirm selection
                cy.contains('.datepicker-navbar-btn', 'Select')
                    .should('be.visible')
                    .click();

            } else {
                // DESKTOP
                cy.log('Handling desktop manual input');

                cy.wrap($input)
                    .clear()
                    .type(dob.replaceAll('-', ''), { delay: 200 });
            }
        })
    }

    scrollWheelUntilVisible(column_index, value) {
        const scrollAttempt = (retries = 50) => {
            return cy.get('.datepicker-header').then(($header) => {
                const current_header_text = $header.text();
                if (current_header_text.includes(value)) {
                    cy.log(`SUCCESS: ${value} is selected in header.`);

                    return cy.get('.datepicker-col-1').eq(column_index)
                        .find('li')
                        .contains(value)
                }

                if (retries <= 0) throw new Error(`Could not find ${value}`);

                return cy.get('.datepicker-col-1').eq(column_index).then(($col) => {
                    cy.wrap($col).find('ul.datepicker-scroll')
                        .trigger('touchstart', { which: 1, pageY: 100, pageX: 50 })
                        .trigger('touchmove', { which: 1, pageY: 350, pageX: 50 })
                        .trigger('touchend', { force: true });

                    cy.wait(500); // Increased wait to let momentum settle

                    return scrollAttempt(retries - 1);
                });
            });
        };

        return scrollAttempt();
    }

    // --- Step 4: Address Details ---
    inputAddress(address) {
        this.addressDetails.address().type(address, { delay: 100 });
    }

    inputCity(city) {
        this.addressDetails.city().type(city, { delay: 100 });
    }

    selectRegion(region) {
        this.addressDetails.region().click().then(() => {
            cy.get('[role="listbox"]').should('exist');
            cy.get('li[role="option"]')
                .contains(region)
                .click({ force: true });

            cy.get('[role="listbox"]').should('not.exist');
        });
    }

    inputZipcode(zipcode) {
        this.addressDetails.zipcode().type(zipcode, { delay: 100 });
    }

    // --- Step 5: Payment Information ---
    selectPayment(payment_provider) {
        this.paymentInformation.show_more_payments().click();

        cy.get('.payment-option')
            .contains('.payment-provider', payment_provider)
            .should('be.visible')
            .click();
    }

    selectPredefinedAmount(selected_amount) {
        cy.frameLoaded(this.paymentInformation.cashier_iframe);
        cy.log(`Selecting predefined amount: ${selected_amount}`);
        cy.iframe(this.paymentInformation.cashier_iframe)
            .find('.predefinedvalue')
            .contains(selected_amount)
            .click();

        this.verifyTotalAmount(selected_amount);
    }

    inputCustomAmount(amount) {
        cy.log(`Typing custom amount: ${amount}`);

        cy.frameLoaded(this.paymentInformation.cashier_iframe);

        this.paymentInformation.getFormIframe().within(() => {
            cy.get('input#amount')
                .should('be.visible')
                .clear({ force: true })
                .type(amount, { delay: 50 });

            cy.get('input#amount').should('have.value', amount);
        });

        this.verifyTotalAmount(amount);
    }

    calculateDepositTotal(selected_amount) {
        const amount = parseFloat(selected_amount);
        const fee = amount * 0.10;

        return parseFloat((amount + fee).toFixed(2));
    }

    verifyTotalAmount(selected_amount) {
        const total = this.calculateDepositTotal(selected_amount);
        this.paymentInformation.getFormIframe().within(() => {
            cy.get('.total-container .value')
                .should('be.visible')
                .contains(total);
        });
    }

    clickDeposit() {
        this.paymentInformation.getFormIframe().within(() => {
            cy.get('button.submit-button')
                .click();
        });
    }

    verifyDepositEnabled() {
        this.paymentInformation.getFormIframe().within(() => {
            cy.get('button.submit-button')
                .should('be.visible')
                .should('not.be.disabled')
        });
    }

    verifySnackbarIsVisible(prev_action) {
        cy.window().then((win) => {
            win.focus();
        });

        if (prev_action == "deposit") {
            cy.contains('Your deposit is currently in Pending status.', { timeout: 15000 })
                .should('be.visible');
        }
        if (prev_action == "payment") {
            cy.contains('Your deposit has been settled successfully. Enjoy the games.', { timeout: 15000 })
                .should('be.visible');
        }
    }

    calculateAddFee(selected_amount) {
        const amount = parseFloat(selected_amount);

        if (amount >= 17) {
            return 0;
        }

        const addFees = {
            1: 1.57,
            2: 1.47,
            3: 1.37,
            4: 1.27,
            5: 1.17,
            6: 1.07,
            7: 0.97,
            8: 0.87,
            9: 0.77,
            10: 0.67,
            11: 0.57,
            12: 0.47,
            13: 0.37,
            14: 0.27,
            15: 0.17,
            16: 0.07,
        }
        return addFees[amount] || 0;
    }

    verifyTotalPaymentAmount(selected_amount) {
        const deposit_total = this.calculateDepositTotal(selected_amount);
        const add_fee = this.calculateAddFee(selected_amount);
        const total_payment = (deposit_total + add_fee).toFixed(2);

        cy.log(`Verifying Paysafe amount: ${total_payment}`);

        cy.get(this.paymentInformation.cashier_iframe, { timeout: 30000 })
            .its('0.contentDocument.body').should('not.be.empty')
            .then(cy.wrap)
            .find(this.paymentInformation.provider_iframe, { timeout: 30000 })
            .its('0.contentDocument.body').should('not.be.empty')
            .then(cy.wrap)
            .within(() => {
                cy.get('ps-balance .balance', { timeout: 20000 })
                    .should('be.visible')
                    .and('contain.text', total_payment);
            });
    }

    completePayment(email) {
        cy.get(this.paymentInformation.cashier_iframe)
            .its('0.contentDocument.body').should('not.be.empty')
            .then(cy.wrap)
            .find(this.paymentInformation.provider_iframe)
            .its('0.contentDocument.body').should('not.be.empty')
            .then(cy.wrap)
            .within(() => {
                cy.get('button[ps-primary-button]')
                    .should('not.be.disabled')
                    .click();
            });
    }

    // -- Next Buttons ---
    clickNext(step) {
        this.nextButtons[step]().click({ force: true });
    }

    verifyNextEnabled(step) {
        this.nextButtons[step]().should('not.be.disabled');
    }

    verifyNextDisabled(step) {
        this.nextButtons[step]().should('be.disabled');
    }

    getErrorMsg(message) {
        cy.contains(message).should('be.visible');
    }
}
export default new RegistrationPage();