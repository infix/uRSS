import { RouteComponentProps, withRouter } from "react-router";
import React, { Component } from "react";
import { Box, Flex } from "rebass";
import { Icon } from "../../shared/components/Icon";
import ContentEditable from "react-contenteditable";
import { browser } from "webextension-polyfill-ts";
import { Message } from "../../shared/Message";
import styled from "@emotion/styled";
import { color, typography } from "styled-system";

type Props = RouteComponentProps & { title: string; id: string };
type State = { title: string };

const style = { cursor: "pointer", margin: "auto 0" };

const Title = styled(ContentEditable)(typography, color);

export const FeedHeader = withRouter(class extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { title: props.title };
  }

  componentWillUnmount() {
    const message: Message = {
      type: "UPDATE_FEED_ITEM",
      payload: { id: this.props.id, data: { title: this.state.title } },
    };

    browser.runtime.sendMessage(message).then(e =>
      console.log({ title: this.state.title, e }),
    );
  }

  handleChange = e => this.setState({ title: e.target.value.trim() });

  render() {
    const { title } = this.state;

    return (
      <Flex my={2}>
        <Box style={style} onClick={this.props.history.goBack} mr={2}>
          <Icon>arrow_back</Icon>
        </Box>

        <Title color={"secondary"} onChange={this.handleChange} flex={1} fontSize={4}
               spellcheck="false" style={{ margin: "0 auto" }} html={title} />
      </Flex>
    );
  }
});
