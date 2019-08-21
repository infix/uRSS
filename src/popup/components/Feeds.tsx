import React, { useEffect, useState } from "react";
import { Message } from "../../shared/Message";
import { browser } from "webextension-polyfill-ts";
import { Box, Button, Text } from "rebass";
import { Input } from "@rebass/forms";
import { FeedList } from "./FeedList";

export const Feeds = () => {
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
    <Box width={360}>
      <Text fontSize={4} py={2} color="secondary" textAlign={"center"}>popup</Text>
      <FeedList items={feed} />
      <Input value={url} onChange={e => setUrl(e.target.value)} />
      <Button width={1} bg="secondary" onClick={submitUrl}>add feed</Button>
    </Box>
  );
};
