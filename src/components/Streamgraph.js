import { max } from "d3-array";
import { nest } from "d3-collection";
import { scaleLinear, scaleOrdinal, scaleLog } from "d3-scale";
import {
  schemePastel1,
  interpolateWarm,
  schemeDark2
} from "d3-scale-chromatic";
import {
  area,
  stack,
  stackOrderInsideOut,
  stackOffsetWiggle,
  curveBasis
} from "d3-shape";
import * as React from "react";
import planets from "../data/tidy/planets.json";

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
// interface Flatten {
//   year: number;
//   "Radial Velocity": number | undefined;
//   Imaging: number | undefined;
//   "Eclipse Timing Variations": number | undefined;
//   Transit: number | undefined;
//   Astrometry: number | undefined;
//   "Orbital Brightness Modulation": number | undefined;
//   "Pulsation Timing Variations": number | undefined;
//   "Transit Timing Variations": number | undefined;
//   Microlensing: number | undefined;
//   "Pulsar Timing": number | undefined;
// }
// type DiscoveryMethod = string;

// interface Planet {
//   pl_name: string;
//   pl_disc: string;
//   pl_discmethod: DiscoveryMethod;
//   pl_rade: number | null;
//   pl_masse: number;
//   st_dist: number;
// }

export class Streamgraph extends React.Component {
  constructor() {
    super();
    this.stackGroup = React.createRef();
  }
  getLinearScale = (domain, range) => {
    const ls = scaleLinear()
      .domain(domain)
      .range(range);
    return ls;
  };
  getLogScale = (domain, range) => {
    const ls = scaleLog()
      .domain(domain)
      .range(range)
      .nice();
    return ls;
  };
  // getOrdinalScale = (domain, range) => {
  //   const ls = scaleOrdinal()
  //     .domain(domain)
  //     .range(range)
  //   return ls;
  // };

  getColorScale = (domain, range) => {
    const cs = scaleOrdinal()
      .domain(domain)
      .range(range);
    return cs;
  };

  getStackedData = data => {
    const n = nest()
      .key(d => d.pl_disc)
      .key(d => d.pl_discmethod)
      .rollup(d => (d ? d.length : 0))
      .object(data);

    const flatten = Object.keys(n).map(key => ({
      year: +key,
      "Radial Velocity": n[key]["Radial Velocity"]
        ? n[key]["Radial Velocity"]
        : 0,
      Imaging: n[key]["Imaging"] ? n[key]["Imaging"] : 0,
      "Eclipse Timing Variations": n[key]["Eclipse Timing Variations"]
        ? n[key]["Eclipse Timing Variations"]
        : 0,
      Transit: n[key]["Transit"] ? n[key]["Transit"] : 0,
      Astrometry: n[key]["Astrometry"] ? n[key]["Astrometry"] : 0,
      "Orbital Brightness Modulation": n[key]["Orbital Brightness Modulation"]
        ? n[key]["Orbital Brightness Modulation"]
        : 0,
      "Pulsation Timing Variations": n[key]["Pulsation Timing Variations"]
        ? n[key]["Pulsation Timing Variations"]
        : 0,
      "Transit Timing Variations": n[key]["Transit Timing Variations"]
        ? n[key]["Transit Timing Variations"]
        : 0,
      Microlensing: n[key]["Microlensing"] ? n[key]["Microlensing"] : 0,
      "Pulsar Timing": n[key]["Pulsar Timing"] ? n[key]["Pulsar Timing"] : 0
    }));

    const st = stack()
      .keys(DISCOVERY_METHODS)
      .offset(stackOffsetWiggle)
      .order(stackOrderInsideOut);

    return st(flatten);
  };

  render() {
    const series = this.getStackedData(planets);

    const stackMax = layer => {
      return max(layer, d => d[1]);
    };

    const timeDomain = [1992, 2018];
    const countDomain = [0, max(series, stackMax) / 5];

    const timeScale = this.getLinearScale(timeDomain, [0, CHART_WIDTH]);
    const countScale = this.getLinearScale(countDomain, [CHART_HEIGHT / 2, 0]);
    const colorScale = this.getColorScale(DISCOVERY_METHODS, schemeDark2);

    const areaGenerator = area()
      .x(d => timeScale(d.data.year))
      .y0(d => countScale(d[0]))
      .y1(d => countScale(d[1]))
      .curve(curveBasis);

    return (
      <div className="streamgraph-root">
        <svg width={W} height={H}>
          <g
            ref={this.stackGroup}
            transform={`translate(${MARGIN.LEFT}, ${MARGIN.TOP})`}
            data-n="stacks-group"
          >
            {series.map((d, i) => {
              return (
                <path
                  key={`stack-${d}`}
                  d={areaGenerator(d)}
                  data-n="stack-serie"
                  fill={colorScale(d.key)}
                />
              );
            })}
          </g>
        </svg>
      </div>
    );
  }
}
