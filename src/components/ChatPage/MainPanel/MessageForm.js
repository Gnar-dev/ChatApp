import React, { useState, useRef } from "react";
import Form from "react-bootstrap/Form";
import ProgressBar from "react-bootstrap/ProgressBar";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import firebase from "../../../firebase";
import { useSelector } from "react-redux";
import { MdImageSearch } from "react-icons/md";
import {
  getDatabase,
  ref,
  set,
  remove,
  push,
  child,
  serverTimestamp,
} from "firebase/database";
import {
  getStorage,
  ref as strRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { styled } from "styled-components";

const MessageForm = () => {
  const chatRoom = useSelector((state) => state.chatRoom.currentChatRoom);
  const user = useSelector((state) => state.user.currentUser);
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const db = getDatabase();
  const messagesRef = ref(db, "messages");
  const timeStamp = serverTimestamp();

  const createMessage = (fileUrl = null) => {
    const message = {
      timeStamp,
      user: {
        id: user.uid,
        name: user.displayName,
        image: user.photoURL,
      },
    };
    if (fileUrl !== null) {
      message["image"] = fileUrl;
    } else {
      message["content"] = content;
    }
    return message;
  };
  const handleChange = (e) => {
    setContent(e.target.value);
  };
  const handleSubmit = async () => {
    if (!content) {
      setErrors((prev) => prev.concat("컨텐츠를 먼저 입력해주세요"));
    }
    setLoading(true);
    try {
      await set(push(child(messagesRef, chatRoom.id)), createMessage());
      setLoading(false);
      setContent("");
      setErrors([]);
    } catch (e) {
      setErrors((prev) => prev.concat(e.message));
      setLoading(false);
      setTimeout(() => {
        setErrors([]);set(push(child(messagesRef, chatRoom.id)), createMessage());
      }, 5000);
    }
  };
  return (
    <div>
      <StSendImage
      //  onClick={handleOpenImageRef}
      //  disabled={loading ? true : false}
      >
        <MdImageSearch size="32" />
      </StSendImage>
      <StTextAreaContainer>
        <StTextArea
          //<onKeyDown={handleKeyDown}
          value={content}
          onChange={handleChange}
        ></StTextArea>
        <StSendMsgBtnContainer>
          <StSendMsgBtn
            onClick={handleSubmit}
            // disabled={loading ? true : false}
          >
            보내기
          </StSendMsgBtn>
        </StSendMsgBtnContainer>
      </StTextAreaContainer>

      {/* {!(percentage === 0 || percentage === 100) && ( */}
      <ProgressBar
        variant="warning"
        // label={`${percentage}%`}
        // now={percentage}
      />
      {/* )} */}

      <div>
        {errors?.map((errorMsg) => (
          <p style={{ color: "red" }} key={errorMsg}>
            {errorMsg}
          </p>
        ))}
      </div>

      <StInputFile
        accept="image/jpeg, image/png"
        type="file"
        // ref={inputOpenImageRef}
        // onChange={handleUploadImage}
      />
    </div>
  );
};

export default MessageForm;

const StSendImage = styled.button`
  background: transparent;
  border: none;
  margin-bottom: 0.5rem;
`;

const StInputFile = styled.input`
  display: none;
`;
const StTextAreaContainer = styled.div`
  width: 100%;
  min-height: 5rem;
  display: flex;
`;
const StTextArea = styled.textarea`
  width: 90%;
  min-height: 5rem;
`;
const StSendMsgBtnContainer = styled.div`
  min-width: 5rem;
  width: 10%;
  min-height: 5rem;
  padding-left: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const StSendMsgBtn = styled.button`
  padding: 1rem;
  border: 0;
  border-radius: 10px;
  &:hover {
    background-color: black;
    color: white;
  }
`;
