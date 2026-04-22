# Impact Circle: Future Roadmap & Improvements

This document outlines planned improvements and remaining tasks to take Impact Circle from prototype to production-ready.

## 1. High-Priority Technical Debt
- **PostGIS Integration:** Migrating from manual Haversine math to PostGIS for database-level spatial queries. This will allow for complex geofencing (e.g., "Find all needs within this polygon") and significantly improved performance as the database grows.
- **Persistent Image Storage:** Currently, image data is mocked or stored as JSON strings. We need to integrate **AWS S3** or **Cloudflare R2** with signed URLs for secure uploads of NGO documents, drive receipts, and user profile pictures.
- **Automated Communication:** Integration of **Resend** or **Twilio SendGrid** to automate onboarding notifications, audit reminders, and verification success emails.

## 2. Advanced Features
- **OCR Receipt Scanning:** Implement an Optical Character Recognition (OCR) pipeline. When an NGO uploads a photo of a vendor receipt for a drive, the system should automatically extract the amount, date, and vendor name to update the Transparency Ledger without manual entry.
- **In-App Payment Gateway:** Integrate **Stripe** or **Razorpay** to allow donors to pledge funds directly within the platform. Implement an escrow system where funds are only released to the NGO once they post sufficient Impact Wall proof.
- **SOS Push Notifications:** Utilize Web Push or Firebase to send immediate emergency alerts to users within a specific geofence when a "Red Tag" (Urgent) tender is posted.

## 3. UI/UX Refinements
- **Trust Ledger View:** Add a detailed audit trail on user and NGO profiles showing every trust point transaction (e.g., "+10 for Fulfilled Tender #88").
- **Leaderboards:** Create a "Community Pillars" leaderboard surfacing the top 10 NGOs and Universal Users based on their transparency and impact scores.
- **Interactive Map View:** Add a map interface to the Marketplace feed, allowing users to visually see needs and drives in their immediate physical vicinity.

## 4. Platform Expansion
- **AI Matching Engine:** Use Large Language Models (LLMs) and Vector Embeddings (pgvector) to automatically recommend open tenders to NGOs based on their mission statements and past drive history.
- **Native Mobile Experience:** Use **Capacitor** or **React Native** to bring the platform to iOS and Android, taking advantage of background location tracking for real-time proximity alerts.
- **Community Governance v2:** Expand the polling system to allow users to propose platform improvements, truly handing the platform's evolution to its most active community members.
