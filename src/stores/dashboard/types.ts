export type Board = {
  id: number;
  title: string;
  columns: Column[];
};

export type Column = {
  id: number;
  title: string;
  cards: Card[];
};

export type Card = {
  id: number;
  content: string;
  position: number;
  updated_at: string;
};

export type AddCard = {
  content: string;
  columnId: number;
};

export type RemoveCard = {
  columnId: number;
  cardId: number;
};

export type OrderedCardsInColumns = {
  id: number;
  cards: Card[];
};
