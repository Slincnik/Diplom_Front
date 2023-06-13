import type { IUser } from "@/stores/user/types";

type DialogUser = {
  id: number;
  name: string;
  lastname: string | null;
  fullname: string;
  avatar: null;
  login: string;
};

export type Conversation = {
  id: number;
  user: DialogUser;
  recipient: DialogUser;
  messages: Message[];
  lastMessage: Message | null;
  type: "conversation";
  created_at: string;
  isLoaded: boolean;
};

export type Message = {
  id: number;
  body: string;
  sender: DialogUser;
  response: Message | null;
  created_at: string;
  updated_at: string;
  read_at: string;
};

export type MessageGroup = {
  id: number;
  body: string;
  sender: DialogUser;
  response: Message | null;
  created_at: string;
  updated_at: string;
};

export type Group = {
  id: number;
  name: string;
  creator: DialogUser;
  members: DialogUser[];
  lastMessage: MessageGroup | null;
  messages: MessageGroup[];
  type: "group";
  created_at: string;
  isLoaded: boolean;
};

export type Dialogs = {
  conversations: Conversation[];
  groups: Group[];
};

type NewMessageFromCentrifugo = {
  type: "NEW_MESSAGE";
  conversation_id: number;
  message: Message;
};

type AddConversationFromCentrifugo = {
  type: "ADD_CONVERSATION";
  conversation: Conversation;
};

type ReadMessagesFromCentrifugo = {
  type: "READ_MESSAGES";
  user_id: number;
  conversation_id: number;
  timestamp: string;
};

type EditMessageFromCentrifugo = {
  type: "EDIT_MESSAGE";
  conversation_id: number;
  message: Message | MessageGroup;
};

type DeleteMessagesFromCentrifugo = {
  type: "DELETE_MESSAGES";
  conversation_id: number;
  messages: number[];
};

type AddGroupFromCentrifugo = {
  type: "ADD_GROUP";
  group: Group;
};

type AddedToGroupFromCentrifugo = {
  type: "ADDED_TO_GROUP";
  users: IUser[];
  group: Group;
};

type DeleteFromGroupFromCentrifugo = {
  type: "DELETE_FROM_GROUP";
  user: number;
  group_id: number;
};

type NewMessageInGroupFromCentrifugo = {
  type: "NEW_MESSAGE_GROUP";
  group_id: number;
  message: MessageGroup;
};

type DeleteMessageInGroupFromCentrifugo = {
  type: "DELETE_MESSAGE_GROUP";
  group_id: number;
  messages: number[];
};

type EditMessageInGroupFromCentrifugo = {
  type: "EDIT_MESSAGE_GROUP";
  group_id: number;
  message: MessageGroup;
};

export type MessagesFromCentrifugo =
  | NewMessageFromCentrifugo
  | AddConversationFromCentrifugo
  | ReadMessagesFromCentrifugo
  | EditMessageFromCentrifugo
  | DeleteMessagesFromCentrifugo
  | AddGroupFromCentrifugo
  | AddedToGroupFromCentrifugo
  | DeleteFromGroupFromCentrifugo
  | NewMessageInGroupFromCentrifugo
  | DeleteMessageInGroupFromCentrifugo
  | EditMessageInGroupFromCentrifugo;
