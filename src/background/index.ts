import { browser } from "webextension-polyfill-ts";

browser.runtime.onInstalled.addListener(details => {
  console.log(details);
});

browser.runtime.onMessage.addListener(async (message, sender) => {
  console.log({ message, sender });
  return [1, 2, 3, 4];
});

