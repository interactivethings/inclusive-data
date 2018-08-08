import * as React from "react";
import "./App.css";
import { Streamgraph } from "./components/Streamgraph";
import { Scatterplot } from "./components/Scatterplot";

export class App extends React.Component {
  render() {
    return (
      <div className="wrapper">
        <h1>Inclusive Data Visualization</h1>
        <h2>How many planets?</h2>
        <Streamgraph />
        <h2>What type of planet for what type of discovery method?</h2>
        <Scatterplot />
      </div>
    );
  }
}
