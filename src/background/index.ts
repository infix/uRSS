import { browser, BrowserAction } from "webextension-polyfill-ts";
import localForage from "localforage";
import Parser from "rss-parser";
import { messageHandler } from "./messageHandler";
import differenceInMinutes from "date-fns/differenceInMinutes";
import ColorValue = BrowserAction.ColorValue;

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
    acc[cur.link] = cur;
    return acc;
  }, {});

  const oldDict = arrToDict(oldArr);
  const newDict = arrToDict(newArr);

  return Object.keys(newDict).filter(link => !oldDict[link])
    .map(id => newDict[id]);
}

type NotificationItem = Parser.Item & { fetchDate: Date };

function notifyNewItems(items: NotificationItem[], title: string) {
  items
    .filter(({ fetchDate }) => differenceInMinutes(fetchDate, new Date()) < 5)
    .forEach(async item => {
      const iconUrl = `https://s2.googleusercontent.com/s2/favicons?domain=${item.link}`;

      const notificationId = await browser.notifications.create({
        title,
        type: "basic",
        message: item.title,
        contextMessage: "uRSS",
        iconUrl,
      });
      notificationsMap.set(notificationId, item.link);
    });
}

browser.notifications.onClicked.addListener(async (id) => {
  // TODO update: add logic to remove unread status
  await browser.tabs.create({ url: notificationsMap.get(id) });
  await browser.notifications.clear(id);
  notificationsMap.delete(id);
});

browser.notifications.onClosed.addListener((id) => {
  notificationsMap.delete(id);
});

const periodInMinutes = process.env.NODE_ENV == "production" ? 1 : 0.1;

const notificationSound = new Audio(browser.runtime.getURL("../assets/notification.wav"));

browser.alarms.create("CHECK_UPDATES", { periodInMinutes });

/**
 * @name updateBadge
 * @description Sets the extension badge text depending on the number of
 *  unseen items.
 * @param value {number} That value that should be displayed
 * @param bg {ColorValue} The background color
 */
async function updateBadge(value: number, bg: ColorValue = "#000") {
  await browser.browserAction.setBadgeBackgroundColor({ color: bg });
  const text = value > 100 ? "∞" : value == 0 ? "" : value.toString();
  await browser.browserAction.setBadgeText({ text });
}

browser.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name == "CHECK_UPDATES") {
    const feedList: any = await localForage.getItem("feedList");
    let updated = false;
    const updatedFeedList = feedList.map(async feed => {
      const { items, title } = await parser.parseURL(feed.url);
      const newItems = getNewItems(feed.items, items);
      if (newItems.length) {
        updated = true;
      }
      notifyNewItems(newItems.map(item => ({ fetchDate: new Date(), ...item })), title);
      feed.items = [...newItems.map(i => ({ unread: true, ...i })), ...feed.items];
      feed.unread = feed.items.reduce((acc, cur) => cur.unread ? acc + 1 : acc, 0);
      return feed;
    });

    const newFeedList: any[] = await Promise.all(updatedFeedList);
    const totalUnread = newFeedList.reduce((acc, cur) => cur.unread ? acc + cur.unread : acc, 0);

    await updateBadge(totalUnread);
    if (updated) {
      await notificationSound.play();
    }
    await localForage.setItem("feedList", newFeedList);
  }
});

