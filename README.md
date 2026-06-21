# VisionMeter

A self-administered, screen-based eye screening console: visual acuity, color
vision, astigmatism, contrast sensitivity, and visual field — with a real
calibration step so the acuity result is based on actual visual angle rather
than an arbitrary pixel size.

**This is a screening aid, not a diagnostic tool.** It does not replace an
eye exam by a licensed professional. A disclaimer banner is shown on every
screen for this reason.

## Project structure

```
index.html               markup + screen containers only, no logic
css/
  styles.css              "instrument panel" theme (dark, phosphor-cyan, amber alerts)
js/
  state.js                single shared state object (current user, calibration, results)
  navigation.js           screen show/hide, the only module that touches display:none
  auth.js                 local "remember me" identification (see below) + per-user history
  calibration.js          card-width + viewing-distance calibration, optional webcam estimate
  acuityTest.js           letter test, sizes letters from real visual angle
  colorTest.js            color discrimination bubbles, clamped difficulty
  specialtyTests.js       astigmatism / contrast self-report + timed visual field test
  eyeTips.js              static diet + daily-habit eye care guides
  speech.js               Web Speech API voice input, with graceful fallback
  history.js              IndexedDB-backed session history, scoped per signed-in user
  report.js               unified multi-test PDF export
  main.js                 app bootstrap, fact ticker, mobile sidebar drawer
assets/
  visionmeterlogo.png, astigmatism.png, contrast.png, visualfield.png
```

Each test lives in its own file so a module can be rewritten or replaced
without touching the others.

## What changed from the original version, and why

1. **Calibration (new).** Letter size in CSS pixels is meaningless without
   knowing physical pixel density and viewing distance. The calibration
   screen has the user match an on-screen bar to a credit card's known
   width (85.6mm) and enter a viewing distance, then computes letter
   heights from the standard optometric convention that a 6/6 letter
   subtends 5 arcminutes at the test distance. An experimental webcam-based
   distance estimate is offered where the browser exposes `FaceDetector`.
2. **Disclaimer banner.** Always visible — screening aid, not a diagnosis.
3. **Color test difficulty bug fixed.** The original RGB difference could
   reach zero or negative at high rounds; it's now clamped to a minimum
   visible delta.
4. **Visual field test now measures something.** Originally it always
   reported "Completed" with no signal. It now times each dot (2.5s
   timeout), tracks misses and reaction time, and classifies the response.
5. **Voice input fails loudly, not silently.** If `SpeechRecognition` isn't
   supported, the mic button disables itself and explains why, instead of
   sitting there doing nothing. Low-confidence voice matches are flagged
   for the user to confirm or retype.
6. **Unified PDF report.** The export now includes acuity, color,
   astigmatism, contrast, and visual field results in one document.
7. **Session history (new).** Results are saved to IndexedDB so a user can
   see how their results trend over multiple visits, not just the last run.

## Round 2 — fixes and additions

8. **Color test result layout fixed.** The bubble grid left an inline
   `grid-template-columns: repeat(N,55px)` on its container; the result
   text was then squeezed into that one narrow column, wrapping into the
   tall, messy single line seen in testing. The container is now reset to
   `display:block` before the result card renders, and that result is a
   proper card (`.color-result-card`) instead of bare `<p class="handwriting">`
   tags.
9. **10+ rotating eye-health facts**, up from 4.
10. **Eye Health Tips section (new).** A sidebar entry opens a menu with
    two static guides: an eye-healthy food routine, and daily habits/screen
    care tips (20-20-20 rule, blinking, lighting, breaks, etc.). Purely
    informational — no results are recorded from these screens.
11. **Mobile layout reworked.** The previous version simply hid the sidebar
    and fact ticker below 800px width, which also hid navigation. Mobile now
    gets a hamburger button that opens the sidebar as a slide-in drawer
    (with a backdrop), so every section — including the new Tips, History,
    and Account screens — stays reachable on a phone. Inputs, sliders, and
    the visual field area are also resized to fit small viewports without
    horizontal overflow.
12. **Local "remember me" identification (new), not real authentication.**
    A login screen lets someone enter a name + email. That's stored in
    IndexedDB on this device only, and a small marker in `localStorage`
    means returning to the app on the same browser auto-recognizes them and
    loads their own saved history. A "Continue as Guest" option skips this
    entirely.

    **This is not secure login.** There is no backend here — no password is
    checked against anything, nothing is encrypted in transit because
    nothing leaves the browser, and anyone using the same browser profile
    could type the same email and see that history. It's convenience for
    one person reusing one device, not account security. A real login
    system needs a server that hashes and verifies passwords and issues
    session tokens — that's a different project from a static front-end.
13. **History is now scoped per signed-in profile** (or to "guest" if no one
    is signed in), so two people sharing a browser don't see each other's
    results mixed together.

## Known limitations (be upfront about these with anyone using it)

- "Sign in" is local-device recognition only — see point 12 above. Don't
  rely on it to keep different people's data separate on a shared device
  beyond casual convenience.
- Calibration accuracy depends on the user measuring the card and distance
  carefully — it is self-reported, not sensor-verified.
- Astigmatism and contrast tests are still subjective self-report on a
  static image; screen brightness/gamma is not measured, only flagged.
- The webcam distance estimate is a rough pinhole-camera approximation, not
  a calibrated depth measurement.
- None of this substitutes for a comprehensive eye exam with a clinician.

## Possible next steps

- Replace local "remember me" identification with real authentication
  (e.g. a small backend + hashed passwords, or a hosted auth provider) if
  this ever needs to protect genuinely private data or work across devices.
- Replace the FaceDetector-based webcam estimate with a proper face-mesh
  model (e.g. MediaPipe via TensorFlow.js) for a real-distance estimate on
  more browsers.
- Move from plain JS modules to a small framework (React/Svelte) once more
  test types are added — `navigation.js`'s show/hide pattern will get
  unwieldy past a dozen screens.
- Add a contrast/brightness calibration step (e.g. a step-wedge pattern the
  user adjusts) before the contrast sensitivity test.
