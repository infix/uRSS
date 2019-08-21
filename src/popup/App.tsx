import React from "react";
import { GlobalStyle } from "../shared/GlobalStyle";
import theme from "@rebass/preset";
import { ThemeProvider } from "emotion-theming";
import { Global } from "@emotion/core";
import { MemoryRouter as Router, Route, Switch } from "react-router-dom";
import { Feeds } from "./components/Feeds";
import { Feed } from "./components/Feed";

export const App = () => (
  <Router>
    <ThemeProvider theme={theme}>
      <Switch>
        <Route exact path="/" component={Feeds} />
        <Route path="/feed/:id" component={Feed} />
      </Switch>
      <Global styles={GlobalStyle} />
    </ThemeProvider>
  </Router>
);
