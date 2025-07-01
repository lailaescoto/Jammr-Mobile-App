# ADR 004: Database Storage

## Status

Accepted

## Context

Our app requires decisions on how and where to store data. As a music player app, Jammr will handle:

- Playback state and metadata (e.g. current track info, playback position)

- User-created playlists (if implementing create/edit/delete functionality)

- App settings (e.g. shuffle, repeat preferences)

We need to determine if we will use local storage, remote storage, or no storage based on our project scope and requirements.

## Decision

We will use local storage (unencrypted) for storing user data such as playlists and app settings.

## Rationale

- Jammr does not require user accounts or cloud syncing within its current scope.

- Local storage ensures data persistence across app sessions without needing a backend infrastructure.

- Implementation is simple using React Native libraries such as AsyncStorage or database options like react-native-sqlite-storage if structured storage is needed.

- Unencrypted storage is acceptable since the data is not sensitive (e.g. no personal user information or authentication tokens).

- Using local storage reduces project complexity and keeps the app lightweight and offline-capable.

## Consequences

- User data will be tied to the device; no syncing between devices.

- Users will lose data if the app is uninstalled unless external backup is implemented in future updates.

- Must handle local data management carefully to avoid corruption or loss of user-created playlists.

- Future implementation of cloud storage or user accounts would require architectural changes to integrate remote storage solutions and authentication flows.
