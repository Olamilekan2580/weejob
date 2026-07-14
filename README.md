# WEEJOB

WEEJOB is a cross-platform Expo React Native app for an Ireland-focused local services marketplace. Customers post jobs, verified providers send offers, customers accept or decline offers, and both sides coordinate through job-linked messaging.

## Current App

- Ireland-localised marketplace with Dublin, Cork and Galway sample data.
- Euro pricing using Irish locale currency formatting.
- Customer and provider mode switching.
- Job posting with required-field validation.
- Provider offer composer on open jobs.
- Offer inbox with accept and decline actions.
- Automatic booking status updates when an offer is accepted.
- Job-linked messaging threads for every offer.
- Booked-job completion flow and activity feed.
- Profile controls for account mode, service radius and instant booking eligibility.
- Lemon-green primary brand color: `#B7F000`.
- Lemon-green primary brand color: `#B7F000`.

## Run Locally

```bash
npm install
npm start
```

Then open the app with Expo Go on Android/iOS, or use the Expo terminal options for simulator builds.

## Validate

```bash
npm run check
```

This exports Android and web bundles locally. Use `npm run export:android` or `npm run export:web` to check one target.

## Next Build Steps

- Connect jobs, offers, chat, notifications and profiles to a production backend.
- Add authentication, identity verification and provider onboarding.
- Add device location permissions, map/radius filtering, image uploads, reviews and escrow/payment integration.
- Add push notifications and persistent local storage for offline continuity.
