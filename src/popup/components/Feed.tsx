import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { Box, Text } from "rebass";

type props = RouteComponentProps<{ id: string }>;
export const Feed: React.FC<props> = ({ match }) => {
  return (
    <Box width={360}>
      <Text>{match.params.id}</Text>
    </Box>
  );
};
