import React from "react";
import moment from "moment";
import styled from "styled-components";

function Message({ message, user }) {
  const timeFromNow = (timestamp) => moment(timestamp).fromNow();

  const isImage = (message) => {
    return (
      message.hasOwnProperty("image") && !message.hasOwnProperty("content")
    );
  };
  const isMessageMine = (message, user) => {
    if (user) {
      return message.user.id === user.uid;
    }
  };

  return (
    <StMessageContainer ismine={+isMessageMine(message, user)}>
      <StUserProfile src={message.user.image} alt={message.user.name} />
      <StMsgBody ismine={+isMessageMine(message, user)}>
        <StMsgHeader>
          <StUserName>{message.user.name}</StUserName>
          <StTimeStamp>{timeFromNow(message.timestamp)}</StTimeStamp>
        </StMsgHeader>

        {isImage(message) ? (
          <StImgMsg alt="이미지" src={message.image} />
        ) : (
          <StContentMsg>{message.content}</StContentMsg>
        )}
      </StMsgBody>
    </StMessageContainer>
  );
}

export default Message;

const StMessageContainer = styled.div`
  margin-bottom: 3px;
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: flex-start;
  justify-content: ${({ ismine }) => (ismine ? "flex-end" : "")};
`;

const StUserProfile = styled.img`
  border-radius: 10px;
  width: 48px;
  height: 48px;
  overflow: hidden;
`;
const StMsgBody = styled.div`
  padding: 10px;
  display: flex;
  flex-direction: column;
  background: black;
  color: white;
  background-color: ${({ ismine }) => (ismine ? "#ECECEC" : "")};
  color: ${({ ismine }) => (ismine ? "black" : "")};
  width: 40%;
  border-radius: 10px;
`;
const StMsgHeader = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 3px;
`;
const StUserName = styled.div`
  font-weight: 900;
  font-size: 14px;
`;
const StTimeStamp = styled.div`
  font-size: 10px;
  color: gray;
`;

const StImgMsg = styled.img`
  max-width: 300px;
`;

const StContentMsg = styled.p`
  font-size: 12px;
`;
