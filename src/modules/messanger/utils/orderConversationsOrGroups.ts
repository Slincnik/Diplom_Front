import { orderBy } from "lodash";
import type { Conversation, Group } from "../types/index.types";

export const orderConversationsOrGroups = (array: Conversation[] | Group[]) => {
  return orderBy(
    array,
    (item: Conversation | Group) => {
      return item.lastMessage ? item.lastMessage.created_at : item.created_at;
    },
    "desc",
  );
};
