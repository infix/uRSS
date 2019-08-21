import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Text } from "rebass";

type props = { id: string, url: string };
export const FeedListItem: React.FC<props> = ({ id, url }) => (
  <RouterLink to={`/feed/${id}`}>
    <Text m={1} color="primary">{url}</Text>
  </RouterLink>
);
