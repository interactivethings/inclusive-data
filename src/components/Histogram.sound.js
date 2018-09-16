import { histogram, max, min } from "d3-array";
import { axisBottom, axisLeft } from "d3-axis";
import { scaleLinear } from "d3-scale";
import { select } from "d3-selection";
import * as React from "react";
import planets from "../data/tidy/phl.json";
import "./Histogram.css";
import Tone from "tone";

/** Constants */
const W = 1200;
const H = 600;
const MARGIN = { TOP: 10, RIGHT: 50, BOTTOM: 50, LEFT: 50 };
const CHART_WIDTH = W - MARGIN.LEFT - MARGIN.RIGHT;
const CHART_HEIGHT = H - MARGIN.TOP - MARGIN.BOTTOM;
const TARGET_NB_BINS = 100;

const INDICATORS = [
  {
    id: "pl_radius",
    unit: "Earth Units",
    label: "Planet radius",
    celestialBody: "planet"
  },
  {
    id: "pl_mass",
    unit: "Earth Units",
    label: "Planet mass",
    celestialBody: "planet"
  },
  {
    id: "pl_density",
    unit: "Earth Units",
    label: "Planet density",
    celestialBody: "planet"
  },
  {
    id: "pl_gravity",
    unit: "Earth Units",
    label: "Planet gravity",
    celestialBody: "planet"
  },
  {
    id: "pl_escapeVelocity",
    unit: "Earth Units",
    label: "Planet escape velocity",
    celestialBody: "planet"
  },
  {
    id: "pl_starFluxMean",
    unit: "Earth Units",
    label: "Planet mean stellar flux",
    celestialBody: "planet"
  },
  {
    id: "pl_surfacePressure",
    unit: "Earth Units",
    label: "Planet surface pressure.",
    celestialBody: "planet"
  },
  {
    id: "pl_distance",
    unit: "Astronomical Units",
    label: "Planet mean distance from the star",
    celestialBody: "planet"
  },
  {
    id: "pl_TeqMean",
    unit: "Kelvins",
    label: "Planet mean equilibrium temperature",
    celestialBody: "planet"
  },
  {
    id: "pl_TsMean",
    unit: "Kelvins",
    label: "Planet mean surface temperature",
    celestialBody: "planet"
  },
  {
    id: "pl_magnitude",
    unit: "",
    label: "Planet magnitude as seen from a Moon-Earth distance",
    celestialBody: "planet"
  },
  {
    id: "pl_apparentSize",
    unit: "",
    label: "	Planet apparent size as seen from a Moon-Earth distance ",
    celestialBody: "planet"
  },
  {
    id: "pl_period",
    unit: "days",
    label: "Planet period",
    celestialBody: "planet"
  },
  {
    id: "pl_semiMajorAxis",
    unit: "Astonomical Units",
    label: "Planet semi-major axis",
    celestialBody: "planet"
  },
  {
    id: "pl_inclination",
    unit: "degrees",
    label: "Planet inclination",
    celestialBody: "planet"
  },
  {
    id: "st_inner",
    unit: "Astonomical Units",
    label: "Star inner edge of habitable zone",
    celestialBody: "star"
  },
  {
    id: "st_outer",
    unit: "Astonomical Units",
    label: "Star outer edge of habitable zone",
    celestialBody: "star"
  },
  {
    id: "st_mass",
    unit: "Solar Units",
    label: "Star mass",
    celestialBody: "star"
  },
  {
    id: "st_radius",
    unit: "Solar Units",
    label: "Star radius",
    celestialBody: "star"
  },
  {
    id: "st_luminosity",
    unit: "Solar Units",
    label: "Star luminosity",
    celestialBody: "star"
  },
  {
    id: "st_distanceToSun",
    unit: "parsec",
    label: "Star distance from Earth",
    celestialBody: "star"
  },
  {
    id: "st_Teff",
    unit: "Solar Units",
    label: "Star effective temperature",
    celestialBody: "star"
  },
  {
    id: "st_age",
    unit: "Billion years",
    label: "Star age",
    celestialBody: "star"
  }
];
// create a synth and connect it to the master output (speakers)
const SYNTH = new Tone.Synth().toMaster();
const LOWEST_TONE = 16; // A3
const HIGHEST_TONE = 76; // A7
// default BPM = 80
const NOTE_DURATION = "8n"; // an eigth of a note (also available: fraction of a measure "1m" and time values "2s")
const PLAYBACK_RATE = 15;

export class Histogram extends React.Component {
  constructor() {
    super();
    Tone.Transport.schedule(this.triggerDataMelody, 0);
    Tone.Transport.loopEnd = "5";
    Tone.Transport.loop = true;

    this.state = {
      indicator: "st_distanceToSun",
      isPlaying: false,
      focusedBar: 30
    };
  }

  updateIndicator = e => {
    this.setState({ indicator: e.currentTarget.value });
  };

