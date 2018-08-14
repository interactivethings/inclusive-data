import { max, extent } from "d3-array";
import {
  scaleBand,
  scaleLinear,
  scaleOrdinal,
  scaleSqrt,
  scaleLog
} from "d3-scale";
import { line } from "d3-shape";
import { select } from "d3-selection";
import { polygonHull } from "d3-polygon";
import * as React from "react";
import planets from "../data/tidy/planets.json";
import { schemePastel1, schemeDark2 } from "d3-scale-chromatic";
import { axisLeft, axisBottom } from "d3-axis";
import "./Scatterplot.css";

const W = 1200;
const H = 600;
const MARGIN = { TOP: 50, RIGHT: 50, BOTTOM: 50, LEFT: 50 };
const CHART_WIDTH = W - MARGIN.LEFT - MARGIN.RIGHT;
const CHART_HEIGHT = H - MARGIN.TOP - MARGIN.BOTTOM;
const OFFSET = 8;

const MAX_RADIUS = 16;
const MAX_DISTANCE = 1.6;
const HABITABLE_ZONE = [0.725, 1.24];
const PLANET_TYPES = [
  { label: "Mini-Earth", lower_limit: 0, upper_limit: 0.5, range: 0.5 },
  { label: "Earth", lower_limit: 0.5, upper_limit: 1.5, range: 1 },
  { label: "Super-Earth", lower_limit: 1.5, upper_limit: 2, range: 0.5 },
  { label: "Mini-Neptune", lower_limit: 2, upper_limit: 4, range: 2 },
  { label: "Neptune", lower_limit: 4, upper_limit: 6, range: 2 },
  {
    label: "Jupiter",
    lower_limit: 6,
    upper_limit: MAX_RADIUS,
    range: MAX_RADIUS - 6
  }
];

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
const getPlanetType = n => {
  if (n < 0.5) {
    return PLANET_TYPES[0].label;
  } else if (n < 1.5) {
    return PLANET_TYPES[1].label;
  } else if (n < 2) {
    return PLANET_TYPES[2].label;
  } else if (n < 4) {
    return PLANET_TYPES[3].label;
  } else if (n < 6) {
    return PLANET_TYPES[4].label;
  } else {
    return PLANET_TYPES[5].label;
  }
};

