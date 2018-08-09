import { histogram, max, min } from "d3-array";
import { axisBottom, axisLeft } from "d3-axis";
import { scaleLinear } from "d3-scale";
import { select } from "d3-selection";
import * as React from "react";
import planets from "../data/tidy/planets.json";
import "./Histogram.css";
import { runInThisContext } from "vm";

/** Constants */
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

/** Component */
export class Histogram extends React.Component {
  constructor() {
    super();
    this.axisX = React.createRef();
    this.axisY = React.createRef();
    this.dataGroup = React.createRef();
    this.state = { areBarsFocusable: false, focusedBar: 4 };
  }
  createAxisX = scale => {
    const g = select(this.axisX.current);
    g.call(axisBottom(scale).tickSize(-CHART_HEIGHT));
  };
  createAxisY = scale => {
    const g = select(this.axisY.current);
    g.call(axisLeft(scale).tickSize(-CHART_WIDTH));
  };
  componentDidMount() {
    this.createAxisX(DISTANCE_SCALE);
    this.createAxisY(COUNT_SCALE);
  }

  toggleBarsFocus = () => {
    this.setState({ areBarsFocusable: !this.state.areBarsFocusable });
  };
  moveFocusToFirstBar = () => {
    this.setState({ areBarsFocusable: !this.state.areBarsFocusable });
  };
  moveFocusToNextBar = () => {
    this.setState({ focusedBar: this.state.focusedBar + 1 });
  };
  render() {
    return (
      <div className="histogram-container">
        <h4 id="histogram-description">
          Distribution of confirmed exoplanets by their distance to the Sun.
        </h4>
        <svg
          className="histogram-svg"
          width={W}
          height={H}
          tabIndex={0}
          aria-labelledby="#histogram-description"
        >
          <g
            className="histogram-axis"
            transform={`translate(${MARGIN.LEFT}, ${CHART_HEIGHT +
              MARGIN.TOP})`}
            ref={this.axisX}
            tabIndex={0}
            aria-label={`horizontal axis of a linear scale from 0 to ${MAX_DISTANCE} parsecs`}
          />
          <g
            className="histogram-axis"
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
            ref={this.dataGroup}
            className="histogram-data"
            transform={`translate(${MARGIN.LEFT}, ${MARGIN.TOP})`}
            tabIndex={0}
            aria-label={`group of ${
              BINS.length
            } histogram rectangles displaying the data, press "Enter" to tab through single data points.`}
            onKeyDown={e => e.keyCode === 13 && this.moveFocusToNextBar()}
          >
            {BINS.map((bin, i) => {
              return (
                <React.Fragment>
                  <Bar
                    bin={bin}
                    index={i}
                    focusable={this.state.areBarsFocusable}
                    focused={true}
                    // focused={this.state.focusedBar === i ? true : false}
                  />
                </React.Fragment>
              );
            })}
          </g>
        </svg>
        {BINS.map(bin => {
          return (
            <div
              className="histogram-tooltip"
              style={{
                transform: `translate(${MARGIN.LEFT +
                  DISTANCE_SCALE(bin.x0)}px, ${MARGIN.TOP +
                  COUNT_SCALE(bin.length)}px)`
              }}
            >
              <div className="histogram-tooltip-item">
                {bin.length} planets within
              </div>
              <div className="histogram-tooltip-item">
                {bin.x0}-{bin.x1} parsecs
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

class Bar extends React.Component {
  constructor(props) {
    super(props);
    this.bar = React.createRef();
  }
  componentDidMount() {
    const { focused } = this.props;
    if (focused) this.bar.current.focus();
  }

  render() {
    const { bin, index, focusable } = this.props;

    return (
      <rect
        ref={this.bar}
        tabIndex={focusable ? 0 : -1}
        className="histogram-bar"
        id={`histogram-bar-${index}`}
        aria-label={`bin from distance ${bin.x0} and ${
          bin.x1
        } parsecs, contains ${bin.length} planets`}
        key={index}
        data-n={`bin-${bin.x0}:${bin.x1}`}
        x={DISTANCE_SCALE(bin.x0)}
        y={COUNT_SCALE(bin.length)}
        width={CHART_WIDTH / NB_BINS}
        height={CHART_HEIGHT - COUNT_SCALE(bin.length)}
        // onKeyDown={e => e.keyCode === 27 && this.toggleBarsFocus()}
      />
    );
  }
}
