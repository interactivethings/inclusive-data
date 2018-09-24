import React from "react";
import ReactDOM from "react-dom";
import { Catalog, pageLoader } from "catalog";

ReactDOM.render(
  <Catalog
    title=""
    pages={[
      {
        path: "/",
        title: "Introduction",
        content: pageLoader(() => import("./Introduction.docs"))
      },
      {
        path: "/histogram",
        title: "Histogram",
        pages: [
          {
            path: "/histogram/aria",
            title: "ARIA",
            content: pageLoader(() =>
              import("../src/components/Histogram-aria.docs")
            )
          },
          {
            path: "/histogram/sonified",
            title: "Sonified",
            content: pageLoader(() =>
              import("../src/components/Histogram-sonified.docs")
            )
          }
        ]
      }
    ]}
  />,
  document.getElementById("root")
);
