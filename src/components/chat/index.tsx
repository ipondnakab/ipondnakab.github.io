import React, { ReactNode } from "react";
import { notification, Spin } from "antd";
import { SendOutlined } from "@ant-design/icons";
import {
  addDoc,
  orderBy,
  query,
  CollectionReference,
  DocumentData,
  Timestamp,
} from "firebase/firestore";
import {
  ChatContainer,
  ChatInputContainer,
  ChatRoomContainer,
  CustomInput,
  HeaderChatContainer,
  CustomButton,
  ControlChatContainer,
  NoDataContainer,
} from "./index.style";
import ChatItem from "./chatItem";
import dayjs from "dayjs";
import {
  IoVolumeMuteOutline,
  IoVolumeHighOutline,
  IoNotificationsOutline,
  IoNotificationsOffOutline,
  IoCodeSlash,
} from "react-icons/io5";

import { useCollection } from "react-firebase-hooks/firestore";
import { ChatBoardTypeEnum, ChatType } from "../../interfaces/chat";
import { FirebaseError } from "firebase/app";
import { getColorWithText } from "../../functions/color";
// @ts-ignore
import soundMessage from "../../assets/sounds/newMessage.mp3";
import useSound from "use-sound";
import { UserType } from "../../interfaces/user";

type ChatBoardType = {
  title?: ReactNode;
  extraHeader?: ReactNode;
  collectionRef: CollectionReference<DocumentData>;
  user: UserType;
  boardType?: ChatBoardTypeEnum;
};

