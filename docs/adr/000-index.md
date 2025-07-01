# Jammr Mobile App – Architecture Decision Records (ADR)

This directory contains the architecture decisions made for the **Jammr** mobile music player app.

## Summary

- Target platform: Android
- CSS framework: Bootstrap
- Development framework: React Native
- Navigation: React Navigation
- Hardware: Device speakers/audio output, volume buttons (handled by system), media controls integration
- Storage: Local storage (unencrypted) using React Native storage libraries for playlists and settings

## Architecture Decisions

| ID  | Title                 | Link                                                         |
| --- | --------------------- | ------------------------------------------------------------ |
| 001 | Development Framework | [001-development-framework.md](001-development-framework.md) |
| 002 | Navigation Strategy   | [002-navigation-strategy.md](002-navigation-strategy.md)     |
| 003 | Hardware Usage        | [003-hardware-usage.md](003-hardware-usage.md)               |
| 004 | Database Storage      | [004-database-storage.md](004-database-storage.md)           |
