import React from "react";
import { Text, TextProps } from "rebass";
import formatDistance from "date-fns/formatDistance";

interface props extends TextProps {
  startDate: Date;
  endDate: Date;
}

export const TimeDistance: React.FC<props> = ({ startDate, endDate, ...props }) => (
  <Text {...props as any}>
    {formatDistance(startDate, endDate, { addSuffix: true })}
  </Text>
);
