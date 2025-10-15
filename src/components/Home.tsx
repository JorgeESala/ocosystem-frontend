import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <h1>Dashboard Principal</h1>
      <nav>
        <ul>
          <li>
            <Link to="./Reports">Reports</Link>
          </li>
          <li>
            <Link to="/ComparisonGraphs">Comparisons</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
