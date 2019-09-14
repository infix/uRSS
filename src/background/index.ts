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
      return await localForage.getItem("feedList");
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
    case "UPDATE_FEED_ITEM": {
      const { id, data } = message.payload;
      const feedList: any[] = await localForage.getItem("feedList");
      const index = feedList.findIndex(feed => feed.id == id);
      console.log({ index, feed: feedList[index], data });
      feedList[index] = { ...feedList[index], ...data };
      return await localForage.setItem("feedList", feedList);
    }
    case "SORT_FEED_LIST": {
      // create a dictionary that holds the mapping between id, and index
      const order = message.payload.order
        .reduce((ids, currId, index) => {
          ids[currId] = index;
          return ids;
        }, {});

      // Nothing to do.
      if (Object.keys(order).length == 0)
        return;

      const feedList: any[] = await localForage.getItem("feedList");
      const sortedFeedList = feedList
        .sort((a, b) => order[a.id] - order[b.id]);

      return await localForage.setItem("feedList", sortedFeedList);
    }
    default:
      return;
  }
});

const notificationsMap = new Map<string, string>();

function getNewItems(oldArr: Parser.Item[], newArr: Parser.Item[]) {
  const arrToDict = arr => arr.reduce((acc, cur) => {
    acc[cur.id] = cur;
    return acc;
  }, {});

  const oldDict = arrToDict(oldArr);
  const newDict = arrToDict(newArr);

  return Object.keys(newDict).filter(id => !oldDict[id])
    .map(id => newDict[id]);
}

function notifyNewItems(items: Parser.Item[]) {
  items.forEach(async ({ title, link }) => {
    const iconUrl = `https://s2.googleusercontent.com/s2/favicons?domain=${link}`;

    const notificationId = await browser.notifications.create({
      title: "uRSS",
      type: "basic",
      message: title,
      contextMessage: "uRSS",
      iconUrl,
    });

    notificationsMap.set(notificationId, link);
  });
}

browser.notifications.onClicked.addListener(async (id) => {
  await browser.tabs.create({ url: notificationsMap.get(id) });
  await browser.notifications.clear(id);
  notificationsMap.delete(id);
});

browser.notifications.onClosed.addListener((id) => {
  notificationsMap.delete(id);
});

const periodInMinutes = process.env.NODE_ENV == "production" ? 1 : 0.1;

browser.alarms.create("CHECK_UPDATES", { periodInMinutes });

browser.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name == "CHECK_UPDATES") {
    const feedList: any = await localForage.getItem("feedList");
    const updatedFeedList = feedList.map(async feed => {
      const { items } = await parser.parseURL(feed.url);
      const newItems = getNewItems(feed.items, items);
      notifyNewItems(newItems);
      feed.items = [...newItems, ...feed.items];
      return feed;
    });

    await localForage.setItem("feedList", await Promise.all(updatedFeedList));
  }
});

