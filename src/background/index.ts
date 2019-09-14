import { browser } from "webextension-polyfill-ts";
import localForage from "localforage";
import Parser from "rss-parser";
import { messageHandler } from "./messageHandler";

export const parser = new Parser();

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

browser.runtime.onMessage.addListener(messageHandler);

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

