import type { Conversation, Group } from "../types/index.types";

export const orderConversationsOrGroups = (array: Conversation[] | Group[]) => {
  return array
    .map(item => item)
    .sort((valueA, valueB) => {
      if (valueA.lastMessage && valueB.lastMessage) {
        const date1 = new Date(valueA.lastMessage.created_at).getTime();
        const date2 = new Date(valueB.lastMessage.created_at).getTime();
        return date2 - date1;
      } else if (valueA.lastMessage) {
        return -1;
      } else if (valueB.lastMessage) {
        return 1;
      } else {
        return new Date(valueB.created_at).getTime() - new Date(valueA.created_at).getTime();
      }
    });
};
