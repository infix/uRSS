import React, { useEffect, useState } from "react";
import { browser } from "webextension-polyfill-ts";
import { Message } from "../shared/Message";
import { GlobalStyle } from "../shared/GlobalStyle";
import theme from "@rebass/preset";
import { Box, Button, Text } from "rebass";
import { Input } from "@rebass/forms";
import { ThemeProvider } from "emotion-theming";
import { Global } from "@emotion/core";

export const App = () => {
  const [feed, setFeed] = useState([]);
  const [url, setUrl] = useState("");

  useEffect(() => {
    const message: Message = { type: "GET_FEED_LIST" };
    browser.runtime.sendMessage(message).then(e => {
      console.log(e);
      setFeed(e);
    });
  }, []);

  const submitUrl = () => {
    const message: Message = { type: "ADD_FEED_ITEM", payload: { url } };
    browser.runtime.sendMessage(message).then(e => {
      setUrl("");
      setFeed([...feed, e]);
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <Global styles={GlobalStyle} />
      <Box width={360}>
        <Text fontSize={4} color="secondary" textAlign={"center"}>popup</Text>
        <Box style={{ maxHeight: 420, overflowY: "scroll" }}>
          {feed.map(item => (
            <Box my={1} key={item.id}>
              <Text mx={1} color="primary">{item.url}</Text>
            </Box>
          ))}
        </Box>
        <Input borderRadius={0} value={url} onChange={e => setUrl(e.target.value)} />
        <Button borderRadius={0} width={1} bg="secondary" onClick={submitUrl}>add feed</Button>
      </Box>
    </ThemeProvider>
  );
};
