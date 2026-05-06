# Web vs. Mobile Functionality Gaps

This document identifies missing features and incomplete implementations in the web version of the DotaApp compared to its mobile counterpart.

## 1. Navigation & Broken Links (High Priority)
All core navigation links are now functional:

- [x] **Search Page (`/search`)**:
  - Hero search results link to the Hero Detail page.
  - Match ID search results link to the Match Analysis page.
  - Player search results link to the Player Profile page.
- [x] **Friends Page (`/friends`)**:
  - Clicking on a friend/followed player navigates to their profile.
- [x] **Pro Scene (`/pro`)**:
  - Clicking on a Player navigates to their profile.
  - Clicking on a Team opens the **Team Detail Modal** with roster and recent matches.
  - Clicking on a Tournament opens the **League Detail Modal** with recent match results.

## 2. Missing Detail Screens & Modals (Medium Priority)
- [x] **Team Detail Modal**: Shows team roster and recent matches.
- [x] **League Detail Modal**: Shows tournament matches and status.
- [x] **Player Detail Modal (Search Context)**: Integrated into Search results for quick-view before full profile navigation.

## 3. Incomplete Features (Medium Priority)
- [ ] **Comparison Tool (`/compare`)**:
  - The "Select Player" functionality is currently a visual placeholder. There is no flow to choose a player from friends or global search to fill the comparison slots.
- [ ] **Notifications System**:
  - Missing the notification bell in the global layout.
  - No notifications list page (`/notifications`) to view friend requests or activity updates.
  - Missing real-time notification state management in the web context.

## 4. Visual & UX Parity (Low Priority)
- [ ] **Global Records**: The home page "All-Time Records" cards should be clickable and lead to the respective match details.
- [ ] **Live Games**: Ensure live game cards correctly navigate to a "Live Spectate" view or match analysis if available.
- [ ] **Word Cloud**: While the component exists, ensure it is fully integrated and handles "private profile" states gracefully.

## 5. Settings Parity
- [ ] **Push Notifications**: Web settings indicates "Coming soon to web". Service workers and web push notifications need implementation.
- [ ] **Data Management**: Mobile has more granular controls for cache and data clearing.

---
*Generated on: 2026-05-06*
