# ADR 002: Navigation Strategy

## Status

Accepted

## Context

Our app will require users to move between different screens such as: Home, Now Playing, Playlists, and Settings. We need a navigation solution that integrates well with React Native.

## Decision

We will use React Navigation, implementing a combination of:

- Bottom Tab Navigator for main sections (Home, Search, Library/Playlists, Settings),

- Stack Navigators within each tab for sub-navigation, and

- A persistent mini-player component rendered above the navigation structure to provide continuous playback controls.

## Rationale

- React Navigation is widely used in React Native apps for its simplicity, flexibility, and strong community support.

- Supports both stack and tab navigation, enabling seamless switching between main screens and sub-screens.

- The Bottom Tab Navigator provides quick access to key app sections, enhancing usability.

- Stack Navigators within tabs maintain navigation history, supporting deeper flows without losing context.

- Mimics the intuitive navigation design of Spotify, creating familiarity for users.

- Aligns well with our team’s technical skillset and project timeline.timeline.

## Consequences

- Requires installation of dependencies and linking native modules.

- Navigation structure must be organized effectively to avoid overly complex nested navigators.

- Implementing a persistent mini-player demands global playback state management to ensure consistent rendering across tabs.

- Adds additional setup complexity to integrate the mini-player seamlessly with the Now Playing screen.

- Ultimately enhances user experience by adopting a proven, effective navigation paradigm for music apps.
