import { ApolloServer } from "apollo-server-express";
import express from "express";
import expressPlayground from "graphql-playground-middleware-express";
import readFileSync from "fs";
import { MongoClient } from "mongodb";
import "../javascript/resolvers/index.js";

require("dotenv").config();
const typeDefs = readFileSync("./typeDefs.graphql", "UTF-8");

async function start() {
  let app = express();
  const MONGO_DB = process.env.DB_HOST;
  const client = await MongoClient.connect(MONGO_DB, { useNewUrlParser: true });
  const db = client.db();
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const githubToken = req.headers.authorization;
      const currentUser = await db.collection("user").findOne({ githubToken });
      return { db, currentUser };
    },
  });

  server.applyMiddleware({ app });
  app.get("/playground", expressPlayground({ endpoint: "/graphql" }));
  app.get("/", (req, res) => {
    const url =
      "https://github.com/login/oauth/authorize?client_id=${process.env.CLIENT_ID}&scope=user";
    res.end('<a href="${url}">Sign In with Github</a>');
  });
  app.listen({ port: 4000 }, () =>
    console.log(
      "GraphQL Server running @ http://localhost:4000${server.graphqlPath}"
    )
  );
}

start();
