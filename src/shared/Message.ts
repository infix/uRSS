type GET_FEED_LIST = "GET_FEED_LIST";
type ADD_FEED_ITEM = "ADD_FEED_ITEM";
type REMOVE_FEED_ITEM = "REMOVE_FEED_ITEM";
type GET_FEED_ITEM = "GET_FEED_ITEM";

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

export type Message =
  | GetFeedList
  | AddFeedItem
  | RemoveFeedItem
  | GetFeedItem
