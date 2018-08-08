import { max, extent } from "d3-array";
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
const MARGIN = { TOP: 20, RIGHT: 20, BOTTOM: 20, LEFT: 20 };
const CHART_WIDTH = W - MARGIN.LEFT - MARGIN.RIGHT;
const CHART_HEIGHT = H - MARGIN.TOP - MARGIN.BOTTOM;

const DISCOVERY_METHODS = [
  "Radial Velocity",
  "Imaging",
  "Eclipse Timing Variations",
  "Transit",
  "Astrometry",
  "Orbital Brightness Modulation",
  "Pulsation Timing Variations",
  "Transit Timing Variations",
  "Microlensing",
  "Pulsar Timing"
];

export class Scatterplot extends React.Component {
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
  getLogScale = (domain, range) => {
    const ls = scaleLog()
      .domain(domain)
      .range(range)
      .nice();
    return ls;
  };
  getBandScale = (domain, range) => {
    const bs = scaleBand()
      .domain(domain)
      .range(range);
    return bs;
  };
  getColorScale = (domain, range) => {
    const cs = scaleOrdinal()
      .domain(domain)
      .range(range);
    return cs;
  };
  getRadiusScale = (domain, range) => {
    const rs = scaleSqrt()
      .domain(domain)
      .range(range);
    return rs;
  };

  createAxisX = scale => {
    const g = select(this.axisX.current);
    g.call(() => axisBottom(scale));
  };
  createAxisY = scale => {
    const g = select(this.axisX.current);
    g.call(() => axisLeft(scale));
  };
  componentDidMount() {
    const orbitalPeriodDomain = extent(planets, d => d.pl_orbper);
    const orbitalPeriodScale = this.getLogScale(orbitalPeriodDomain, [
      0,
      CHART_WIDTH
    ]);
    const radiiExtent = extent(planets, d => d.pl_rade);
    const planetRadiusScale = this.getLogScale(radiiExtent, [CHART_HEIGHT, 0]);

    this.createAxisX(orbitalPeriodScale);
    this.createAxisY(planetRadiusScale);
  }

  render() {
    // const years = Array.from(new Set(planets.map(d => d.pl_disc)));

    // const distanceScale = this.getLinearScale(
    //   [0, max(planets, d => d.st_dist)],
    //   [CHART_HEIGHT, 0]
    // );
    // const massScale = this.getLinearScale(
    //   [0, max(planets, d => d.pl_masse)],
    //   [0, CHART_WIDTH]
    // );
    // const yearScale = this.getBandScale(years, [0, CHART_WIDTH]);
    // const radiusScale = this.getRadiusScale(radii, [2, 15]);

    const colors = this.getColorScale(DISCOVERY_METHODS, schemeDark2);

    const orbitalPeriodDomain = extent(planets, d => d.pl_orbper);
    console.log("orbital period domain", orbitalPeriodDomain);
    const orbitalPeriodScale = this.getLogScale(orbitalPeriodDomain, [
      0,
      CHART_WIDTH
    ]);

    const radiiExtent = extent(planets, d => d.pl_rade);
    console.log("raddii domain", radiiExtent);
    const planetRadiusScale = this.getLogScale(radiiExtent, [CHART_HEIGHT, 0]);

    return (
      <svg width={W} height={H}>
        <g
          transform={`translate(${MARGIN.LEFT}, ${CHART_HEIGHT + MARGIN.TOP})`}
          ref={this.axisX}
        />
        <g transform={`translate(0, ${MARGIN.TOP})`} ref={this.axisY} />

        <g transform={`translate(${MARGIN.LEFT}, ${MARGIN.TOP})`}>
          {planets.map(d => (
            <circle
              cx={orbitalPeriodScale(d.pl_orbper)}
              cy={planetRadiusScale(d.pl_rade)}
              r={2}
              fill={colors(d.pl_discmethod)}
              stroke={colors(d.pl_discmethod)}
              className="circle"
              onMouseEnter={() =>
                console.log(
                  `radus: ${d.pl_rade}, orbital period: ${
                    d.pl_orbper
                  }, discovery method: ${d.pl_discmethod}`
                )
              }
            />
          ))}
        </g>
      </svg>
    );
  }
}
