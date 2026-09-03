export type ResponseItem = {
  time: string;
  score: string;
  text: string;
};

export type Question = {
  title: string;
  metric: string;
  detail: string;
  answers: ResponseItem[];
};

export type Table = {
  id: number;
  hallId: string;
  scans: number;
  responses: number;
  rating: string;
  lastScan: string;
  status: "Activ" | "Linistit" | "Nou";
  latest: ResponseItem[];
  questions: Question[];
};

export type Hall = {
  id: string;
  label: string;
  shortLabel: string;
};

export const halls: Hall[] = [
  { id: "main", label: "Sala principala", shortLabel: "SP" },
  { id: "terrace", label: "Terasa", shortLabel: "TR" },
  { id: "vip", label: "Sala VIP", shortLabel: "VIP" },
  { id: "bar", label: "Bar", shortLabel: "BR" },
];

export const tables: Table[] = [
  {
    id: 12,
    hallId: "main",
    scans: 48,
    responses: 18,
    rating: "4.8",
    lastScan: "21:44",
    status: "Activ",
    latest: [
      { time: "21:44", score: "5/5", text: "Servire foarte buna" },
      { time: "21:31", score: "5/5", text: "Totul a fost rapid" },
      { time: "21:08", score: "4/5", text: "Muzica putin tare" },
    ],
    questions: [
      {
        title: "Cum a fost servirea?",
        metric: "5/5",
        detail: "12 raspunsuri pozitive",
        answers: [
          { time: "21:44", score: "5/5", text: "Servire foarte buna" },
          { time: "20:58", score: "5/5", text: "Chelnerul a fost atent" },
        ],
      },
      {
        title: "Cat de rapid a venit comanda?",
        metric: "5/5",
        detail: "Timp perceput foarte bun",
        answers: [
          { time: "21:31", score: "5/5", text: "Totul a fost rapid" },
          { time: "20:46", score: "5/5", text: "Comanda a venit repede" },
        ],
      },
      {
        title: "Cum a fost atmosfera?",
        metric: "4/5",
        detail: "Un raspuns semnaleaza volum ridicat",
        answers: [
          { time: "21:08", score: "4/5", text: "Muzica putin tare" },
          { time: "20:12", score: "5/5", text: "Atmosfera placuta" },
        ],
      },
      {
        title: "Ati recomanda restaurantul?",
        metric: "94%",
        detail: "17 din 18 raspunsuri sunt da",
        answers: [
          { time: "21:44", score: "Da", text: "As reveni cu prietenii" },
          { time: "19:55", score: "Da", text: "Experienta buna per total" },
        ],
      },
    ],
  },
  {
    id: 7,
    hallId: "main",
    scans: 35,
    responses: 11,
    rating: "4.6",
    lastScan: "21:36",
    status: "Activ",
    latest: [
      { time: "21:36", score: "5/5", text: "Pastele au fost excelente" },
      { time: "20:27", score: "4/5", text: "Ar mai merge un desert" },
      { time: "20:02", score: "5/5", text: "Ambianta calma" },
    ],
    questions: [
      {
        title: "Cum a fost mancarea?",
        metric: "5/5",
        detail: "Cel mai bun scor al serii",
        answers: [
          { time: "21:36", score: "5/5", text: "Pastele au fost excelente" },
          { time: "19:48", score: "5/5", text: "Gust si plating bune" },
        ],
      },
      {
        title: "Cum a fost servirea?",
        metric: "4/5",
        detail: "Feedback stabil",
        answers: [
          { time: "20:27", score: "4/5", text: "Ar mai merge un desert" },
          { time: "20:02", score: "5/5", text: "Ambianta calma" },
        ],
      },
    ],
  },
  {
    id: 4,
    hallId: "main",
    scans: 21,
    responses: 8,
    rating: "4.2",
    lastScan: "20:51",
    status: "Linistit",
    latest: [
      { time: "20:51", score: "4/5", text: "Masa curata si comoda" },
      { time: "19:40", score: "4/5", text: "Asteptare un pic lunga" },
      { time: "18:58", score: "5/5", text: "Personal prietenos" },
    ],
    questions: [
      {
        title: "Cat de confortabila a fost masa?",
        metric: "4/5",
        detail: "Feedback bun pe zona de confort",
        answers: [
          { time: "20:51", score: "4/5", text: "Masa curata si comoda" },
          { time: "18:58", score: "5/5", text: "Personal prietenos" },
        ],
      },
      {
        title: "Cat de repede ati fost serviti?",
        metric: "4/5",
        detail: "O mentiune despre asteptare",
        answers: [
          { time: "19:40", score: "4/5", text: "Asteptare un pic lunga" },
          { time: "18:20", score: "4/5", text: "Acceptabil la ora aglomerata" },
        ],
      },
    ],
  },
  {
    id: 15,
    hallId: "main",
    scans: 12,
    responses: 3,
    rating: "5.0",
    lastScan: "21:12",
    status: "Nou",
    latest: [
      { time: "21:12", score: "5/5", text: "Totul perfect" },
      { time: "20:05", score: "5/5", text: "Recomand" },
      { time: "18:44", score: "5/5", text: "Foarte bun burgerul" },
    ],
    questions: [
      {
        title: "Ati recomanda restaurantul?",
        metric: "100%",
        detail: "Primele raspunsuri sunt excelente",
        answers: [
          { time: "21:12", score: "Da", text: "Totul perfect" },
          { time: "20:05", score: "Da", text: "Recomand" },
        ],
      },
      {
        title: "Cum a fost mancarea?",
        metric: "5/5",
        detail: "Scor maxim pe primele scanari",
        answers: [
          { time: "18:44", score: "5/5", text: "Foarte bun burgerul" },
          { time: "20:05", score: "5/5", text: "Portii generoase" },
        ],
      },
    ],
  },
];

export function getHall(hallId: string) {
  return halls.find((hall) => hall.id === hallId);
}

export function getHallTables(hallId: string) {
  return tables.filter((table) => table.hallId === hallId);
}

export function getHallStats(hallId: string) {
  const hallTables = getHallTables(hallId);
  return {
    tables: hallTables.length,
    responses: hallTables.reduce((sum, table) => sum + table.responses, 0),
  };
}
