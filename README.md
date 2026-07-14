# WEEJOB

WEEJOB is a cross-platform Expo React Native app for local, in-person jobs such as home cleaning, repairs, plumbing, moving, painting, and errands.

## Current MVP

- Home marketplace with local categories, nearby job cards, and top providers.
- Search and category filtering for nearby jobs.
- Job/service publishing flow with required-field validation and session draft support.
- Messaging screen with selectable conversations and local reply updates.
- Notifications screen for bids, arrival updates, safety, payment reminders, and local preference toggles.
- Profile screen with account setup, customer/provider mode, wallet, and adjustable service radius states.
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

- Add authentication and user roles for customer/provider accounts.
- Connect job posting, bids, chat, notifications, and profiles to a backend.
- Add device location permissions, map/radius filtering, image uploads, reviews, and payment escrow.
- Replace session-only state in `App.js` with API-backed data models and persistent local storage.
