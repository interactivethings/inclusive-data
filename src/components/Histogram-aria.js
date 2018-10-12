import { histogram, max, min } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import * as React from 'react';
import planets from '../data/tidy/planets.json';
import './Histogram.css';

/** Constants */
const W = 800;
const H = 600;
const MARGIN = { TOP: 50, RIGHT: 50, BOTTOM: 50, LEFT: 50 };
const CHART_WIDTH = W - MARGIN.LEFT - MARGIN.RIGHT;
const CHART_HEIGHT = H - MARGIN.TOP - MARGIN.BOTTOM;
const TARGET_NB_BINS = 50;

const MAX_DISTANCE = max(planets.filter((d) => d.st_dist < 2000), (d) => d.st_dist);
const FILTERED_PLANETS = planets.filter((d) => d.st_dist < MAX_DISTANCE);
const NB_PLANETS = FILTERED_PLANETS.length;
const DISTANCE_SCALE = scaleLinear().domain([ 0, MAX_DISTANCE ]).range([ 0, CHART_WIDTH ]);

const BINS = histogram()
	.domain(DISTANCE_SCALE.domain())
	.thresholds(DISTANCE_SCALE.ticks(TARGET_NB_BINS))
	.value((d) => d.st_dist)(FILTERED_PLANETS);

const NB_BINS = DISTANCE_SCALE.ticks(TARGET_NB_BINS).length;

const MIN_COUNT = min(BINS, (d) => d.length);
const MAX_COUNT = max(BINS, (d) => d.length);

const COUNT_SCALE = scaleLinear().domain([ MIN_COUNT, MAX_COUNT ]).range([ CHART_HEIGHT, 0 ]).nice();

/** Component */
export class Histogram extends React.Component {
	constructor() {
		super();
		this.axisX = React.createRef();
		this.axisY = React.createRef();
		this.data = React.createRef();
		this.state = {
			focusedBar: -1,
			withinNavigation: false,
			displayHint: false
		};
	}

	createAxisX = (scale) => {
		const g = select(this.axisX.current);
		g.call(axisBottom(scale).tickSize(-CHART_HEIGHT));
	};

	createAxisY = (scale) => {
		const g = select(this.axisY.current);
		g.call(axisLeft(scale).tickSize(-CHART_WIDTH));
	};

	moveFocusToNextDataPoint = (e) => {
		e.preventDefault(); // This prevent VoiceOver from moving focus to the next text element
		if (e.key === 'ArrowRight') {
			this.setState(
				{
					focusedBar: this.state.focusedBar === NB_BINS - 1 ? 0 : this.state.focusedBar + 1,
					withinNavigation: true
				},
				this.focusRectangle
			);
		} else {
			// if (e.key === "ArrowLeft")
			this.setState(
				{
					focusedBar:
						this.state.focusedBar === 0 || this.state.focusedBar === -1
							? NB_BINS - 1
							: this.state.focusedBar - 1,
					withinNavigation: true
				},
				this.focusRectangle
			);
		}
		// FIXME: add a key press to access statistics values.
	};

	displayHint = (index) => {
		this.setState({ displayHint: true, focusedBar: index });
	};

	hideHint = () => {
		this.setState({ displayHint: false });
	};

	componentDidMount() {
		this.createAxisX(DISTANCE_SCALE);
		this.createAxisY(COUNT_SCALE);
	}

