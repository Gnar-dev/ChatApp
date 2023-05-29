import React, { useRef, useState } from "react";
import ProgressBar from "react-bootstrap/ProgressBar";

import { useSelector } from "react-redux";
import { MdImageSearch } from "react-icons/md";
import {
  getDatabase,
  ref,
  set,
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
import mime from "mime";

const MessageForm = () => {
  const chatRoom = useSelector((state) => state.chatRoom.currentChatRoom);
  const user = useSelector((state) => state.user.currentUser);
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const db = getDatabase();
  const messagesRef = ref(db, "messages");
  const timeStamp = serverTimestamp();
  const inputOpenImageRef = useRef(null);
  const storage = getStorage();
  const [percentage, setPercentage] = useState(0);
  const isPrivateChaRoom = useSelector((state) => state.isPrivateChaRoom);
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
        setErrors([]);
        set(push(child(messagesRef, chatRoom.id)), createMessage());
      }, 5000);
    }
  };
  const handleOpenImageRef = () => {
    inputOpenImageRef.current.click();
  };

  const getPath = () => {
    if (isPrivateChaRoom) {
      return `/message/private/${chatRoom.id}`;
    } else {
      return `/message/public`;
    }
  };
  const handleUploadImage = (e) => {
    const file = e.target.files[0];

    const filePath = `${getPath()}/${file.name}`;
    const metaData = { contentType: mime.getType(file.name) };
    setLoading(true);

    try {
      const storageRef = strRef(storage, filePath);
      const uploadTask = uploadBytesResumable(storageRef, file, metaData);

      // 퍼센테이지 만들기
      uploadTask.on(
        "state_changed",
        (UploadTaskSnapshot) => {
          const currentPercentage = Math.round(
            (UploadTaskSnapshot.bytesTransferred /
              UploadTaskSnapshot.totalBytes) *
              100
          );
          setPercentage(currentPercentage);
        },
        (err) => {
          console.error(err);
          setLoading(false);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            const message = createMessage(downloadURL);
            push(child(messagesRef, chatRoom.id), message);
            setLoading(false);
          });
        }
      );
    } catch (e) {
      alert(e.message);
    }
  };
  return (
    <div>
      <StSendImage
        onClick={handleOpenImageRef}
        disabled={loading ? true : false}
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
            disabled={loading ? true : false}
          >
            보내기
          </StSendMsgBtn>
        </StSendMsgBtnContainer>
      </StTextAreaContainer>
      {!(percentage === 0 || percentage === 100) && (
        <ProgressBar
          variant="warning"
          label={`${percentage}%`}
          now={percentage}
        />
      )}
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
        ref={inputOpenImageRef}
        onChange={handleUploadImage}
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
