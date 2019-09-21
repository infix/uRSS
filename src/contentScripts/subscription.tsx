import React from "react";
import Parser from "rss-parser";
import { Box, Button, Card, Heading, Link, Text } from "rebass";
import { Global } from "@emotion/core";
import { GlobalStyle } from "../shared/GlobalStyle";
import { ThemeProvider } from "emotion-theming";
import theme from "@rebass/preset";
import { sanitize } from "dompurify";
import { Message } from "../shared/Message";
import { browser } from "webextension-polyfill-ts";

const SubscriptionFeedItem: React.FC<Parser.Item> = ({ title, link, isoDate, contentSnippet, content }) => (
  <Card my={1} p={2}>
    <Link py={1} href={link}>
      <Text title={title} fontSize={"large"} color={"primary"}>{title}</Text>
    </Link>
    <div style={{ fontSize: "small", padding: "auto 4px" }} dangerouslySetInnerHTML={{ __html: sanitize(content) }} />
  </Card>
);

const subscribe = async (url: string) => {
  const message: Message = { type: "ADD_FEED_ITEM", payload: { url } };
  return await browser.runtime.sendMessage(message);
};

const closeCurrentTab = async () => {
  return browser.runtime.sendMessage({ type: "CLOSE_CURRENT_TAB" } as Message);
};

export const Subscription: React.FC<Parser.Output> = ({ items, link, children, description, feedUrl, title }) => {
  return (
    <ThemeProvider theme={theme}>
      <Box width={1} bg={"aliceblue"}>
        <Card m={"0 auto"} bg={"white"} style={{ maxWidth: 1280, minHeight: "100vh" }}>
          <Heading style={{ textTransform: "capitalize" }} color={"secondary"} fontSize={5} py={1}
                   textAlign={"center"}>{title}</Heading>
          <Button onClick={() => subscribe(feedUrl || window.location.href).then(closeCurrentTab)} py={2} my={2}
                  width={1}>SUBSCRIBE</Button>
          <Box>
            {(items || []).map((item: Parser.Item) => <SubscriptionFeedItem {...item} key={item.link} />)}
          </Box>
        </Card>
      </Box>
      <Global styles={GlobalStyle} />
    </ThemeProvider>
  );
};
