import { max, extent, histogram } from "d3-array";
import {
  scaleBand,
  scaleLinear,
  scaleOrdinal,
  scaleSqrt,
  scaleLog
} from "d3-scale";
import { select } from "d3-selection";

import * as React from "react";
import planets from "../data/tidy/planets.json";
import { schemePastel1, schemeDark2 } from "d3-scale-chromatic";
import { axisLeft, axisBottom } from "d3-axis";
import "./Scatterplot.css";

const W = 1200;
const H = 600;
const MARGIN = { TOP: 50, RIGHT: 50, BOTTOM: 50, LEFT: 50 };
const CHART_WIDTH = W - MARGIN.LEFT - MARGIN.RIGHT;
const CHART_HEIGHT = H - MARGIN.TOP - MARGIN.BOTTOM;
const NB_BINS = 100;

export class Histogram extends React.Component {
  constructor() {
    super();
    this.axisX = React.createRef();
    this.axisY = React.createRef();
  }
  getLinearScale = (domain, range) => {
    const ls = scaleLinear()
      .domain(domain)
      .range(range)
      .nice();
    return ls;
  };
  getBins = (data, scale, nbBins, value) => {
    return histogram()
      .domain(scale.domain())
      .thresholds(scale.ticks(nbBins))
      .value(d => d[value])(data);
  };
  createAxisX = scale => {
    const g = select(this.axisX.current);
    g.call(axisBottom(scale));
  };
  createAxisY = scale => {
    const g = select(this.axisY.current);
    g.call(axisLeft(scale));
  };
  componentDidMount() {
    const filteredPlanets = planets.filter(d => d.st_dist < 2000);
    const distanceScale = this.getLinearScale(
      [0, max(filteredPlanets, d => d.st_dist)],
      [0, CHART_WIDTH]
    );

    const bins = this.getBins(
      filteredPlanets,
      distanceScale,
      NB_BINS,
      "st_dist"
    );
    const countScale = this.getLinearScale(
      [0, max(bins, d => d.length)],
      [CHART_HEIGHT, 0]
    );

    this.createAxisX(distanceScale);
    this.createAxisY(countScale);
  }

  render() {
    const filteredPlanets = planets.filter(d => d.st_dist < 2000);
    const distanceScale = this.getLinearScale(
      [0, max(filteredPlanets, d => d.st_dist)],
      [0, CHART_WIDTH]
    );
    const bins = this.getBins(
      filteredPlanets,
      distanceScale,
      NB_BINS,
      "st_dist"
    );

    const countScale = this.getLinearScale(
      [0, max(bins, d => d.length)],
      [CHART_HEIGHT, 0]
    );

    return (
      <svg width={W} height={H}>
        <g
          transform={`translate(${MARGIN.LEFT}, ${CHART_HEIGHT + MARGIN.TOP})`}
          ref={this.axisX}
        />
        <g
          transform={`translate(${MARGIN.LEFT}, ${MARGIN.TOP})`}
          ref={this.axisY}
        />

        <g transform={`translate(${MARGIN.LEFT}, ${MARGIN.TOP})`}>
          {bins.map((bin, i) => {
            return (
              <rect
                key={i}
                data-n={`bin-${bin.x0}:${bin.x1}`}
                x={distanceScale(bin.x0)}
                y={countScale(bin.length - 1)}
                width={CHART_WIDTH / NB_BINS}
                height={CHART_HEIGHT - countScale(bin.length - 1)}
                fill={"crimson"}
              />
            );
          })}
        </g>
      </svg>
    );
  }
}
