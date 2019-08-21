import { Box } from "rebass";
import { FeedListItem } from "./FeedListItem";
import React from "react";

type props = {
  items: Array<{ id: string, url: string }>
};

export const FeedList: React.FC<props> = ({ items }) => (
  <Box style={{ maxHeight: 420, overflowY: "scroll" }}>
    {items.map(item => <FeedListItem key={item.id} {...item} />)}
  </Box>
);
