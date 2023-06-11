import { orderBy } from "lodash";
import type { Conversation, Group } from "../types/index.types";

export const orderConversationsOrGroups = (dialog: Conversation[] | Group[]) => {
  return orderBy(
    dialog,
    (item: Conversation) => {
      return item.lastMessage ? item.lastMessage.created_at : item.created_at;
    },
    "desc",
  ) as Conversation[] | Group[];
};
