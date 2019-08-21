import React, { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { Box, Flex, Link, Text } from "rebass";
import { browser } from "webextension-polyfill-ts";
import { Message } from "../../shared/Message";
import { Icon } from "../../shared/components/Icon";
import { TimeDistance } from "../../shared/components/TimeDistance";

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
          <Flex>
            <Box style={{ cursor: "pointer" }} onClick={() => history.push("/")} m={2}>
              <Icon>arrow_back</Icon>
            </Box>
            <Text fontSize={3} my={2} textAlign={"center"} color="secondary">{feed.title}</Text>
          </Flex>
          <Box mx={2}>
            {feed.items.map(item => (
              <Box key={item.id} my={2}>
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
