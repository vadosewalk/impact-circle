### **1. The Core Mission (The "North Star")**

To create a highly transparent, accountable marketplace where verified NGOs, donors, volunteers, and beneficiaries can seamlessly exchange resources, time, and aid through a "tender-like" matching system.

### **2. User Personas & Permissions Architecture**

You have a two-sided marketplace with four distinct actors. Defining their exact capabilities is crucial for your app's logic.

**Account Type 1: The Verified NGO**

- **The Goal:** Aggregate resources (money and manpower) and provide aid, while maintaining 100% transparency.
- **Onboarding:** Strict KYC. Must provide registration certificates, tax exemption docs (if applicable), and organizational details.
- **Capabilities:**
  - Create "Drives" (e.g., _Winter Clothes Distribution_).
  - Set targets within Drives: "We need ₹50,000" OR "We need 10 Volunteers."
  - **The Accountability Loop:** Must upload geo-tagged photos, receipts, or summaries after a drive is completed.
  - Must have an inbox specifically for responding to user "Proof Requests."

**Account Type 2: The Standard User (3 Sub-Roles)**
Users can fluidly switch between these roles depending on their current situation.

- **Role A: The Volunteer (Time Contributor)**
  - **Goal:** Offer physical presence or skills.
  - **Capabilities:** Browse NGO drives filtered by "Needs Volunteers," apply to join, and track hours contributed.
- **Role B: The Donor (Financial Contributor)**
  - **Goal:** Provide financial aid without physical involvement.
  - **Capabilities:** Browse drives filtered by "Needs Funds," donate, and crucially, utilize the **"Request Proof"** feature to see exactly where their specific funds went.
- **Role C: The Beneficiary (The Receiver)**
  - **Goal:** Seek help for themselves or their community.
  - **Capabilities:** Create "Tender" posts outlining a specific need (e.g., "Need medical supplies for a local clinic"). Can browse NGO profiles and comment on their public feeds to ask if their specific services cover the beneficiary's needs.

### **3. The "Tender" Framework (The Matching Engine)**

You mentioned the framework should be like a "tender." This is brilliant because it treats social impact like an open marketplace. Here is how that logic flows:

- **The Needs Board (Reverse Tender):** Beneficiaries post detailed requests (the Tender). NGOs browse this board. If an NGO has the resources, they "Bid" or "Claim" the tender to fulfill it.
- **The Resource Board (Standard Tender):** NGOs post upcoming drives detailing exactly what they need (X amount of money, Y number of volunteers). Donors and Volunteers browse and "Fulfill" these micro-tenders.

### **4. The Accountability & Proof System (Your USP)**

To make the "compulsory proof" feature work without causing massive friction, it needs a standardized workflow:

- **Milestone Locking:** If an NGO raises funds for a specific drive, they cannot launch a _new_ funding drive until the "Proof of Impact" (photos, expenditure breakdown) for the previous drive is uploaded and verified by the system or community.
- **The "Audit" Button:** Every completed NGO drive should have a public "Request Audit/Proof" button. If a user clicks this, the NGO is notified and has a set SLA (e.g., 48 hours) to provide the specific documentation requested.
- **Trust Scoring:** NGOs that proactively post proofs and respond quickly to user requests gain a higher "Transparency Score," making their future tenders more visible.

### **5. Your Pre-Technical Action Plan**

Before moving this into your design-to-code pipelines, you need to lock in these three product decisions:

1.  **Define the Categories:** In your notes, you listed Finance, Food, Clothes, Water, Space/Shelter, and Volunteers. Lock down exactly what these categories are, as they will drive your entire tagging and search database.
2.  **Map the User Journey:** Sketch out the exact step-by-step path a Beneficiary takes from opening the app to getting help, and the path an NGO takes from registering to receiving a donation.
3.  **Establish Verification Rules:** Decide who verifies the NGO's initial documents. Will you manually approve them in an admin dashboard, or will you use a third-party API for NGO verification?