  updateDataMelody = (bins, maxBin, focus) => {
    const toneScale = scaleLinear()
      .domain([0, maxBin])
      .range([LOWEST_TONE, HIGHEST_TONE]); // A3 to A7

    const dataMelody = bins.map((bin, i) => {
      return {
        time: i + 1,
        note: Tone.Frequency("A1")
          .transpose(toneScale(bin.length))
          .toFrequency(),
        velocity: 0.5
      };
    });
    return dataMelody;
  };

  triggerDataMelody = () => {
    const { indicator } = this.state;
    const maxValue = max(planets, d => d[indicator]);
    const minValue = min(planets, d => d[indicator]);

    const indicatorScale = scaleLinear()
      .domain([minValue, maxValue])
      .range([0, CHART_WIDTH]);

    const bins = histogram()
      .domain(indicatorScale.domain())
      .thresholds(indicatorScale.ticks(TARGET_NB_BINS))
      .value(d => d[indicator])(planets);
    const maxBin = max(bins, d => d.length);

    // Get Data Melody notes
    const dataMelody = this.updateDataMelody(
      bins,
      maxBin,
      this.state.focusedBar
    );

    // Create Data Melody
    let part = new Tone.Part((time, value) => {
      //the value is an object which contains both the note and the velocity
      SYNTH.triggerAttackRelease(value.note, 0.1, time, value.velocity);
      console.log(time);
    }, dataMelody);

    part.playbackRate = PLAYBACK_RATE;

    // Start Data melody
    part.start(0);
  };

  playDataPattern = () => {
    if (!this.state.isPlaying) {
      this.setState({ isPlaying: true });
      Tone.Transport.start("+0.05"); // a very little delay
      // Move focus to currently played bar
    } else {
      this.setState({ isPlaying: false });
      Tone.Transport.stop();
    }
  };

  playSound = () => {};

  handleDataPointClick = () => {
    this.playSound();
  };

  render() {
    const { indicator } = this.state;

    // Data
    const planetsNb = planets.length;
    const maxValue = max(planets, d => d[indicator]);
    const minValue = min(planets, d => d[indicator]);

    const indicatorScale = scaleLinear()
      .domain([minValue, maxValue])
      .range([0, CHART_WIDTH]);

    const bins = histogram()
      .domain(indicatorScale.domain())
      .thresholds(indicatorScale.ticks(TARGET_NB_BINS))
      .value(d => d[indicator])(planets);
    const minBin = min(bins, d => d.length);
    const maxBin = max(bins, d => d.length);
    const binScale = scaleLinear()
      .domain([minBin, maxBin])
      .range([CHART_HEIGHT, 0])
      .nice();

    const binsNb = indicatorScale.ticks(TARGET_NB_BINS).length;

    return (
      <div>
        <Chart
          bins={bins}
          indicatorScale={indicatorScale}
          binScale={binScale}
          binsNb={binsNb}
          planetsNb={planetsNb}
          valueExtent={[minValue, maxValue]}
          data={planets}
          indicator={indicator}
          indicators={INDICATORS}
          onDataPointClick={this.handleDataPointClick}
        />
        <Controls
          selected={indicator}
          indicators={INDICATORS}
          onIndicatorChange={this.updateIndicator}
          isPlaying={this.state.isPlaying}
          onDataMelodyPlay={this.playDataPattern}
        />
      </div>
    );
  }
}

class Controls extends React.Component {
  render() {
    const { selected, indicators, isPlaying } = this.props;

    return (
      <div>
        <select
          onChange={this.props.onIndicatorChange}
          onBlur={this.props.onIndicatorChange}
        >
          {indicators.map(indicator => (
            <option value={indicator.id} selected={indicator.id === selected}>
              {indicator.label}
            </option>
          ))}
        </select>
        <button onClick={this.props.onDataMelodyPlay}>
          {isPlaying ? "STOP data pattern" : "PLAY data pattern"}
        </button>
      </div>
    );
  }
}

/** Component */
class Chart extends React.Component {
  constructor() {
    super();
    this.axisX = React.createRef();
    this.axisY = React.createRef();
    this.data = React.createRef();
    // this.dataGroup = React.createRef();
    Tone.Transport.schedule(this.triggerDataMelody, 0);
    // Tone.Transport.loopEnd = MELODY.length;
    Tone.Transport.loop = true;

    this.state = {
      focusedBar: -1,
      withinNavigation: false,
      displayHint: false,
      isPlaying: false
    };
  }

  createAxisX = scale => {
    const g = select(this.axisX.current);
    g.call(axisBottom(scale).tickSize(-CHART_HEIGHT));
  };

  createAxisY = scale => {
    const g = select(this.axisY.current);
    g.call(axisLeft(scale).tickSize(-CHART_WIDTH));
  };

  // moveFocusToDataGroup = e => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   this.setState({ areBarsFocusable: false, displayHint: true });
  //   this.dataGroup.current.focus();
  // };

