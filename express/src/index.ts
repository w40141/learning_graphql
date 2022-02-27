import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import express from "express";
import http from "http";
import { GraphQLScalarType } from "graphql";
import graphqlPlayMiddlewareExpress from "graphql-playground-middleware-express";
import { readFileSync } from "fs";
import { MongoClient } from "mongodb";

require("dotenv").config();
const typeDefs = readFileSync("./src/typeDefs.graphql", "utf-8");

let _id = 0;
const users: Array<{ githubLogin: string; name: string }> = [
  { githubLogin: "mHattrup", name: "Mike Hattrup" },
  { githubLogin: "gPlake", name: "Glen Plake" },
  { githubLogin: "sSchmidt", name: "Scot Schmidt" },
];

const photos: Array<{
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

const tags: Array<{ photoID: string; userID: string }> = [
  { photoID: "1", userID: "gPlake" },
  { photoID: "2", userID: "sSchmidt" },
  { photoID: "2", userID: "mHattrup" },
  { photoID: "2", userID: "gPlake" },
  { photoID: "4", userID: "gPlake" },
];

const resolvers = {
  Query: {
    totalPhoto: (parent: any, args: any, { db }: any) =>
      db.collection("photos").estimatedDocumentCount(),
    allPhotos: (parent: any, args: any, { db }: any) =>
      db.collection("photos").find().toArray(),
    totalUsers: (parent: any, args: any, { db }: any) =>
      db.collection("users").estimatedDocumentCount(),
    allUsers: (parent: any, args: any, { db }: any) =>
      db.collection("users").find().toArray(),
  },

  Mutation: {
    postPhoto(parent: String, args: any) {
      const newPhoto = {
        id: _id++,
        ...args.input,
        created: new Date(),
      };
      photos.push(newPhoto);
      return newPhoto;
    },
  },

  Photo: {
    url: (parent: { id: string }) => `http://yoursite.com/img/${parent.id}.jpg`,
    postedBy: (parent: { githubUser: string }) => {
      return users.find((u) => u.githubLogin === parent.githubUser);
    },
    taggedUsers: (parent: { id: string }) => {
      return tags
        .filter((tag) => tag.photoID === parent.id)
        .map((tag) => tag.userID)
        .map((userID) => users.find((u) => u.githubLogin === userID));
    },
  },

  User: {
    postedPhotos: (parent: { githubLogin: string }) => {
      return photos.filter((p) => p.githubUser === parent.githubLogin);
    },
    inPhotos: (parent: { id: string }) => {
      tags
        .filter((tag) => tag.userID === parent.id)
        .map((tag) => tag.photoID)
        .map((photoID) => photos.find((p) => p.id === photoID));
    },
  },

  DateTime: new GraphQLScalarType({
    name: "DateTime",
    description: "A valid date time value.",
    serialize: (value: any) => new Date(value).toISOString(),
    parseValue: (value: any) => new Date(value),
    parseLiteral: (ast: any) => ast.value,
  }),
};

async function listen(port: number) {
  const app = express();

  const MONGO_DB: string = process.env.DB_HOTS as string;
  const client = new MongoClient(MONGO_DB);
  await client.connect();
  const db = client.db();
  const context = { db };

  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  app.get("/", (req, res) => res.end("Welcome to the PhotoShare API"));
  app.get(
    "/playground",
    graphqlPlayMiddlewareExpress({ endpoint: "/graphql" })
  );

  await server.start();
  server.applyMiddleware({ app });

  return new Promise((resolve, reject) => {
    httpServer.listen(port).once("listening", resolve).once("error", reject);
  });
}

async function main() {
  try {
    await listen(4000);
    console.log("🚀 Server is ready at http://localhost:4000/graphql");
  } catch (err) {
    console.error("💀 Error starting the node server", err);
  }
}

void main();
