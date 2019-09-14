import React, { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { Box, Link, Text } from "rebass";
import { browser } from "webextension-polyfill-ts";
import { Message } from "../../shared/Message";
import { TimeDistance } from "../../shared/components/TimeDistance";
import { FeedHeader } from "./FeedHeader";

type props = RouteComponentProps<{ id: string }>;

export const Feed: React.FC<props> = ({ match, history }) => {
  const { id } = match.params;
  const [feed, setFeed] = useState();

  useEffect(() => {
    const message: Message = { type: "GET_FEED_ITEM", payload: { id } };
    browser.runtime.sendMessage(message).then(e => setFeed(e));
  }, [id]);

  return (
    <Box width={360}>
      {feed &&
      (
        <>
          <FeedHeader id={id} title={feed.title} />
          <Box mx={2}>
            {feed.items.map(item => (
              <Box key={item.link} my={2}>
                <Link label={item.content} href={item.link} target="_blank">
                  <Text color={"primary"} fontSize={"smaller"}>{item.title}</Text>
                </Link>

                <TimeDistance color={"#555"} fontSize={"smaller"}
                              startDate={new Date(item.isoDate)}
                              endDate={new Date()} />
              </Box>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};
