import React, { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { Box, Link, Text } from "rebass";
import { browser } from "webextension-polyfill-ts";
import { Message } from "../../shared/Message";
import { TimeDistance } from "../../shared/components/TimeDistance";
import { FeedHeader } from "./FeedHeader";
import { AutoSizer, CellMeasurer, CellMeasurerCache, List } from "react-virtualized";
import styled from "@emotion/styled";

type props = RouteComponentProps<{ id: string }>;

// language=CSS
const ListWrapper = styled(Box)`
  .ReactVirtualized__Grid__innerScrollContainer {
    overflow: visible !important;
  }

  .ReactVirtualized__Table__row {
    overflow: visible !important;
  }
`;

export const Feed: React.FC<props> = ({ match, history }) => {
  const { id } = match.params;
  const [feed, setFeed] = useState();

  useEffect(() => {
    const message: Message = { type: "GET_FEED_ITEM", payload: { id } };
    browser.runtime.sendMessage(message).then(e => setFeed(e));
  }, [id]);

  const cache = new CellMeasurerCache({ fixedWidth: true });

  function renderRow({ index, key, style, parent }) {
    const { isoDate, content, title, link, unread } = feed.items[index];

    return (
      <CellMeasurer
        key={key}
        cache={cache}
        parent={parent}
        columnIndex={0}
        rowIndex={index}>
        <Box style={style} px={2} py={1} bg={unread ? "aliceblue" : "unset"}>
          <Link label={content} href={link} target="_blank">
            <Text color={"primary"} fontSize={"smaller"}>{title}</Text>
          </Link>

          <TimeDistance color={"#555"} fontSize={"smaller"}
                        startDate={new Date(isoDate)}
                        endDate={new Date()} />
        </Box>
      </CellMeasurer>
    );
  }

  return (
    <Box width={360}>
      {feed &&
      (
        <>
          <FeedHeader id={id} title={feed.title} />
          <ListWrapper height={480}>
            <AutoSizer>
              {({ height, width }) => {
                return (
                  <List
                    width={width}
                    rowRenderer={renderRow}
                    rowCount={feed.items.length}
                    deferredMeasurementCache={cache}
                    rowHeight={cache.rowHeight}
                    height={height}
                    overscanRowCount={10}
                  />
                );
              }}
            </AutoSizer>
          </ListWrapper>
        </>
      )}
    </Box>
  );
};
