import { histogram, max, min } from "d3-array";
import { axisBottom, axisLeft } from "d3-axis";
import { scaleLinear } from "d3-scale";
import { select } from "d3-selection";
import * as React from "react";
import planets from "../data/tidy/planets.json";
import "./Histogram.css";

const W = 1200;
const H = 600;
const MARGIN = { TOP: 50, RIGHT: 50, BOTTOM: 50, LEFT: 50 };
const CHART_WIDTH = W - MARGIN.LEFT - MARGIN.RIGHT;
const CHART_HEIGHT = H - MARGIN.TOP - MARGIN.BOTTOM;
const NB_BINS = 120;

const FILTERED_PLANETS = planets.filter(d => d.st_dist < 2000);

const MAX_DISTANCE = max(FILTERED_PLANETS, d => d.st_dist);
const DISTANCE_SCALE = scaleLinear()
  .domain([0, MAX_DISTANCE])
  .range([0, CHART_WIDTH])
  .nice();
const BINS = histogram()
  .domain(DISTANCE_SCALE.domain())
  .thresholds(DISTANCE_SCALE.ticks(NB_BINS))
  .value(d => d.st_dist)(FILTERED_PLANETS);

const MIN_COUNT = min(BINS, d => d.length);
const MAX_COUNT = max(BINS, d => d.length);
const COUNT_SCALE = scaleLinear()
  .domain([MIN_COUNT, MAX_COUNT])
  .range([CHART_HEIGHT, 0])
  .nice();

export class Histogram extends React.Component {
  constructor() {
    super();
    this.axisX = React.createRef();
    this.axisY = React.createRef();
  }
  createAxisX = scale => {
    const g = select(this.axisX.current);
    g.call(axisBottom(scale));
  };
  createAxisY = scale => {
    const g = select(this.axisY.current);
    g.call(axisLeft(scale));
  };
  componentDidMount() {
    this.createAxisX(DISTANCE_SCALE);
    this.createAxisY(COUNT_SCALE);
  }

  render() {
    return (
      <div className="histogram-container">
        <h4 id="histogram-description">
          Distribution of confirmed exoplanets by their distance to the Sun.
        </h4>
        <svg
          width={W}
          height={H}
          tabIndex={0}
          aria-labelledby="#histogram-description"
        >
          <g
            transform={`translate(${MARGIN.LEFT}, ${CHART_HEIGHT +
              MARGIN.TOP})`}
            ref={this.axisX}
            tabIndex={0}
            aria-label={`horizontal axis of a linear scale from 0 to ${MAX_DISTANCE} parsecs`}
          />
          <g
            transform={`translate(${MARGIN.LEFT}, ${MARGIN.TOP})`}
            ref={this.axisY}
            tabIndex={0}
            aria-label={`vertical axis of a linear scale from 0 to ${MAX_COUNT} planets`}
            // aria-labelledby="#histogram-y-axis-label"
          />
          <text
            className="histogram-y-axis-label"
            id="histogram-y-axis-label"
            x={W}
            y={H}
          >
            → distance (parsecs)
          </text>
          <g
            transform={`translate(${MARGIN.LEFT}, ${MARGIN.TOP})`}
            tabIndex={0}
            aria-label={`group of ${
              BINS.length
            } histogram rectangles displaying the data`}
            onKeyDown={() => console.log("keydown")}
          >
            {BINS.map((bin, i) => {
              return (
                <rect
                  tabIndex={0}
                  aria-label={`bin from distance ${bin.x0} and ${
                    bin.x1
                  } parsecs, contains ${bin.length} planets`}
                  key={i}
                  data-n={`bin-${bin.x0}:${bin.x1}`}
                  x={DISTANCE_SCALE(bin.x0)}
                  y={COUNT_SCALE(bin.length)}
                  width={CHART_WIDTH / NB_BINS}
                  height={CHART_HEIGHT - COUNT_SCALE(bin.length)}
                />
              );
            })}
          </g>
        </svg>
      </div>
    );
  }
}
