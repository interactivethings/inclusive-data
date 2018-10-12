import * as React from 'react';
import { markdown } from 'catalog';
import { Histogram } from './Histogram-sonified';

export default () => markdown`

# Histogram - Sonification
> Tab to the data visualization, and use arrow keys to navigate between data points. Sound on!

${<Histogram />}`;
