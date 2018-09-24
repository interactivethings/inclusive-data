import { markdown } from "catalog";
import { Histogram } from "./components/Histogram-sonified";
import HistogramAriaDocs from "./components/Histogram-aria.docs";

export default () => markdown`
# Inclusivity Lab

This Catalog is a repository for experimental data representation using not only visual features but also sound, for a multi sensorial immersion into data.

### Inclusivity

The starting point is too make data visualizations accessible to users of assistive technologies such as screen readers. An emphasis is therefore put on keyboard navigation and compatibility with [WAI ARIA](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA).
`;
