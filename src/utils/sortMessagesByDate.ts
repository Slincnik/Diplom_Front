import cloneDeep from "lodash/cloneDeep";
import type { Message, MessageGroup } from "@/modules/messanger/types/index.types";

export const sortMessagesByDate = (messages: Message[] | MessageGroup[]) => {
  const cloned = cloneDeep(messages);

  return cloned.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
};
