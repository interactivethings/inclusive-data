import { histogram, max, min } from "d3-array";
import { axisBottom, axisLeft } from "d3-axis";
import { scaleLinear } from "d3-scale";
import { select } from "d3-selection";
import * as React from "react";
import planets from "../data/tidy/planets.json";
import "./Histogram.css";

/** Constants */
const W = 1200;
const H = 600;
const MARGIN = { TOP: 50, RIGHT: 50, BOTTOM: 50, LEFT: 50 };
const CHART_WIDTH = W - MARGIN.LEFT - MARGIN.RIGHT;
const CHART_HEIGHT = H - MARGIN.TOP - MARGIN.BOTTOM;
const TARGET_NB_BINS = 100;

const FILTERED_PLANETS = planets.filter(d => d.st_dist < 2000);

const MAX_DISTANCE = max(FILTERED_PLANETS, d => d.st_dist);
const DISTANCE_SCALE = scaleLinear()
  .domain([0, MAX_DISTANCE])
  .range([0, CHART_WIDTH])
  .nice();

const BINS = histogram()
  .domain(DISTANCE_SCALE.domain())
  .thresholds(DISTANCE_SCALE.ticks(TARGET_NB_BINS))
  .value(d => d.st_dist)(FILTERED_PLANETS);

const NB_BINS = DISTANCE_SCALE.ticks(TARGET_NB_BINS).length;

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
    this.data = React.createRef();
    this.dataGroup = React.createRef();
    this.state = { focusedBar: 0, withinNavigation: false, displayHint: false };
  }

  createAxisX = scale => {
    const g = select(this.axisX.current);
    g.call(axisBottom(scale).tickSize(-CHART_HEIGHT));
  };

  createAxisY = scale => {
    const g = select(this.axisY.current);
    g.call(axisLeft(scale).tickSize(-CHART_WIDTH));
  };

  moveFocusToNextDataPoint = e => {
    if (e.keyCode === 39) {
      this.setState({
        focusedBar:
          this.state.focusedBar === NB_BINS - 1 ? 0 : this.state.focusedBar + 1,
        withinNavigation: true
      });
    } else {
      // if (e.keyCode === 37)
      this.setState({
        focusedBar:
          this.state.focusedBar === 0 ? NB_BINS - 1 : this.state.focusedBar - 1,
        withinNavigation: true
      });
    }
  };

  displayHint = index => {
    this.setState({ displayHint: true, focusedBar: index });
  };
  hideHint = index => {
    this.setState({ displayHint: false });
  };

  componentDidMount() {
    this.createAxisX(DISTANCE_SCALE);
    this.createAxisY(COUNT_SCALE);
  }

  render() {
    return (
      <div className="histogram-container">
        <svg
          className="histogram-svg"
          width={W}
          height={H}
          tabIndex={0} // Makes the element focusable (accessible through tabbing), and thus actionable
          role="application" // Tells screen readers that this is an interactive component
          aria-roledescription="data visualization" // Tells what kind of interactive element it is
          aria-labelledby="histogram-title" // Link to id of title
          aria-describedby="histogram-description" // Link to hidden description of the application, with instructions
          aria-activedescendant={
            // Used to move aria focus to elements within the application, updates on user interaction
            this.state.withinNavigation
              ? `histogram-bar-${this.state.focusedBar}`
              : null
          }
          aria-live="assertive"
          onKeyDown={e =>
            e.keyCode === 39 || e.keyCode === 37
              ? this.moveFocusToNextDataPoint(e)
              : null
          }
        >
          <g
            className="histogram-axis"
            transform={`translate(${MARGIN.LEFT}, ${CHART_HEIGHT +
              MARGIN.TOP})`}
            ref={this.axisX}
          />
          <g
            className="histogram-axis"
            transform={`translate(${MARGIN.LEFT}, ${MARGIN.TOP})`}
            ref={this.axisY}
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
            className="histogram-data"
            ref={this.dataGroup}
            transform={`translate(${MARGIN.LEFT}, ${MARGIN.TOP})`}
          >
            {BINS.map((bin, i) => {
              return (
                <rect
                  id={`histogram-bar-${i}`}
                  onMouseOver={() => this.displayHint(i)}
                  onFocus={() => this.displayHint(i)}
                  onMouseOut={() => this.hideHint()}
                  onBlur={() => this.hideHint()}
                  className="histogram-bar"
                  aria-label={`${bin.length} planets between ${bin.x0} and ${
                    bin.x1
                  } parsecs`}
                  key={i}
                  x={DISTANCE_SCALE(bin.x0)}
                  y={COUNT_SCALE(bin.length)}
                  width={CHART_WIDTH / NB_BINS - 2}
                  height={CHART_HEIGHT - COUNT_SCALE(bin.length)}
                />
              );
            })}
          </g>
        </svg>
        <h3 id="histogram-title" className="histogram-title">
          Distribution of confirmed exoplanets by their distance to the Sun.
        </h3>
        <div id="histogram-description" className="histogram-description">
          Description:
          {`horizontal axis of a linear scale from 0 to ${MAX_DISTANCE} parsecs - `}
          {`vertical axis of a linear scale from 0 to ${MAX_COUNT} planets`}
        </div>
        {BINS.map((bin, i) => {
          return (
            <div
              className="histogram-tooltip"
              id={`histogram-tooltip-${i}`}
              key={`histogram-tooltip-${i}`}
              style={{
                transform: `translate(${MARGIN.LEFT +
                  DISTANCE_SCALE(bin.x0)}px, ${MARGIN.TOP +
                  COUNT_SCALE(bin.length)}px)`,
                display:
                  this.state.displayHint && i === this.state.focusedBar
                    ? "block"
                    : "none"
              }}
            >
              <div className="histogram-tooltip-item">
                {bin.length} planets within <br />
                {bin.x0}-{bin.x1} parsecs
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}
