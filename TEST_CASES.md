# Test Case Documentation - Spinbet Assessment

This document outlines the test strategy for the Spinbet Registration and Casino Lobby. 

## 1. User Registration Suite
**Strategy:** E2E automation covers the "Happy Path" and critical API error handling. Granular field validation (regex, length) is documented as manual/unit test cases to optimize CI/CD performance.

| ID | Scenario | Priority | Status | Logic |
|:---|:---|:---|:---|:---|
| REG-01 | Successful registration (Happy Path) | High | **Automated** | Validates full flow from Step 1 to Home page. |
| REG-02 | Handle Taken Credentials | High | **Automated** | Ensures UI correctly displays server-side validation errors. |
| REG-03 | Terms & Conditions Compliance | High | **Automated** | "Next" button must remain disabled until T&Cs are accepted. |
| REG-04 | Username Length Validation | Medium | Manual | Verify regex, <6 and >15 character limits trigger UI warnings. |
| REG-05 | Email Format Validation | Medium | Manual | Verify missing '@' or domain triggers UI error. |
| REG-06 | Password Strength Check | Low | Manual | Verify minimum 6-character requirement. |
| REG-07 | Localization: Name Special Characters | Low | Manual | Support for names with accents, hyphens, or apostrophes. |
| REG-08 | Successful Deposit | Critical | Manual | Involves sensitive data. Best suited for manual "Penny Testing" or staging with dummy gateways. |

## 2. Casino Lobby & Search Suite
**Strategy:** Validate the "Money Path"—finding and launching a game.

| ID | Scenario | Priority | Status | Logic |
|:---|:---|:---|:---|:---|
| SEARCH_TC_01 | Exact Match & Game Launch | High | **Automated** | Search 'Sweet Bonanza', open game, verify iframe loads successfully. |
| SEARCH_TC_02 | Guest Access Restrictions | High | **Automated** | Attempt to launch a game as a logged-out user and verify that a "Login/Register" prompt is triggered. |
| SEARCH_TC_03 | Partial Match (Predictive Search) | Medium | **Automated** | Type a partial string and verify that the results grid updates to include multiple relevant titles. |
| SEARCH_TC_04 | Invalid search shows no results | Medium | **Automated** | Input a non-existent game name and verify the UI displays a clear "No results found" message. |

---
*Note: Automated tests were developed using Cypress following the Page Object Model (POM) pattern.*