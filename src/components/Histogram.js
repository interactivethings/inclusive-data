import { histogram, max } from "d3-array";
import { axisBottom, axisLeft } from "d3-axis";
import { scaleLinear } from "d3-scale";
import { select } from "d3-selection";
import * as React from "react";
import planets from "../data/tidy/planets.json";
import "./Scatterplot.css";

const W = 1200;
const H = 600;
const MARGIN = { TOP: 50, RIGHT: 50, BOTTOM: 50, LEFT: 50 };
const CHART_WIDTH = W - MARGIN.LEFT - MARGIN.RIGHT;
const CHART_HEIGHT = H - MARGIN.TOP - MARGIN.BOTTOM;
const NB_BINS = 120;

const FILTERED_PLANETS = planets.filter(d => d.st_dist < 2000);

const DISTANCE_SCALE = scaleLinear()
  .domain([0, max(FILTERED_PLANETS, d => d.st_dist)])
  .range([0, CHART_WIDTH])
  .nice();

const BINS = histogram()
  .domain(DISTANCE_SCALE.domain())
  .thresholds(DISTANCE_SCALE.ticks(NB_BINS))
  .value(d => d.st_dist)(FILTERED_PLANETS);

const COUNT_SCALE = scaleLinear()
  .domain([0, max(BINS, d => d.length)])
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
      <svg width={W} height={H}>
        <g
          transform={`translate(${MARGIN.LEFT}, ${CHART_HEIGHT + MARGIN.TOP})`}
          ref={this.axisX}
          tab-index={1}
        />
        <g
          transform={`translate(${MARGIN.LEFT}, ${MARGIN.TOP})`}
          ref={this.axisY}
          tab-index={1}
        />

        <g transform={`translate(${MARGIN.LEFT}, ${MARGIN.TOP})`}>
          {BINS.map((bin, i) => {
            return (
              <rect
                key={i}
                data-n={`bin-${bin.x0}:${bin.x1}`}
                x={DISTANCE_SCALE(bin.x0)}
                y={COUNT_SCALE(bin.length)}
                width={CHART_WIDTH / NB_BINS}
                height={CHART_HEIGHT - COUNT_SCALE(bin.length)}
                fill={"crimson"}
              />
            );
          })}
        </g>
      </svg>
    );
  }
}
