import {ApolloServer} from 'apollo-server';
import {GraphQLScalarType} from 'graphql';

const typeDefs = `
        scalar DateTime
        enum PhotoCategory {
                SELECT
                PORTRAIT
                ACTION
                LANDSCAPE
                GRAPHIC
        }

        type User {
                githubLogin: ID!
                name: String
                avatar: String
                postedPhotos: [Photo!]!
                inPhotos: [Photo!]!
        }

        type Photo {
                id: ID!
                url: String!
                name: String!
                description: String
                category: PhotoCategory!
                postedBy: User!
                taggedUsers: [User!]!
                created: DateTime!
        }

        type Query {
                totalPhoto: Int!
                allPhotos(after: DateTime): [Photo!]!
        }

        input PostPhotoInput {
                name: String!
                category: PhotoCategory=PORTRAIT
                description: String
        }

        type Mutation {
                postPhoto(input: PostPhotoInput!): Photo!
        }
`;

let _id = 0;
const users: Array<{githubLogin: string; name: string}> = [
  {githubLogin: 'mHattrup', name: 'Mike Hattrup'},
  {githubLogin: 'gPlake', name: 'Glen Plake'},
  {githubLogin: 'sSchmidt', name: 'Scot Schmidt'},
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
    id: '1',
    name: 'Dropping the Heart Chute',
    description: 'The heart chute is one of my favorite chutes',
    category: 'ACTION',
    githubUser: 'gPlake',
    created: '3-28-1977',
  },
  {
    id: '2',
    name: 'Enjoying the sunshine',
    category: 'SELFIE',
    githubUser: 'sSchmidt',
    created: '1-2-1985',
  },
  {
    id: '3',
    name: 'Gunbarrel 25',
    description: '25 laps on gunbarrel today',
    category: 'LANDSCAPE',
    githubUser: 'sSchmidt',
    created: '2018-04-15T19:09:57.3082Z',
  },
];

const tags: Array<{photoID: string; userID: string}> = [
  {photoID: '1', userID: 'gPlake'},
  {photoID: '2', userID: 'sSchmidt'},
  {photoID: '2', userID: 'mHattrup'},
  {photoID: '2', userID: 'gPlake'},
];

const resolvers = {
  Query: {
    totalPhoto: () => photos.length,
    allPhotos: () => photos,
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
    url: (parent: {id: string}) => `http://yoursite.com/img/${parent.id}.jpg`,
    postedBy: (parent: {githubUser: string}) => {
      return users.find(u => u.githubLogin === parent.githubUser);
    },
    taggedUsers: (parent: {id: string}) => {
      return tags
        .filter(tag => tag.photoID === parent.id)
        .map(tag => tag.userID)
        .map(userID => users.find(u => u.githubLogin === userID));
    },
  },

  User: {
    postedPhotos: (parent: {githubLogin: string}) => {
      return photos.filter(p => p.githubUser === parent.githubLogin);
    },
    inPhotos: (parent: {id: string}) => {
      tags
        .filter(tag => tag.userID === parent.id)
        .map(tag => tag.photoID)
        .map(photoID => photos.find(p => p.id === photoID));
    },
  },

  DateTime: new GraphQLScalarType({
    name: 'DateTime',
    description: 'A valid date time value.',
    serialize: (value: any) => new Date(value).toISOString(),
    parseValue: (value: any) => new Date(value),
    parseLiteral: (ast: any) => ast.value,
  }),
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server
  .listen({host: '0.0.0.0', port: 4000})
  .then(({url}) => console.log(`GraphQL Service running on ${url}`));
