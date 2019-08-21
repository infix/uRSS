import React, { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { Box, Text } from "rebass";
import { browser } from "webextension-polyfill-ts";
import { Message } from "../../shared/Message";

type props = RouteComponentProps<{ id: string }>;
export const Feed: React.FC<props> = ({ match }) => {
  const { id } = match.params;
  const [feed, setFeed] = useState();

  useEffect(() => {
    const message: Message = { type: "GET_FEED_ITEM", payload: { id } };
    browser.runtime.sendMessage(message).then(e => setFeed(e));
  }, [id]);

  return (
    <Box width={360}>
      <Text>{JSON.stringify(feed, null, 2)}</Text>
      <Text>{id}</Text>
    </Box>
  );
};
