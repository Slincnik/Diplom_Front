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
  messages: string[];
  lastMessage: Message;
  created_at: string;
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
  last_message: MessageGroup;
  created_at: string;
};

export type Dialogs = {
  conversations: Conversation[];
  groups: Group[];
};
