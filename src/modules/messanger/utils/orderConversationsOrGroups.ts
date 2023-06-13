import type { Conversation, Group } from "../types/index.types";

export const orderConversationsOrGroups = (array: Conversation[] | Group[]) => {
  return array.sort((valueA, valueB) => {
    if (valueA.lastMessage && valueB.lastMessage) {
      return (
        new Date(valueB.lastMessage.created_at).getTimezoneOffset() -
        new Date(valueA.lastMessage.created_at).getTimezoneOffset()
      );
    } else if (valueA.lastMessage) {
      return -1; // Если только у a есть lastMessage (а у b нет), возвращается -1, указывая, что a должно стоять перед b в отсортированном массиве.
    } else if (valueB.lastMessage) {
      return 1; // Если только b имеет lastMessage (а a его нет), он возвращает 1, указывая, что b должен стоять перед a в отсортированном массиве.
    } else {
      return new Date(valueB.created_at).getTimezoneOffset() - new Date(valueA.created_at).getTimezoneOffset();
    }
  });
};
