import {ApolloServer} from 'apollo-server';
const typeDefs = `
        type Photo {
                id: ID!
                url: String!
                name: String!
                description: String
        }

        type Query {
                totalPhoto: Int!
                allPhotos: [Photo!]!
        }

        type Mutation {
                postPhoto(name: String!, description: String): Photo!
        }
`;

let _id = 0;
const photos: Array<[any]> = [];

const resolvers = {
  Query: {
    totalPhoto: () => photos.length,
    allPhotos: () => photos,
  },

  Mutation: {
    postPhoto(parent: String, args: any) {
      const newPhoto = {
        id: _id++,
        ...args,
      };
      photos.push(newPhoto);
      return newPhoto;
    },
  },
  Photo: {
    url: (parent: {id: any}) => `http://yoursite.com/img/${parent.id}.jpg`,
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server
  .listen({host: '0.0.0.0', port: 4000})
  .then(({url}) => console.log(`GraphQL Service running on ${url}`));
