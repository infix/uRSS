import { browser } from "webextension-polyfill-ts";
import { Message } from "../shared/Message";
import localForage from "localforage";
import nanoid from "nanoid";

localForage.config({
  driver: localForage.LOCALSTORAGE,
  name: "uRSS",
  version: 1,
});

browser.runtime.onInstalled.addListener(async details => {
  console.log(details);
  if (details.reason == "install") {
    await localForage.setItem("feedList", []);
  }
});

browser.runtime.onMessage.addListener(async (message: Message) => {
  switch (message.type) {
    case "GET_FEED_LIST": {
      const feedList = await localForage.getItem("feedList");
      console.log(feedList);
      return feedList;
    }
    case "ADD_FEED_ITEM": {
      const { url } = message.payload;
      const feedList: any = await localForage.getItem("feedList");
      const newItem = { id: nanoid(), url };
      await localForage.setItem("feedList", [...feedList, newItem]);
      return newItem;
    }
    case "REMOVE_FEED_ITEM": {
      const { id } = message.payload;
      const feedList: any = await localForage.getItem("feedList");
      const newFeedList = feedList.filter(item => item.id != id);
      return await localForage.setItem("feedList", newFeedList);
    }
    default:
      return;
  }
});

