import * as React from "react";
import { markdown } from "catalog";
import { Histogram } from "./Histogram-sonified";

export default () => markdown`

# Histogram - Sonification

${<Histogram />}`;
