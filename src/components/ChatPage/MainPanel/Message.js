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
    <StMessageContainer>
      <StUserProfile src={message.user.image} alt={message.user.name} />
      <div
        style={{
          backgroundColor: isMessageMine(message, user) && "#ECECEC",
        }}
      >
        <h6>
          {message.user.name}{" "}
          <span style={{ fontSize: "10px", color: "gray" }}>
            {timeFromNow(message.timestamp)}
          </span>
        </h6>
        {isImage(message) ? (
          <img style={{ maxWidth: "300px" }} alt="이미지" src={message.image} />
        ) : (
          <p>{message.content}</p>
        )}
      </div>
    </StMessageContainer>
  );
}

export default Message;

const StMessageContainer = styled.div`
  margin-bottom: 3px;
  display: flex;
`;

const StUserProfile = styled.img`
  border-radius: 10px;
  width: 48px;
  height: 48px;
`;
