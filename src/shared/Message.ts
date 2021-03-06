import Parser from "rss-parser";

type GET_FEED_LIST = "GET_FEED_LIST";
type ADD_FEED_ITEM = "ADD_FEED_ITEM";
type REMOVE_FEED_ITEM = "REMOVE_FEED_ITEM";
type GET_FEED_ITEM = "GET_FEED_ITEM";
type UPDATE_FEED_ITEM = "UPDATE_FEED_ITEM";
type SORT_FEED_LIST = "SORT_FEED_LIST";
type CLOSE_CURRENT_TAB = "CLOSE_CURRENT_TAB";

type GetFeedList = {
  type: GET_FEED_LIST
};

type AddFeedItem = {
  type: ADD_FEED_ITEM,
  payload: {
    url: string
  }
};

type RemoveFeedItem = {
  type: REMOVE_FEED_ITEM,
  payload: {
    id: number
  }
}

type GetFeedItem = {
  type: GET_FEED_ITEM,
  payload: {
    id: string
  }
}

type UpdateFeedItem = {
  type: UPDATE_FEED_ITEM,
  payload: {
    id: string;
    data: Partial<Parser.Output>
  };
}

type SortFeedList = {
  type: SORT_FEED_LIST,
  payload: {
    order: number[]
  }
}

type CloseCurrentTab = {
  type: CLOSE_CURRENT_TAB
}

export type Message =
  | GetFeedList
  | AddFeedItem
  | RemoveFeedItem
  | GetFeedItem
  | UpdateFeedItem
  | SortFeedList
  | CloseCurrentTab
