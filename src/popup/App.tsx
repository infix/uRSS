import React, { useEffect, useState } from "react";
import { browser } from "webextension-polyfill-ts";
import { Message } from "../shared/Message";

export const App = () => {
  const [feed, setFeed] = useState([]);
  const [url, setUrl] = useState("");

  useEffect(() => {
    const message: Message = { type: "GET_FEED_LIST" };
    browser.runtime.sendMessage(message).then(e => {
      console.log(e);
      setFeed(e);
    });
  }, []);

  const submitUrl = () => {
    const message: Message = { type: "ADD_FEED_ITEM", payload: { url } };
    browser.runtime.sendMessage(message).then(e => {
      setUrl("");
      setFeed([...feed, e]);
    });
  };

  return (
    <>
      <div>popup</div>
      {feed.map(item => <div key={item.id}>{item.url}</div>)}
      <input value={url} onChange={e => setUrl(e.target.value)} />
      <button onClick={submitUrl}>add feed</button>
    </>
  );
};
