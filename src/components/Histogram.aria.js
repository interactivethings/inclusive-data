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
    // this.dataGroup = React.createRef();
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
    if (e.key === "ArrowRight") {
      this.setState(
        {
          focusedBar:
            this.state.focusedBar === NB_BINS - 1
              ? 0
              : this.state.focusedBar + 1,
          withinNavigation: true
        },
        this.focusRectangle
      );
    } else {
      // if (e.key === "ArrowLeft")
      this.setState(
        {
          focusedBar:
            this.state.focusedBar === 0
              ? NB_BINS - 1
              : this.state.focusedBar - 1,
          withinNavigation: true
        },
        this.focusRectangle
      );
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

  focusRectangle = () => {
    this.data.current.focus();
    // You need to move focus for VoiceOver to actually read the new element, updating "aria-activedesendant" is not enough
  };
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
            e.key === "ArrowLeft" || e.key === "ArrowRight"
              ? this.moveFocusToNextDataPoint(e)
              : null
          }
        >
          <g
            className="histogram-axis"
            transform={`translate(${MARGIN.LEFT}, ${CHART_HEIGHT +
              MARGIN.TOP})`}
            ref={this.axisX}
            tabIndex={-1}
          />
          <g
            className="histogram-axis"
            transform={`translate(${MARGIN.LEFT}, ${MARGIN.TOP})`}
            ref={this.axisY}
            tabIndex={-1}
          />
          <text
            className="histogram-y-axis-label"
            id="histogram-y-axis-label"
            x={W}
            y={H}
            tabIndex={-1}
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
                  className="histogram-bar"
                  key={i}
                  ref={i === this.state.focusedBar && this.data} // We need a ref to update focus
                  tabIndex={-1} // need a tabIndex to receive focus
                  onMouseOver={() => this.displayHint(i)}
                  onFocus={() => this.displayHint(i)}
                  onMouseOut={() => this.hideHint()}
                  onBlur={() => this.hideHint()}
                  onKeyDown={e =>
                    e.key === "ArrowLeft" || e.key === "ArrowRight"
                      ? this.moveFocusToNextDataPoint(e)
                      : null
                  }
                  aria-label={`${bin.length} planets between ${bin.x0} and ${
                    bin.x1
                  } parsecs`}
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
          {/* Using visibility: hidden */}
          {`Histogram where the horizontal axis is a linear scale of distance to the Sun in parsecs from 0 to ${MAX_DISTANCE} and where the vertical axis is a count of planets in each bin. Use left and right arrows to access single data points, press tab to exit`}
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