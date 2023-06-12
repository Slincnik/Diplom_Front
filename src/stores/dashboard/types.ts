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
};
