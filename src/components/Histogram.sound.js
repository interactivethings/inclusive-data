import { histogram, max, min } from "d3-array";
import { axisBottom, axisLeft } from "d3-axis";
import { scaleLinear } from "d3-scale";
import { select } from "d3-selection";
import * as React from "react";
import planets from "../data/tidy/planets.json";
import "./Histogram.css";
import Tone from "tone";

// create a synth and connect it to the master output (speakers)
const synth = new Tone.Synth().toMaster();

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

const TONE_SCALE = scaleLinear()
  .domain([0, MAX_COUNT])
  .range([16, 76]); // A3 to A7

/** Component */
export class Histogram extends React.Component {
  constructor() {
    super();
    this.axisX = React.createRef();
    this.axisY = React.createRef();
    this.data = React.createRef();
    this.dataGroup = React.createRef();
    this.state = { areBarsFocusable: false, focusedBar: 0, displayHint: false };
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

  moveFocusToDataGroup = e => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ areBarsFocusable: false, displayHint: true });
    this.dataGroup.current.focus();
  };

  moveFocusToCurrentDataPoint = e => {
    if (e.keyCode === 39) {
      this.setState(
        {
          areBarsFocusable: true,
          displayHint: false,
          focusedBar:
            this.state.focusedBar > 0 && this.state.focusedBar !== NB_BINS - 1
              ? this.state.focusedBar
              : 0
        },
        this.focusRectangle,
        this.playSound(BINS[this.state.focusedBar].length)
      );
    } else {
      // if (e.keyCode === 37)
      this.setState(
        {
          areBarsFocusable: true,
          displayHint: false,
          focusedBar:
            this.state.focusedBar < NB_BINS - 1 && this.state.focusedBar > 0
              ? this.state.focusedBar
              : NB_BINS - 1
        },
        this.focusRectangle,
        this.playSound(BINS[this.state.focusedBar].length)
        // FIXME: last and first bar sound os wrong when coming from data group.
      );
    }
  };

  moveFocusToPreviousBar = e => {
    e.stopPropagation();
    e.preventDefault();
    const { focusedBar } = this.state;
    if (focusedBar > 0) {
      this.setState(
        { focusedBar: this.state.focusedBar - 1, displayHint: false },
        this.focusRectangle,
        this.playSound(BINS[this.state.focusedBar - 1].length)
      );
    } else {
      this.moveFocusToDataGroup(e);
      this.setState({ areBarsFocusable: false });
    }
  };

  moveFocusToNextBar = e => {
    e.stopPropagation();
    e.preventDefault();
    if (this.state.focusedBar < NB_BINS - 1) {
      this.setState(
        { focusedBar: this.state.focusedBar + 1, displayHint: false },
        this.focusRectangle,
        this.playSound(BINS[this.state.focusedBar + 1].length)
      );
    } else {
      this.moveFocusToDataGroup(e);
      this.setState({ areBarsFocusable: false });
    }
  };

  focusRectangle = () => {
    this.data.current.focus();
  };

  playSound = count => {
    const note = Tone.Frequency("A1").transpose(TONE_SCALE(count));
    synth.triggerAttackRelease(note, "16n");
  };

  stopPropagation = e => {
    e.stopPropagation();
    e.preventDefault();
  };

  handleBarClick = (index, count) => {
    this.setState({
      focusedBar: index,
      areBarsFocusable: true,
      displayHint: false
    });
    this.playSound(count);
  };

  handleDataGroupFocus = () => {
    this.setState({ displayHint: true });
  };

  handleDataGroupBlur = () => {
    this.setState({ displayHint: false });
  };

  render() {
    return (
      <div className="histogram-container">
        <svg
          className="histogram-svg"
          width={W}
          height={H}
          role="application"
          tabIndex={-1}
          aria-labelledby="histogram-description"
        >
          <g
            className="histogram-axis"
            transform={`translate(${MARGIN.LEFT}, ${CHART_HEIGHT +
              MARGIN.TOP})`}
            ref={this.axisX}
            aria-label={`horizontal axis of a linear scale from 0 to ${MAX_DISTANCE} parsecs`}
          />
          <g
            className="histogram-axis"
            transform={`translate(${MARGIN.LEFT}, ${MARGIN.TOP})`}
            ref={this.axisY}
            // tabIndex={0}
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
            className="histogram-data"
            tabIndex={0}
            ref={this.dataGroup}
            transform={`translate(${MARGIN.LEFT}, ${MARGIN.TOP})`}
            onKeyDown={e =>
              e.keyCode === 39 || e.keyCode === 37
                ? this.moveFocusToCurrentDataPoint(e)
                : null
            }
            onFocus={() => this.handleDataGroupFocus()}
            onBlur={() => this.handleDataGroupBlur()}
          >
            {BINS.map((bin, i) => {
              return (
                <rect
                  ref={i === this.state.focusedBar && this.data}
                  onKeyDown={e =>
                    e.keyCode === 39 // Arrow-right
                      ? this.moveFocusToNextBar(e)
                      : e.keyCode === 37 // Arrow-left
                        ? this.moveFocusToPreviousBar(e)
                        : e.keyCode === 9
                          ? this.moveFocusToDataGroup(e)
                          : null
                  }
                  onClick={() => this.handleBarClick(i, bin.length)}
                  tabIndex={-1}
                  className="histogram-bar"
                  id={`histogram-bar-${i}`}
                  aria-label={`${bin.length} planets between ${bin.x0} and ${
                    bin.x1
                  } parsecs`}
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

          <g
            className="histogram-hint"
            transform={`translate(${MARGIN.LEFT}, ${MARGIN.TOP})`}
            style={{ display: this.state.displayHint ? "block" : "none" }}
          >
            <rect
              x={0}
              y={0}
              width={CHART_WIDTH}
              height={CHART_HEIGHT}
              className="histogram-hint-rect"
            />
            <text
              x={CHART_WIDTH / 2}
              y={CHART_HEIGHT / 2}
              className="histogram-hint-text"
            >
              ← Use left and right arrows to navigate between data points →
            </text>
          </g>
        </svg>
        <h3 id="histogram-title">
          Distribution of confirmed exoplanets by their distance to the Sun.
        </h3>
        {BINS.map((bin, i) => {
          return (
            <div
              className="histogram-tooltip"
              id={`histogram-tooltip-${i}`}
              style={{
                transform: `translate(${MARGIN.LEFT +
                  DISTANCE_SCALE(bin.x0)}px, ${MARGIN.TOP +
                  COUNT_SCALE(bin.length)}px)`,
                display:
                  this.state.areBarsFocusable && i === this.state.focusedBar
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
