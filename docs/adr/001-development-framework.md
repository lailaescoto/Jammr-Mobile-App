# ADR 001: Development Framework

## Status

Accepted

## Context

We need to choose a mobile app development framework that supports building a modern music player for Android. It must enable quick development, access to native device features (like audio), and fit our team's existing skillset.

## Decision

We will use React Native as our development framework.

## Rationale

- All team members are familiar with JavaScript and React.
- React Native supports fast development with features like live reloading
- It offers strong Android compatibility and easy integration with native features such as media playback and device speakers.
- There’s a large developer community and strong documentation.

## Consequences

- Development will be more efficient due to team familiarity.
- We may need to handle some native module integrations manually (e.g., custom audio controls).
- Performance is suitable for our project scope (basic music playback, responsive UI).
