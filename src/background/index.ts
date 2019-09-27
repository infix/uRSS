import { browser, BrowserAction, WebRequest } from "webextension-polyfill-ts";
import localForage from "localforage";
import Parser from "rss-parser";
import { messageHandler } from "./messageHandler";
import differenceInMinutes from "date-fns/differenceInMinutes";
import { RENDER_SUBSCRIPTION_FEED } from "../contentScripts";
import { sleep } from "./utils";
import ColorValue = BrowserAction.ColorValue;
import RequestFilter = WebRequest.RequestFilter;
import OnCompletedOptions = WebRequest.OnCompletedOptions;

export const parser = new Parser();

localForage.config({
  driver: localForage.INDEXEDDB,
  name: "uRSS",
  version: 1,
});

browser.runtime.onInstalled.addListener(async details => {
  console.log(details);
  if (details.reason == "install") {
    await localForage.setItem("feedList", []);
  } else if (details.reason == "update") {
    const feedList = await localForage.getItem("feedList");
    if (!feedList) {
      await localForage.setItem("feedList", []);
    }
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
      const { items, title } = await parser.parseURL(feed.url)
        .catch(e => {
          console.error(e);
          return Promise.resolve(feed);
        });

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

const filter: RequestFilter = { urls: [], types: ["main_frame"] };
const extraInfoSpec: OnCompletedOptions[] = ["responseHeaders"];
browser.webRequest.onCompleted.addListener(async details => {
  const feedHeaders = [
    "application/atom+xml",
    "application/rss+xml",
    "application/rdf+xml",
    "application/xml",
    "text/rss+xml",
    "text/xml",
  ];

  console.log({ details });

  const contentType = details.responseHeaders
    .find(h => h.name.toLowerCase() == "content-type");

  if (!contentType)
    return;

  const isFeed: boolean = feedHeaders.some(h => contentType.value.includes(h));

  if (!isFeed)
    return;

  const feed = await parser.parseURL(details.url).catch(() => null);

  if (!feed)
    return;

  const message = {
    type: RENDER_SUBSCRIPTION_FEED,
    payload: { feed: { ...feed, feedUrl: details.url } },
  };

  let tabs = await browser.tabs.query({ url: details.url });
  // Wait for tab to stop loading.
  while (tabs.length > 0 && tabs[0].status == "loading") {
    tabs = await browser.tabs.query({ url: details.url });
    await sleep(100);
  }

  // If tab still exist, and has an id then send a message to notify
  //  the Content script with the data
  if (tabs.length > 0 && tabs[0].id) {
    browser.tabs.sendMessage(tabs[0].id, message).then(console.log, console.error);
  }
}, filter, extraInfoSpec);
