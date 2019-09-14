import { Box, Flex, Text } from "rebass";
import { FeedListItem } from "./FeedListItem";
import { SortableContainer, SortableElement, SortableHandle } from "react-sortable-hoc";
import arrayMove from "array-move";
import React, { useEffect, useState } from "react";
import { Message } from "../../shared/Message";
import { browser } from "webextension-polyfill-ts";

type Props = {
  items: Array<{ title: string; id: string, url: string }>
};

const DragHandle = SortableHandle(() => (
  <Text px={1} textAlign={"center"} style={{ margin: "auto 0", cursor: "grab" }}
        fontSize={"large"}>
    ::
  </Text>
));

const SortableItem = SortableElement(({ item }) => (
  <Flex p={1} flexDirection={"row"}>
    <DragHandle />
    <FeedListItem {...item} />
  </Flex>
));

const Container = SortableContainer(({ children }) => (
  <Box py={1} style={{ maxHeight: 420, overflowY: "scroll" }}>
    {children}
  </Box>
));

export const FeedList: React.FC<Props> = (props) => {
  const [items, setItems] = useState([]);

  const onSortEnd = ({ oldIndex, newIndex }) =>
    setItems(arrayMove(items, oldIndex, newIndex));

  // update sort order on the background.js
  useEffect(() => {
    const message: Message = {
      type: "SORT_FEED_LIST",
      payload: { order: items.map(i => i.id) },
    };

    browser.runtime.sendMessage(message)
      .catch(e => console.error(e));
  }, [items]);

  // Update items if props.items changes
  useEffect(() => setItems(props.items), [props.items]);

  return (
    <Container onSortEnd={onSortEnd} useDragHandle>
      {items.map((item, index) => (
        <SortableItem key={item.id} index={index} item={item} />
      ))}
    </Container>
  );
};
