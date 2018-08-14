import * as React from "react";
import "./App.css";
import { Streamgraph } from "./components/Streamgraph";
import { Scatterplot } from "./components/Scatterplot";
import { Histogram } from "./components/Histogram";

export class App extends React.Component {
  render() {
    return (
      <div className="wrapper">
        <h1>How Does This Data Sound?</h1>
        <p>About Inclusive Data Visualization</p>
        <h2>Since when have astronomers been discovering planets?</h2>
        <p>
          An exoplanet or extrasolar planet is a planet outside our solar
          system. The first evidence of an exoplanet was noted as early as 1917,
          but was not recognized as such. However, the first scientific
          detection of an exoplanet was in 1988, although it was not accepted as
          an exoplanet until later. The first confirmed detection occurred in
          1992. As of 1 August 2018, there are 3,815 confirmed planets in 2,853
          systems, with 633 systems having more than one planet.
        </p>
        <p>
          About 97% of all the confirmed exoplanets have been discovered by
          indirect techniques of detection, mainly by radial velocity
          measurements and transit monitoring techniques.
        </p>
        <Streamgraph />
        <h2>How far away have astronomers seen exoplanets?</h2>
        <p>
          The parsec (symbol: pc) is a unit of length used to measure large
          distances to astronomical objects outside the Solar System. A parsec
          is defined as the distance at which one astronomical unit subtends an
          angle of one arcsecond, which corresponds to 648000 / π astronomical
          units. One parsec is equal to about 3.26 light-years (30 trillion km
          or 19 trillion miles) in length. The nearest star, Proxima Centauri,
          is about 1.3 parsecs (4.2 light-years) from the Sun. Most of the stars
          visible to the unaided eye in the night sky are within 500 parsecs of
          the Sun.
        </p>
        <p>
          Each bar emits a sound when focused, using an equal-temperament
          chromatic scale from A1 to A8, ie with 84 semitone intervals used as
          the range for the bin count domain [0, 472]
        </p>
        <Histogram />
        <h2>Planets discovered by Kepler by size and distance to their star</h2>
        <Scatterplot />
      </div>
    );
  }
}