const ChatBoard: React.FC<ChatBoardType> = ({
  title,
  extraHeader,
  collectionRef,
  user,
  boardType = ChatBoardTypeEnum.PUBLIC,
}) => {
  const q = query(collectionRef, orderBy("timestamp", "asc"));
  const [snapshot, loading, error] = useCollection<Partial<ChatType>>(q);
  const [chats, setChats] = React.useState<
    (ChatType & { isMyMessage: boolean; isPending?: boolean })[]
  >([]);
  const [isTurnOnSound, setIsTurnOnSound] = React.useState(
    localStorage.getItem("turnOnSound") === "true"
  );
  const [isTurnOnNotification, setIsTurnOnNotification] = React.useState(
    localStorage.getItem("turnOnNotification]") === "true"
  );

  const toggleSound = React.useCallback(
    () =>
      setIsTurnOnSound((isTurnOnSound) => {
        localStorage.setItem("turnOnSound", !isTurnOnSound ? "true" : "false");
        return !isTurnOnSound;
      }),
    []
  );

  const toggleNotification = React.useCallback(
    () =>
      setIsTurnOnNotification((isTurnOnNotification) => {
        localStorage.setItem(
          "turnOnNotification",
          !isTurnOnNotification ? "true" : "false"
        );
        return !isTurnOnNotification;
      }),
    []
  );

  const [play] = useSound(soundMessage);
  const messagesEndRef: React.LegacyRef<HTMLDivElement> = React.useRef(null);

  const scrollToBottom = React.useCallback(
    () =>
      messagesEndRef.current
        ? messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        : undefined,
    []
  );

  const [formChat] = ChatInputContainer.useForm();

  const sendMessage = React.useCallback(
    async (message: string) => {
      if (!message) return;
      const messageData: Omit<ChatType, "id"> = {
        message,
        timestamp: Timestamp.now(),
        email: user.email || user.id + "@" + user.ipAddress,
        displayName: user.displayName,
        ipAddress: user?.ipAddress,
        uid: user.id,
      };

      setChats((prev) => [
        ...prev,
        {
          ...(messageData as Omit<ChatType, "id">),
          id: new Date().getTime().toString(),
          isMyMessage: true,
          isPending: true,
          ipAddress: user?.ipAddress,
        },
      ]);
      formChat.resetFields();
      try {
        await addDoc(collectionRef, messageData);
      } catch (error) {
        const err = error as FirebaseError;
        console.error({ err });
        notification.error({ message: err.code });
      }
    },
    [collectionRef, formChat, user]
  );

  // Snapshot Handling
  React.useEffect(() => {
    const c = snapshot?.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      isMyMessage: user.email === doc.data().email,
    }));

    // handle message to show
    setChats(c as (ChatType & { isMyMessage: boolean })[]);

    // Listening snapshot
    snapshot?.docChanges().forEach((change) => {
      const nChat = change.doc.data();
      const isMyMessage = user.id === nChat.uid;
      const diff = dayjs().diff(dayjs(nChat.timestamp?.toDate()), "second");
      // Listening for new message
      if (change.type === "added") {
        if (!isMyMessage) {
          if (diff < 60) {
            isTurnOnNotification &&
              notification.open({
                message: "New message",
                description: change.doc.data().message,
                placement: "topRight",
              });
            isTurnOnSound && play();
          }
        }
        scrollToBottom();
      }
    });
  }, [
    snapshot,
    scrollToBottom,
    play,
    isTurnOnSound,
    isTurnOnNotification,
    user.email,
    user.id,
  ]);

  // Error handling
  React.useEffect(() => error && notification.error(error), [error]);

  // Scroll to bottom on mount with last message
  React.useEffect(() => {
    if (!chats?.length) return;
    scrollToBottom();
  }, [chats, scrollToBottom]);

  return (
    <ChatContainer>
      <HeaderChatContainer>
        {title || <h3>Leave a message to me</h3>}
        <ControlChatContainer>
          {isTurnOnNotification ? (
            <IoNotificationsOutline
              size={20}
              style={{ cursor: "pointer" }}
              onClick={toggleNotification}
            />
          ) : (
            <IoNotificationsOffOutline
              size={20}
              style={{ cursor: "pointer" }}
              onClick={toggleNotification}
            />
          )}
          {isTurnOnSound ? (
            <IoVolumeHighOutline
              size={24}
              style={{ cursor: "pointer" }}
              onClick={toggleSound}
            />
          ) : (
            <IoVolumeMuteOutline
              size={24}
              style={{ cursor: "pointer" }}
              onClick={toggleSound}
            />
          )}
          {extraHeader}
        </ControlChatContainer>
      </HeaderChatContainer>
      <ChatRoomContainer>
        {loading ? (
          <Spin />
        ) : chats?.length > 0 ? (
          chats?.map((data) => {
            const isMyMessage = data.uid === user.id;
            const email = isMyMessage ? user.email : data.email;
            const color = data.displayName
              ? getColorWithText(data.displayName)
              : "#DDD";
            const timestamp = dayjs(data.timestamp.toDate());
            return (
              <ChatItem
                {...data}
                isGuest={boardType === ChatBoardTypeEnum.PUBLIC}
                key={data.id}
                email={email}
                colorAvatar={color}
                message={data.message}
                urlImages={data.urlImages}
                urlVideo={data.urlVideo}
                isPending={data.isPending}
                isMyMessage={isMyMessage}
                timestamp={timestamp}
              />
            );
          })
        ) : (
          <NoDataContainer>
            <IoCodeSlash size={48} />
            <span>คุณคือคนแรกเริ่มแชทกันเลย!!</span>
          </NoDataContainer>
        )}
        <div ref={messagesEndRef} />
      </ChatRoomContainer>

      <ChatInputContainer
        form={formChat}
        onFinish={(data) => {
          const { message } = data as { message: string };
          sendMessage(message);
        }}
      >
        <ChatInputContainer.Item name="message">
          <CustomInput multiple name="message" />
        </ChatInputContainer.Item>
        <CustomButton type="primary" icon={<SendOutlined />} htmlType="submit">
          Send
        </CustomButton>
      </ChatInputContainer>
    </ChatContainer>
  );
};

export default ChatBoard;