  moveFocusToNextDataPoint = e => {
    const { bins, binsNb } = this.props;
    e.preventDefault(); // This prevent VoiceOver from moving focus to the next text element
    if (e.key === "ArrowRight") {
      this.setState(
        {
          focusedBar:
            this.state.focusedBar === binsNb - 1
              ? 0
              : this.state.focusedBar + 1,
          withinNavigation: true
        },
        this.focusRectangle,
        this.playSound(bins[this.state.focusedBar + 1].length)
      );
    } else {
      // if (e.key === "ArrowLeft")
      this.setState(
        {
          focusedBar:
            this.state.focusedBar === 0 || this.state.focusedBar === -1
              ? binsNb - 1
              : this.state.focusedBar - 1,
          withinNavigation: true
        },
        this.focusRectangle
      );
    }
    // FIXME: add a key press to access statistics values.
  };

  displayHint = index => {
    this.setState({ displayHint: true, focusedBar: index });
  };

  hideHint = () => {
    this.setState({ displayHint: false });
  };

  componentDidUpdate() {
    const { indicatorScale, binScale } = this.props;
    this.createAxisX(indicatorScale);
    this.createAxisY(binScale);
  }

  focusRectangle = () => {
    this.data.current.focus();
    // You need to move focus for VoiceOver to actually read the new element, updating "aria-activedesendant" is not enough
  };

  // playSound = count => {
  //   // FIXME: if value =0, play a completely different sound.
  //   const note = Tone.Frequency("A1").transpose(toneScale(count));
  //   SYNTH.triggerAttackRelease(note, "16n");
  // };

  // stopPropagation = e => {
  //   e.stopPropagation();
  //   e.preventDefault();
  // };

  // handleBarClick = (index, count) => {
  //   this.setState({
  //     focusedBar: index,
  //     areBarsFocusable: true,
  //     displayHint: false
  //   });
  //   this.playSound(count);
  // };

  // handleDataGroupFocus = () => {
  //   this.setState({ displayHint: true });
  // };

  // handleDataGroupBlur = () => {
  //   this.setState({ displayHint: false });
  // };

  render() {
    const {
      bins,
      indicatorScale,
      binScale,
      binsNb,
      planetsNb,
      valueExtent,
      indicator,
      indicators
    } = this.props;
    // const { data, indicator, indicators } = this.props;

    const indicatorInfos = indicators.find(d => d.id === indicator);

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
            className="histogram-x-axis-label"
            id="histogram-x-axis-label"
            x={W}
            y={H - 6}
            tabIndex={-1}
          >
            {`→ ${indicatorInfos.label} (${indicatorInfos.unit})`}
          </text>
          <g
            className="histogram-data"
            // ref={this.dataGroup}
            transform={`translate(${MARGIN.LEFT}, ${MARGIN.TOP})`}
          >
            {bins.map((bin, i) => {
              return (
                <React.Fragment key={i}>
                  <rect
                    id={`histogram-bar-overlay-${i}`}
                    className="histogram-bar-overlay"
                    key={`histogram-bar-overlay-${i}`}
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
                    x={indicatorScale(bin.x0)}
                    y={0}
                    width={CHART_WIDTH / binsNb}
                    height={CHART_HEIGHT}
                  />
                  <rect
                    id={`histogram-bar-${i}`}
                    className="histogram-bar"
                    key={`histogram-bar-${i}`}
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
                    // aria-label={`${bin.length} planets between ${bin.x0} and ${
                    //   bin.x1
                    // } parsecs`}
                    aria-labelledby={`histogram-tooltip-${i}`} // This tells screen readers where to find the tooltip for this data point.
                    x={indicatorScale(bin.x0)}
                    y={binScale(bin.length)}
                    width={CHART_WIDTH / binsNb - 2}
                    height={CHART_HEIGHT - binScale(bin.length)}
                  />
                </React.Fragment>
              );
            })}
          </g>
        </svg>
        <figcaption id="histogram-title" className="histogram-title">
          Distribution of confirmed exoplanets by their distance to the Sun
        </figcaption>
        <div
          id="histogram-description"
          className="histogram-description"
          style={{ display: "none" }}
        >
          {`Histogram of ${planetsNb} planets. The horizontal axis is a linear scale of distance to the Sun from 0 to ${
            valueExtent[1]
          } parsecs. The vertical axis is a count of planets in each bin. Use left and right arrows to access single data points, press tab to exit`}
        </div>
        {bins.map((bin, i) => {
          return (
            <div
              className="histogram-tooltip"
              role="tooltip" // This is to make sure the tooltip is read by aria-labelledby on rect. cf. https://inclusive-components.design/tooltips-toggletips/
              id={`histogram-tooltip-${i}`}
              key={`histogram-tooltip-${i}`}
              style={{
                transform: `translate(${MARGIN.LEFT +
                  indicatorScale(bin.x0)}px, ${MARGIN.TOP +
                  binScale(bin.length)}px)`,
                display:
                  this.state.displayHint && i === this.state.focusedBar
                    ? "block"
                    : "none"
              }}
            >
              <div className="histogram-tooltip-item">
                {bin.length} {indicatorInfos.celestialBody}
                {bin.length > 1 ? "s" : ""} between <br />
                {bin.x0} and {bin.x1} {indicatorInfos.unit}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}
