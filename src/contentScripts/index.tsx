import { browser } from "webextension-polyfill-ts";
import { Subscription } from "./subscription";

export const RENDER_SUBSCRIPTION_FEED = "RENDER_SUBSCRIPTION_FEED";

browser.runtime.onMessage.addListener((message) => {
  if (message.type == RENDER_SUBSCRIPTION_FEED) {
    const root = document.createElement("div");
    root.id = "#app";

    // @ts-ignore
    [...document.body.children].forEach(child => child.remove());

    document.body.appendChild(root);
    return Promise.all([import("react"), import("react-dom")])
      .then(([React, ReactDOM]) => {
        ReactDOM.render(<Subscription {...message.payload.feed} />, root);
      });
  } else {
    return undefined;
  }
});
