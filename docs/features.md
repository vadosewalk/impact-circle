# Impact Circle: Feature Documentation

## 1. Universal User Profile
The platform rejects rigid role assignments. A single user account acts as a "Universal Profile" that can:
- **Request Aid:** Post community needs to the Marketplace.
- **Donate:** Make financial pledges to active NGO drives or community tenders.
- **Volunteer:** Offer physical labor or time to NGO initiatives.
- **Verification:** Their profile serves as a ledger of their contributions and trustworthiness.

## 2. "Fort Knox" NGO Onboarding
To ensure only legitimate organizations operate on the platform, we implement a strict, manual verification pipeline:
1.  **Document Drop:** The NGO submits registration paperwork and defines their operational radius.
2.  **Waiting Room:** The NGO status is set to `pending`. They see a live dashboard of their audit status.
3.  **Live Audit Meet:** Admins schedule a manual Google Meet session. The link and time are pushed to the NGO's dashboard.
4.  **Green Flag Verification:** Upon successful manual audit, the Admin verifies the NGO, granting them access to the Drive Dashboard and a `+50` trust score boost.

## 3. The Matching Engine
Supply and demand are matched through a dual-marketplace system:
- **Community Needs Board (Tenders):** Individuals post specific needs.
- **Resource Board (Drives):** NGOs post initiatives they are raising support for.
- **Geofencing:** Tenders are filtered based on the user's location, ensuring help is localized and actionable.
- **SOS Bypass:** Urgent "Red Tag" tenders bypass geographic filters to reach a Pan-India audience for immediate emergencies.

## 4. Handshake Protocol
Direct communication is designed to facilitate coordination without the liability of a full chat platform:
- **Direct Handshake:** Heavily character-limited DMs (500 chars) purely for exchanging phone numbers or WhatsApp contact info.
- **Handshake Claiming:** NGOs or volunteers officially "Claim" a tender to signal responsibility to the community.

## 5. Trust Scoring System
A gamified accountability system that rewards good faith actions:
- **+50:** Passing the NGO live audit.
- **+20:** Completing a resource drive.
- **+10:** Fulfilling a claimed tender.
- **+5:** Posting Impact Wall updates (NGO) or Gratitude updates (Beneficiary).
- **+2:** Making a partial pledge.
- **-30:** Receiving a community flag.
- **Strike System:** 3 flags result in automatic NGO suspension.

## 6. Impact Wall & Accountability
- **Drive Updates:** NGOs must post evidence (text/photos) during a drive to earn trust points.
- **Closing the Loop:** Once fulfilled, beneficiaries are prompted to post gratitude updates, providing social proof that aid reached the target.
- **Democratic Taxonomy:** NGOs can request custom tags. These are triaged by admins and voted on by the community in Governance Polls before becoming global.