	focusRectangle = () => {
		// For VoiceOver to actually read the new element,
		// focus has to be explicitly moved,
		// updating "aria-activedesendant" is not enough
		this.data.current.focus();
	};
	render() {
		return (
			<div className="histogram-container">
				<svg
					className="histogram-svg"
					width={W}
					height={H}
					tabIndex={0} // Make the element focusable (accessible through tabbing), and thus actionable
					role="application" // Tell screen readers that this is an interactive element
					aria-roledescription="data visualization" // Give a more meaningful role description
					aria-labelledby="histogram-title" // Link to the id of the div with title
					aria-describedby="histogram-description" // Link to hidden description of the application, with instructions
					aria-activedescendant={
						// Used to move aria focus to elements within the application, updates on user interaction
						this.state.withinNavigation ? `histogram-bar-${this.state.focusedBar}` : null
					}
					onKeyDown={(e) =>
						e.key === 'ArrowLeft' || e.key === 'ArrowRight' ? this.moveFocusToNextDataPoint(e) : null}
				>
					<g
						className="histogram-axis"
						transform={`translate(${MARGIN.LEFT}, ${CHART_HEIGHT + MARGIN.TOP})`}
						ref={this.axisX}
						tabIndex={-1}
						aria-hidden={true}
					/>
					<g
						className="histogram-axis"
						transform={`translate(${MARGIN.LEFT}, ${MARGIN.TOP})`}
						ref={this.axisY}
						tabIndex={-1}
						aria-hidden={true}
					/>
					<text
						className="histogram-x-axis-label"
						id="histogram-x-axis-label"
						x={W}
						y={H - 6}
						tabIndex={-1}
						aria-hidden={true}
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
								<React.Fragment key={i}>
									<rect
										id={`histogram-bar-overlay-${i}`}
										className="histogram-bar-overlay"
										key={`histogram-bar-overlay-${i}`}
										onMouseOver={() => this.displayHint(i)}
										onFocus={() => this.displayHint(i)}
										onMouseOut={() => this.hideHint()}
										onBlur={() => this.hideHint()}
										onKeyDown={(e) =>
											e.key === 'ArrowLeft' || e.key === 'ArrowRight'
												? this.moveFocusToNextDataPoint(e)
												: null}
										aria-label={`${bin.length} planets between ${bin.x0} and ${bin.x1} parsecs`}
										x={DISTANCE_SCALE(bin.x0)}
										y={0}
										width={CHART_WIDTH / NB_BINS}
										height={CHART_HEIGHT}
									/>
									<rect
										id={`histogram-bar-${i}`}
										className="histogram-bar"
										key={`histogram-bar-${i}`}
										ref={i === this.state.focusedBar && this.data} // We need a React ref to update focus
										tabIndex={-1} // this element can receive focus programatically, not in the tab sequence.
										onMouseOver={() => this.displayHint(i)}
										onFocus={() => this.displayHint(i)}
										onMouseOut={() => this.hideHint()}
										onBlur={() => this.hideHint()}
										onKeyDown={(e) =>
											e.key === 'ArrowLeft' || e.key === 'ArrowRight'
												? this.moveFocusToNextDataPoint(e)
												: null}
										aria-labelledby={`histogram-tooltip-${i}`} // Tell screen readers where to find the tooltip for this data point.
										x={DISTANCE_SCALE(bin.x0)}
										y={COUNT_SCALE(bin.length)}
										width={CHART_WIDTH / NB_BINS - 2}
										height={CHART_HEIGHT - COUNT_SCALE(bin.length)}
									/>
								</React.Fragment>
							);
						})}
					</g>
				</svg>
				<figcaption id="histogram-title" className="histogram-title">
					Distribution of confirmed exoplanets by their distance to the Sun
				</figcaption>
				<div id="histogram-description" className="histogram-description" style={{ display: 'none' }}>
					{`Histogram of ${NB_PLANETS} planets. The horizontal axis is a linear scale of distance to the Sun from 0 to ${MAX_DISTANCE} parsecs. The vertical axis is a count of planets in each bin. Use left and right arrows to access single data points, press tab to exit`}
				</div>
				{BINS.map((bin, i) => {
					return (
						<div
							className="histogram-tooltip"
							role="tooltip" // This is to make sure the tooltip is read by aria-labelledby on rect. cf. https://inclusive-components.design/tooltips-toggletips/
							id={`histogram-tooltip-${i}`}
							key={`histogram-tooltip-${i}`}
							style={{
								transform: `translate(${MARGIN.LEFT + DISTANCE_SCALE(bin.x0)}px, ${MARGIN.TOP +
									COUNT_SCALE(bin.length)}px)`,
								display: this.state.displayHint && i === this.state.focusedBar ? 'block' : 'none'
							}}
						>
							<div className="histogram-tooltip-item">
								{bin.length} planets between <br />
								{bin.x0} and {bin.x1} parsecs
							</div>
						</div>
					);
				})}
			</div>
		);
	}
}
