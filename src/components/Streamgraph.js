import { max, bisector } from "d3-array";
import { axisTop } from "d3-axis";
import { nest } from "d3-collection";
import { scaleLinear, scaleOrdinal } from "d3-scale";
import { schemeDark2 } from "d3-scale-chromatic";
import {
  area,
  curveBasis,
  stack,
  stackOffsetWiggle,
  stackOrderInsideOut
} from "d3-shape";
import { select } from "d3-selection";
import { format } from "d3-format";

import * as React from "react";
import PLANETS from "../data/tidy/planets.json";
import "./Streamgraph.css";

const W = 1200;
const H = 600;
const MARGIN = { TOP: 50, RIGHT: 20, BOTTOM: 20, LEFT: 20 };
const CHART_WIDTH = W - MARGIN.LEFT - MARGIN.RIGHT;
const CHART_HEIGHT = H - MARGIN.TOP - MARGIN.BOTTOM;
const YEARS = Array.from(
  new Set(PLANETS.filter(d => d.pl_disc !== 1989).map(d => d.pl_disc))
).sort();
const TIME_DOMAIN = [1992, 2018];

const YEAR_MIN = TIME_DOMAIN[0];
const YEAR_MAX = TIME_DOMAIN[1];
const OFFSET = 32;
const DISCOVERY_METHODS_ALL = [
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
const DISCOVERY_METHODS = ["Radial Velocity", "Transit", "Other methods"];
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
    this.axisX = React.createRef();
    this.stackGroup = React.createRef();
    this.line = React.createRef();
    this.overlay = React.createRef();
    this.state = {
      highlightedYear: null
    };
  }
  getLinearScale = (domain, range) => {
    const ls = scaleLinear()
      .domain(domain)
      .range(range);
    return ls;
  };

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

    const flat = Object.keys(n).map(key => ({
      year: +key,
      "Radial Velocity": n[key]["Radial Velocity"] || 0,
      Transit: n[key]["Transit"] || 0,
      Imaging: n[key]["Imaging"] || 0,
      "Eclipse Timing Variations": n[key]["Eclipse Timing Variations"] || 0,
      Astrometry: n[key]["Astrometry"] || 0,
      "Orbital Brightness Modulation":
        n[key]["Orbital Brightness Modulation"] || 0,
      "Pulsation Timing Variations": n[key]["Pulsation Timing Variations"] || 0,
      "Transit Timing Variations": n[key]["Transit Timing Variations"] || 0,
      Microlensing: n[key]["Microlensing"] || 0,
      "Pulsar Timing": n[key]["Pulsar Timing"] || 0
    }));

    const flatten = flat.map(d => ({
      "Other methods":
        d.Imaging +
        d["Eclipse Timing Variations"] +
        d.Astrometry +
        d["Orbital Brightness Modulation"] +
        d["Pulsation Timing Variations"] +
        d["Transit Timing Variations"] +
        d.Microlensing +
        d["Pulsar Timing"],
      ...d
    }));

    const st = stack()
      .keys(DISCOVERY_METHODS)
      .offset(stackOffsetWiggle)
      .order(stackOrderInsideOut);

    return st(flatten);
  };

  createAxisX = scale => {
    const g = select(this.axisX.current);
    g.call(
      axisTop(scale)
        .tickFormat(format("d"))
        .tickSize(-CHART_HEIGHT)
    );
    g.attr("class", "streamgraph-axis");
  };

  highlight = e => {
    const timeScale = this.getLinearScale(TIME_DOMAIN, [0, CHART_WIDTH]);

    const mouseX =
      e.nativeEvent.clientX - this.overlay.current.getBoundingClientRect().left;
    const bisectYear = bisector((x, date) => x - date).left;
    const thisYear = timeScale.invert(mouseX);

    if (thisYear) {
      const i = bisectYear(YEARS, thisYear, 1);
      const dLeft = YEARS[i - 1];
      const dRight = YEARS[i] || dLeft;
      const closestYear = thisYear - dLeft > dRight - thisYear ? dRight : dLeft;
      const yearInArray = closestYear;
      this.setState({ highlightedYear: YEARS.indexOf(yearInArray) });
    }
  };

  lowlight = () => {
    this.setState({ highlightedYear: null });
  };

  moveFocusToStackGroup = e => {
    console.log("move focus to stack groups");
    e.preventDefault();
    e.stopPropagation();
    this.stackGroup.current.focus();
  };

  moveFocusToCurrentYear = e => {
    console.log("move focus to current year");
    if (e.keyCode === 39) {
      this.setState(
        {
          highlightedYear:
            YEARS[this.state.highlightedYear] > YEAR_MIN
              ? this.state.highlightedYear
              : 0
        },
        this.focusLine
      );
    } else if (e.keyCode === 37) {
      this.setState(
        {
          highlightedYear:
            YEARS[this.state.highlightedYear] < YEAR_MAX &&
            this.state.highlightedYear > 0
              ? this.state.highlightedYear
              : YEARS.indexOf(YEAR_MAX)
        },
        this.focusLine
      );
    } else {
      console.error("This key press is not handled");
      return;
    }
  };

  moveFocusToNextYear = e => {
    console.log("move focus to next year");
    e.stopPropagation();
    if (YEARS[this.state.highlightedYear] < YEAR_MAX) {
      this.setState(
        { highlightedYear: this.state.highlightedYear + 1 },
        this.focusLine
      );
    } else {
      this.setState({ highlightedYear: null });
      this.moveFocusToStackGroup(e);
    }
  };

  moveFocusToPreviousYear = e => {
    console.log("move focus to previous year");
    e.stopPropagation();
    if (YEARS[this.state.highlightedYear] > YEAR_MIN) {
      this.setState(
        { highlightedYear: this.state.highlightedYear - 1 },
        this.focusLine
      );
    } else {
      this.setState({ highlightedYear: null });
      this.moveFocusToStackGroup(e);
    }
  };

  focusLine = () => {
    this.line.current.focus();
  };

  componentDidMount() {
    const timeScale = this.getLinearScale(TIME_DOMAIN, [0, CHART_WIDTH]);
    this.createAxisX(timeScale);
  }

  render() {
    const series = this.getStackedData(PLANETS);

    const stackMax = layer => {
      return max(layer, d => d[1]);
    };

    const countDomain = [0, max(series, stackMax)];

    const timeScale = this.getLinearScale(TIME_DOMAIN, [0, CHART_WIDTH]);
    const countScale = this.getLinearScale(countDomain, [CHART_HEIGHT / 2, 0]);
    const colorScale = this.getColorScale(DISCOVERY_METHODS, schemeDark2);

    const areaGenerator = area()
      .x(d => timeScale(d.data.year))
      .y0(d => countScale(d[0]))
      .y1(d => countScale(d[1]))
      .curve(curveBasis);

    return (
      <div className="streamgraph-container">
        <svg width={W} height={H} tabIndex={0} className="streamgraph-svg">
          <g
            className="streamgraph-axis"
            transform={`translate(${MARGIN.LEFT}, ${MARGIN.TOP})`}
            ref={this.axisX}
            tabIndex={0}
            aria-label={`horizontal axis, timeline from ${TIME_DOMAIN[0]} to ${
              TIME_DOMAIN[1]
            }`}
          />

          <g
            tabIndex={0}
            ref={this.stackGroup}
            transform={`translate(${MARGIN.LEFT}, ${MARGIN.TOP})`}
            className="streamgraph-stack-group"
            onKeyDown={e =>
              e.keyCode === 39 || e.keyCode === 37
                ? this.moveFocusToCurrentYear(e)
                : null
            }
          >
            {series.map((d, i) => {
              return (
                <React.Fragment>
                  <path
                    className="streamgraph-stream"
                    key={`stack-${d}`}
                    d={areaGenerator(d)}
                    fill={colorScale(d.key)}
                    tabIndex={-1}
                    aria-label={`area of the number of planets discovered by ${
                      d.key
                    } from ${TIME_DOMAIN[0]} to ${
                      TIME_DOMAIN[1]
                    }, Minimum? Maximum? Average? Median? Standard Deviation?`}
                    onMouseDown={() => console.log(d.key)}
                  />
                </React.Fragment>
              );
            })}
          </g>
          {YEARS.map(y => (
            <line
              ref={y === YEARS[this.state.highlightedYear] && this.line}
              aria-labelledby={`#streamgraph-tooltip-${y}`}
              className="streamgraph-overlay-line"
              transform={`translate(${MARGIN.LEFT}, ${MARGIN.TOP})`}
              tabIndex={-1}
              x1={timeScale(y)}
              y1={OFFSET}
              x2={timeScale(y)}
              y2={CHART_HEIGHT}
              style={{
                display:
                  y === YEARS[this.state.highlightedYear] ? "block" : "none"
              }}
              onKeyDown={e =>
                e.keyCode === 39
                  ? this.moveFocusToNextYear(e)
                  : e.keyCode === 37
                    ? this.moveFocusToPreviousYear(e)
                    : e.keyCode === 9
                      ? this.moveFocusToStackGroup(e)
                      : null
              }
            />
          ))}
          <rect
            ref={this.overlay}
            className="streamgraph-overlay"
            transform={`translate(${MARGIN.LEFT}, ${MARGIN.TOP})`}
            x={timeScale(TIME_DOMAIN[0])}
            width={timeScale(TIME_DOMAIN[1])}
            y={0}
            height={CHART_HEIGHT}
            onMouseMove={e => {
              this.highlight(e);
            }}
            onMouseOut={this.lowlight}
            onBlur={this.lowlight}
          />
        </svg>
        {YEARS.map(y => (
          <div
            id={`streamgraph-tooltip-${y}`}
            className="streamgraph-tooltip"
            style={{
              transform: `translate(${MARGIN.LEFT +
                OFFSET / 2 +
                timeScale(y)}px, ${MARGIN.TOP + OFFSET + OFFSET / 2}px)`,
              display:
                y === YEARS[this.state.highlightedYear] ? "block" : "none"
            }}
          >
            <div className="streamgraph-tooltip-item">
              {YEARS[this.state.highlightedYear]} <br />
              {series[0].key}:{" "}
              {series[0]
                .filter(d => d.data.year === YEARS[this.state.highlightedYear])
                .map(d => d.data["Radial Velocity"])}
              <br />
              {series[1].key}:{" "}
              {series[1]
                .filter(d => d.data.year === YEARS[this.state.highlightedYear])
                .map(d => d.data["Transit"])}
              <br />
              {series[2].key}:{" "}
              {series[2]
                .filter(d => d.data.year === YEARS[this.state.highlightedYear])
                .map(d => d.data["Other methods"])}
              <br />
            </div>
          </div>
        ))}
        <div className="streamgraph-legend-group">
          {series.map(d => (
            <React.Fragment>
              <div
                className="streamgraph-legend-square"
                style={{ backgroundColor: colorScale(d.key) }}
              />
              <div className="streamgraph-legend-label">{d.key}</div>
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }
}
