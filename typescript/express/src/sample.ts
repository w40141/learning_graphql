export const users: Array<{ githubLogin: string; name: string }> = [
  { githubLogin: "mHattrup", name: "Mike Hattrup" },
  { githubLogin: "gPlake", name: "Glen Plake" },
  { githubLogin: "sSchmidt", name: "Scot Schmidt" },
];

export const photos: Array<{
  id: string;
  name: string;
  description?: string;
  category: string;
  githubUser: string;
  created: string;
}> = [
  {
    id: "1",
    name: "Dropping the Heart Chute",
    description: "The heart chute is one of my favorite chutes",
    category: "ACTION",
    githubUser: "gPlake",
    created: "3-28-1977",
  },
  {
    id: "2",
    name: "Enjoying the sunshine",
    category: "SELFIE",
    githubUser: "sSchmidt",
    created: "1-2-1985",
  },
  {
    id: "3",
    name: "Gunbarrel 25",
    description: "25 laps on gunbarrel today",
    category: "LANDSCAPE",
    githubUser: "sSchmidt",
    created: "2018-04-15T19:09:57.3082Z",
  },
  {
    id: "4",
    name: "Asagao",
    category: "LANDSCAPE",
    githubUser: "sSchmidt",
    created: "2010-10-15T19:09:57.3082Z",
  },
];

export const tags: Array<{ photoID: string; userID: string }> = [
  { photoID: "1", userID: "gPlake" },
  { photoID: "2", userID: "sSchmidt" },
  { photoID: "2", userID: "mHattrup" },
  { photoID: "2", userID: "gPlake" },
  { photoID: "4", userID: "gPlake" },
];
