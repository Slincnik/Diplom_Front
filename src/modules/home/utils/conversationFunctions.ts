import type { IUser } from "@/stores/user/types";
import type { Conversation } from "../types/index.types";

export const isFavorite = (conversation: Conversation, user: IUser | null) => {
  if (!user) return false;

  if (user.id === conversation.user.id && user.id === conversation.recipient.id) {
    return true;
  }

  return false;
};

export const giveRecipientId = (conversation: Conversation, user: IUser) => {
  if (isFavorite(conversation, user)) {
    return user.id;
  }

  if (user.id === conversation.user.id) {
    return conversation.recipient.id;
  } else if (user.id === conversation.recipient.id) {
    return conversation.user.id;
  }
};

export const renderTitle = (conversation: Conversation, user: IUser | null) => {
  if (!user) return "";

  if (isFavorite(conversation, user)) {
    return "Избранное";
  }

  if (user.id === conversation.user.id) {
    return conversation.recipient.fullname;
  } else if (user.id === conversation.recipient.id) {
    return conversation.user.fullname;
  }
};

export const renderChar = (conversation: Conversation, user: IUser | null) => {
  if (!user) return "";

  if (user.id === conversation.user.id) {
    return conversation.recipient.fullname.charAt(0);
  } else if (user.id === conversation.recipient.id) {
    return conversation.user.fullname.charAt(0);
  }
};
