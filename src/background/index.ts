import { browser } from "webextension-polyfill-ts";
import { Message } from "../shared/Message";
import localForage from "localforage";
import nanoid from "nanoid";
import Parser from "rss-parser";

const parser = new Parser();

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
      const { description, title, items, link } = await parser.parseURL(url);

      const newItem = {
        id: nanoid(), url, description, title, items, link,
      };
      await localForage.setItem("feedList", [...feedList, newItem]);
      return newItem;
    }
    case "REMOVE_FEED_ITEM": {
      const { id } = message.payload;
      const feedList: any = await localForage.getItem("feedList");
      const newFeedList = feedList.filter(item => item.id != id);
      return await localForage.setItem("feedList", newFeedList);
    }
    case "GET_FEED_ITEM": {
      const { id } = message.payload;
      const feedList: any = await localForage.getItem("feedList");
      return feedList.find(item => item.id == id);
    }
    default:
      return;
  }
});

