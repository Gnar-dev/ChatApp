import React from "react";
import UserPanel from "./UserPanel";
import Favorited from "./Favorited";
import DirectMessages from "./DirectMessages";
import ChatRooms from "./ChatRooms";
import styled from "styled-components";
const SidePanel = () => {
  return (
    <StSidePanelContainer>
      <UserPanel />
      <Favorited />
      <ChatRooms />
      <DirectMessages />
    </StSidePanelContainer>
  );
};

export default SidePanel;

const StSidePanelContainer = styled.div`
  background-color: #e9e9e9;
  padding: 2rem;
  min-height: 100vh;
  min-width: 275px;
`;
