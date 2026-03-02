# Spinbet Automation Framework (QA Coding Challenge)

## 1. Description of the Problem & Solution

### The Problem
In a high-traffic iGaming environment like Spinbet, the user onboarding (Registration) and game discovery (Casino Lobby) flows are the primary revenue drivers. Manual testing of these flows across multiple viewports and edge cases is:
* **Time-consuming:** Registration involves multi-step forms and server-side validation.
* **Error-prone:** Game search results are dynamic and involve third-party iFrame integrations.
* **Risky:** Failures in the registration or search paths lead to immediate user churn.

### The Solution
This project implements a **Page Object Model (POM)** based automation framework using **Cypress**. It provides a scalable, non-flaky testing suite that validates the critical paths of the application. 

The solution moves beyond simple UI clicking by:
* **Intercepting API calls** to verify server-side validation.
* **Handling responsive design** via multi-viewport testing logic (following mobile-first approach).
* **Verifying third-party content** by validating the state of the game engine iFrames.

---

## 2. Reasoning Behind Technical Choices

### Framework: Cypress
I chose Cypress for its native access to the browser's execution loop. In a casino environment where UI state changes rapidly (asynchronous search results and modal overlays), Cypress’s **automatic waiting** and **real-time debugging** significantly reduce "flakiness".

### Design Pattern: Page Object Model (POM)
The project is structured into dedicated `Page` classes (e.g., `RegistrationPage.js`). 
* **Reasoning:** By abstracting selectors and actions, we ensure that if a developer changes a "Sign Up" button's ID, we only update one file rather than dozens of tests. This ensures the suite remains **low-maintenance** in a fast-moving production environment.

### Layered Testing Strategy (Lean E2E)
I have intentionally separated tests into **Smoke** (Critical Path) and **Validation** (Edge Cases).
* **Reasoning:** A common mistake in E2E testing is "over-automation"—testing every regex variation at the browser level. I have documented granular field validations as manual/unit tests while automating the critical business logic. This follows the **Testing Pyramid** principle, ensuring the E2E suite remains fast and reliable for CI/CD pipelines.
* **End-to-End (E2E):** I focused the main Cypress suites on critical user journeys (Success flows, Compliance/T&Cs, Search).
* **Validation Logic:** I created a separate test file for edge-case validation (e.g., username character limits, invalid email formats). In a production environment, these would ideally be **Unit Tests** or **Component Tests**, as they run significantly faster than full E2E journeys.

### API Interception & Mocking
I utilized `cy.intercept()` across both the Registration and Casino Lobby suites:
* **Validation Testing:** Handled "Taken Email" and "Duplicate Username" scenarios by injecting `422 Unprocessable Entity` responses. This allows for deterministic UI testing without the overhead of complex database resets or state cleanup.
* **Search Synchronization:** For the Casino Lobby, I intercepted the `game-assets` API calls to synchronize the test runner with the application's background data fetching.
* **Reasoning:** Using intercepts to "wait" for specific API responses—rather than using arbitrary `cy.wait(number)`—eliminates flakiness caused by network latency and ensures that the test only proceeds when the results are actually rendered in the DOM.

### Extensibility & Clean Code
To ensure the suite remains maintainable, I implemented **Custom Cypress Commands** (located in `support/commands.js`).
* `setupRegistrationIntercepts`: This command centralizes all API orchestration for the registration flow.
  * **Environment Stability:** It includes logic to "kill" third-party cookie stubs (OneTrust/SDKStubs) that often cause non-deterministic UI overlays or performance lags during testing.
  * **Higher-Order** Interception: It uses a wrapper function (interceptAndVerify) to handle method, URL, and alias registration in a single line. This reduces boilerplate code and ensures that every key network request is automatically verified for a 200 OK status (or a custom expected status) before the test proceeds.
  * **Reasoning:** Centralizing network logic into custom commands means that if the API base URL or endpoint structure changes, I only need to update the logic in one location, rather than across multiple test files.

---

## 3. QA Observations & Recommendations

### Technical & Logic Observationshts
* **Inconsistent Session Persistence:** I observed that if a user abandons the flow at Step 3 and reloads the page after a timeout, they are treated as a fully authenticated user.
  * **Risk:** This creates "partial profiles" in the database and bypasses final validation steps. Authentication should only be finalized upon the successful completion of the entire registration handshake.
* **Geographic Data Mismatch (Localization):** While the /en-nz/ path allows users to select a Canadian (+1) prefix, the Address step only loads New Zealand regions.
  * **Recommendation:** Implement dynamic dependency injection for address fields based on the selected country code to prevent users from being "stuck" at the final step.
* **Delayed Backend Validation:** Errors for "Taken" or "Invalid" phone numbers only trigger when clicking **Next** at the 2nd step.
  * **Recommendation:** Move this to an asynchronous "on-blur" check in Step 1 to prevent users from completing the entire form only to be rejected at the end.

### UX & UI Suggestions
* **Conflicting Input Requirements:** The username placeholder (John Doe) suggests spaces are allowed, but the validation regex strictly forbids them. Furthermore, the system displays two different error messages for the same field ("The username must only contain letters and numbers" vs. a more detailed regex list).
  * **Solution:** Update placeholders to reflect valid formats (e.g., John_Doe) and consolidate validation messages into a single, clear requirement list.
* **Passive vs. Active Validation:** Currently, empty field errors only trigger on "Next" click.
  * **Solution:** Implement Real-time Form State Management. The "Next" button should remain disabled until the minimum requirements for that specific step are met. This reduces "error fatigue" for the user.


---

## 4. Setup & Execution
### Pre-requisites: Geo-Location Requirement
The Spinbet platform restricts access based on IP address. For this specific challenge, we're focusing on /en-nz/. **You must be using a New Zealand IP address** (e.g., via VPN) to execute these tests successfully. Failure to do so will result in connection timeouts or restricted access errors.
1. **Install Dependencies:** `npm install`
2. **Launch Cypress (GUI):** `npx cypress open`
3. **Run Headless Suite:** `npx cypress run`
4. **Custom Test Scripts (Headless)** You can also run specific tagged test directly via these pre-defined scripts:
```
"scripts": {
    "test:all": "npx cypress run",
    "test:registration": "npx cypress run --browser chrome --spec 'cypress/e2e/registration.cy.js'",
    "test:search": "npx cypress run --browser chrome --spec 'cypress/e2e/search.cy.js'"
  }
```
### Example: 
Run all test in headless mode:
```
npm run test:all
```
Or run only a specific test suite:
```
npm run test:registration
```
