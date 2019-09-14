import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Flex, Text } from "rebass";

type Props = { id: string, url: string, title: string; unread: number };

const UnreadCounter: React.FC<{ value: number }> = ({ value }) => (
  <Text style={{ borderRadius: "5px" }} alignSelf={"flex-end"} color={"white"}
        bg={"secondary"} p={1}>
    {value > 100 ? "100+" : value}
  </Text>
);

export const FeedListItem: React.FC<Props> = ({ id, title, unread }) => (
  <RouterLink style={{ textDecoration: "none", width: "100%" }} to={`/feed/${id}`}>
    <Flex width={1} justifyContent={"space-between"}>
      <Text fontSize={"large"} m={"auto"} flex={"auto"} color="primary">{title}</Text>
      {unread ? <UnreadCounter value={unread} /> : null}
    </Flex>
  </RouterLink>
);
