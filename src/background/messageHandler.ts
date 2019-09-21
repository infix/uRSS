import localForage from "localforage";
import nanoid from "nanoid";
import { parser } from "./index";
import { Message } from "../shared/Message";
import { browser } from "webextension-polyfill-ts";

async function getFeedList() {
  return await localForage.getItem("feedList");
}

async function addFeedItem(message) {
  const { url } = message.payload;
  const feedList: any = await localForage.getItem("feedList");
  const { description, title, items, link } = await parser.parseURL(url);

  const newItem = {
    id: nanoid(), url, description, title, link,
    items: items.map(i => ({ unread: true, ...i })),
  };

  await localForage.setItem("feedList", [...feedList, newItem]);
  return newItem;
}

async function removeFeedItem(message) {
  const { id } = message.payload;
  const feedList: any = await localForage.getItem("feedList");
  const newFeedList = feedList.filter(item => item.id != id);
  return await localForage.setItem("feedList", newFeedList);
}

async function getFeedItem(message) {
  const { id } = message.payload;
  const feedList: any = await localForage.getItem("feedList");
  return feedList.find(item => item.id == id);
}

async function updateFeedItem(message) {
  const { id, data } = message.payload;
  const feedList: any[] = await localForage.getItem("feedList");
  const index = feedList.findIndex(feed => feed.id == id);
  console.log({ index, feed: feedList[index], data });
  feedList[index] = { ...feedList[index], ...data };
  return await localForage.setItem("feedList", feedList);
}

async function sortFeedList(message) {
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

const closeCurrentTab = async (tabId) => {
  return browser.tabs.remove(tabId);
};

export const messageHandler = async (message: Message, sender) => {
  switch (message.type) {
    case "GET_FEED_LIST":
      return await getFeedList();
    case "ADD_FEED_ITEM":
      return await addFeedItem(message);
    case "REMOVE_FEED_ITEM":
      return await removeFeedItem(message);
    case "GET_FEED_ITEM":
      return await getFeedItem(message);
    case "UPDATE_FEED_ITEM":
      return await updateFeedItem(message);
    case "SORT_FEED_LIST":
      return await sortFeedList(message);
    case "CLOSE_CURRENT_TAB":
      return await closeCurrentTab(sender.tab.id);
  }
};