const PLANETS = planets.map(d => ({
  type: d.pl_rade ? getPlanetType(d.pl_rade) : "Radius Unknown",
  ...d
}));
const KEPLER = PLANETS.filter(d => d.pl_kepflag === 1 || d.pl_k2flag === 1);

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
    g.call(axisBottom(scale));
  };
  createAxisY = scale => {
    const g = select(this.axisY.current);
    g.call(axisLeft(scale));
  };
  componentDidMount() {
    // const orbitalPeriodDomain = extent(planets, d => d.pl_orbper);
    // const orbitalPeriodScale = this.getLogScale(orbitalPeriodDomain, [
    //   0,
    //   CHART_WIDTH
    // ]);
    // const radiiExtent = extent(planets, d => d.pl_rade);
    // const planetRadiusScale = this.getLogScale(radiiExtent, [CHART_HEIGHT, 0]);
    const planetStartDistScale = this.getLinearScale(
      // extent(KEPLER, d => d.pl_orbsmax),
      [0, MAX_DISTANCE],
      [0, CHART_WIDTH]
    );

    const planetRadiusScale = this.getLinearScale([0, 15], [CHART_HEIGHT, 0]);

    this.createAxisX(planetStartDistScale);
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

    // const jmScale = this.getLinearScale(extent(planets, d => d.st_jmk2), [
    //   0,
    //   CHART_WIDTH
    // ]);
    // const hmScale = this.getLinearScale(extent(planets, d => d.st_hmk2), [
    //   CHART_HEIGHT,
    //   0
    // ]);
    // const opticalMagnitudeScale = this.getLinearScale(
    //   extent(planets, d => d.st_optmag),
    //   [CHART_HEIGHT, 0]
    // );
    // const colors = this.getColorScale(DISCOVERY_METHODS, schemeDark2);
    const planetTypeColors = this.getColorScale(
      PLANET_TYPES.map(d => d.label),
      schemeDark2
    );

    // const orbitalPeriodDomain = extent(planets, d => d.pl_orbper);
    // console.log("orbital period domain", orbitalPeriodDomain);
    // const orbitalPeriodScale = this.getLogScale(orbitalPeriodDomain, [
    //   0,
    //   CHART_WIDTH
    // ]);

    // const radiiExtent = extent(planets, d => d.pl_rade);
    // const radiusScale = this.getRadiusScale(radiiExtent, [2, 15]);
    // console.log("raddii domain", radiiExtent);
    const planetRadiusScale = this.getLinearScale([0, 15], [CHART_HEIGHT, 0]);

    const planetStartDistScale = this.getLinearScale(
      // extent(KEPLER, d => d.pl_orbsmax),
      [0, MAX_DISTANCE],
      [0, CHART_WIDTH]
    );

    const stellarTemperatureScale = this.getLinearScale(
      [2000, 7000],
      [CHART_HEIGHT, 0]
    );

    // const points = planets
    //   .filter(d => d.pl_discmethod === "Radial Velocity")
    //   .map(d => [jmScale(d.st_jmk2), opticalMagnitudeScale(d.st_optmag)]);
    // console.log("point", points);
    // const hull = polygonHull(points);
    // console.log("hull", hull);

    // const hullGenerator = line()
    //   .x(d => d[0])
    //   .y(d => d[1]);

    // Get centroid of polygon Hull (should in the middle of the points cloud?)
    // Draw circle with radius in proportion to standard deviation

    return (
      <svg
        className="scatterplot-svg"
        width={W}
        height={H}
        tabIndex={0}
        // aria-labelledby="#scatterplot-description"
      >
        <g
          transform={`translate(${MARGIN.LEFT}, ${CHART_HEIGHT + MARGIN.TOP})`}
          ref={this.axisX}
        />
        <text
          className="scatterplot-x-axis-label"
          id="scatterplot-x-axis-label"
          x={W}
          y={H}
        >
          → planet / star distance (AU)
        </text>
        <g
          transform={`translate(${MARGIN.LEFT}, ${MARGIN.TOP})`}
          ref={this.axisY}
        />
        <g
          transform={`translate(${MARGIN.LEFT}, ${MARGIN.TOP})`}
          className="scatterplot-planet-type-group"
        >
          {PLANET_TYPES.map(d => {
            return (
              <React.Fragment>
                <rect
                  className="scatterplot-planet-type-rectangle"
                  x={planetStartDistScale(0)}
                  width={planetStartDistScale(MAX_DISTANCE)}
                  y={planetRadiusScale(d.upper_limit)}
                  height={
                    planetRadiusScale(d.lower_limit) -
                    planetRadiusScale(d.upper_limit)
                  }
                  fill={planetTypeColors(d.label)}
                />
                <text
                  className="scatterplot-planet-type-label"
                  x={planetStartDistScale(MAX_DISTANCE) - OFFSET}
                  y={planetRadiusScale(d.upper_limit)}
                  dy={
                    (planetRadiusScale(d.lower_limit) -
                      planetRadiusScale(d.upper_limit)) /
                    2
                  }
                  fill={planetTypeColors(d.label)}
                >
                  {d.label}
                </text>
              </React.Fragment>
            );
          })}
        </g>
        <g
          transform={`translate(${MARGIN.LEFT}, ${MARGIN.TOP})`}
          className="scatterplot-habitable-zone-group"
        >
          <rect
            className="scatterplot-habitable-zone-rectangle"
            x={planetStartDistScale(HABITABLE_ZONE[0])}
            width={
              planetStartDistScale(HABITABLE_ZONE[1]) -
              planetStartDistScale(HABITABLE_ZONE[0])
            }
            y={planetRadiusScale(MAX_RADIUS)}
            height={CHART_HEIGHT}
          />
          <text
            className="scatterplot-habitable-zone-label"
            x={
              planetStartDistScale(HABITABLE_ZONE[0]) +
              (planetStartDistScale(HABITABLE_ZONE[1]) -
                planetStartDistScale(HABITABLE_ZONE[0])) /
                2
            }
            y={planetRadiusScale(MAX_RADIUS) + OFFSET}
          >
            {"Habitable Zone"}
          </text>
        </g>
        <g transform={`translate(${MARGIN.LEFT}, ${MARGIN.TOP})`}>
          {PLANETS.filter(
            d => d.pl_rade < MAX_RADIUS || d.pl_orbsmax < MAX_DISTANCE
          ).map(
            (d, i) =>
              d.pl_orbsmax &&
              d.st_teff &&
              d.pl_rade && (
                <circle
                  key={`scatterplot-dot-${i}`}
                  cx={planetStartDistScale(d.pl_orbsmax)}
                  cy={planetRadiusScale(d.pl_rade)}
                  r={2}
                  // fill={"crimson"}
                  // stroke={"crimson"}
                  // r={radiusScale(d.pl_rade)}
                  fill={planetTypeColors(d.type)}
                  // stroke={planetTypeColors(d.type)}
                  className="scatterplot-dot"
                  onMouseEnter={() =>
                    console.log(
                      `radus: ${d.pl_rade}, orbital period: ${
                        d.pl_orbper
                      }, discovery method: ${d.pl_discmethod},
                  planet NAME: ${d.pl_name}`
                    )
                  }
                />
              )
          )}
          <circle
            className="scatterplot-dot-earth"
            cx={planetStartDistScale(1)}
            // cy={stellarTemperatureScale(5778)}
            cy={planetRadiusScale(1)}
            r={2}
          />
          {/* <circle
            className="scatterplot-dot-earth-overlay"
            cx={planetStartDistScale(1)}
            cy={stellarTemperatureScale(5778)}
            r={planetRadiusScale(20)}
          /> */}
        </g>
        {/* <path d={hullGenerator(hull)} className="scatterplot-hull" /> */}
      </svg>
    );
  }
}
