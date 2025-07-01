# ADR 003: Hardware Usage

## Status

Accepted

## Context

We need to determine what device hardware features will be used by the Jammr app to deliver a smooth audio playback experience.

## Decision

We will use the following hardware features:

- Device Speakers and Audio Output: To play music through the device’s built-in speakers or connected audio devices (headphones, Bluetooth speakers).

- Volume Buttons (Physical): Handled natively by Android to adjust media volume during playback. No additional implementation required.

- Media Controls Integration: Utilize hardware media buttons on headphones or Bluetooth devices (e.g. play, pause, skip) for playback control when the app is running in the background.

## Rationale

- Audio output is fundamental to a music player app’s core functionality.

- Volume buttons provide a seamless and intuitive user experience without additional development effort.

- Supporting media hardware buttons enhances usability, allowing playback control when the device is locked or the app is backgrounded.

- React Native libraries such as react-native-track-player facilitate integration with audio hardware and media controls efficiently.

- No other device sensors (e.g. GPS, camera, fingerprint scanner) are necessary for Jammr’s current scope.

- Microphone access can be considered for future features such as voice commands or AI utilization.

## Consequences

- Requires handling permissions for media controls integration depending on Android API level.

- Implementation complexity increases slightly to support background playback and hardware button events.

- Keeping hardware usage minimal ensures better app performance and simpler maintenance within the project timeline.
