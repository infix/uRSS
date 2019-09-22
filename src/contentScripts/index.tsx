import { browser } from "webextension-polyfill-ts";
import React from "react";
import { render } from "react-dom";
import { Subscription } from "./subscription";

export const RENDER_SUBSCRIPTION_FEED = "RENDER_SUBSCRIPTION_FEED";

browser.runtime.onMessage.addListener(async message => {
  if (message.type == RENDER_SUBSCRIPTION_FEED) {
    const root = document.createElement("div");
    root.id = "#app";

    // @ts-ignore
    [...document.body.children].forEach(child => child.remove());

    document.body.appendChild(root);
    render(<Subscription {...message.payload.feed} />, root);
  }
});
