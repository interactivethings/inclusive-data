import { markdown } from "catalog";
import { Histogram } from "./components/Histogram-sonified";
import HistogramAriaDocs from "./components/Histogram-aria.docs";

export default () => markdown`
# Inclusivity Lab

This Catalog is a repository for experimental data representation using not only visual features but also sound, for a multi sensorial immersion into data.

### Inclusivity

The starting point is too make data visualizations accessible to users of assistive technologies such as screen readers. An emphasis is therefore put on keyboard navigation and compatibility with [WAI ARIA](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA).

### Testing

These components have been tested using MacOS built-in screen reader, VoiceOver. Press \`cmd+F5\` one time to activate VoiceOver, two times to deactivate it.

VoiceOver has a specific key combination, \`control+option\`, usually abbreviated with \`VO\`, to prevent confusion between VoiceOver commands and other regular keyboard presses. Note that other screen readers such as JAWS don't behave the same way as they often differentiate between the "browsing" mode (where plain arrow keys can be used to navigate content), "form" and "application" modes where keyboard interaction must be spefically implemented.

Here are some useful VoiceOver commands:

- \`VO+U\` to open the “Rotor”
- \`VO-Shift-I\` to hear a summary of the web page.
- Users can navigate by DOM (in the order of the DOM) or by grouped items (move in any direction)
- \`VO-Command-G\` or \`VO-Command-Shift-G\` to move from image to image.
- \`VO-Command-F\` or \`VO-Command-Shift-F\` to move from “frame” to “frame”.
- \`ctrl+option+space\` to click something like a button.
`;
