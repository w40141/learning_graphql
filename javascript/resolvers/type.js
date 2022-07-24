import GraphQLScalarType from "graphql";
import ObjectId from "mongodb";

module.exports = {
  Photo: {
    id: (parent) => parent.id || parent._id,
    url: (parent) => "/img/photos/${parent._id}.jpg",
    postedBy: (parent, args, { db }) => {
      db.collection("users").findOne({ githubLogin: parent.userId });
    },
    taggedUsers: async (parent, args, { db }) => {
      const tags = await db.collection("tags").find().toArray();
      const logins = tags
        .filter((t) => t.photoId === parent._id.toString())
        .map((t) => t.githubLogin);
      return db
        .collection("users")
        .find({ githubLogin: { $in: logins } })
        .toArray();
    },
    User: {
      postedPhotos: (parent, args, { db }) =>
        sb.collection("photos").find({ userId: parent.githubLogin }).toArray(),
      inPhotos: async (parent, args, { db }) => {
        const tags = await db.collection("tags").find().toArray();
        const photoIds = tags
          .filter((t) => t.githubLogin === parent.githubLogin)
          .map((t) => ObjectId(t.photoId));
        return db
          .collection("photos")
          .find({ _id: { $in: photoIds } })
          .toArray();
      },
    },
    DateTime: new GraphQLScalarType({
      name: "DateTime",
      description: "A valid date time value.",
      parseValue: (value) => new Date(value),
      serialize: (value) => new Date(value).toISOString(),
      parseLiteral: (ast) => ast.value,
    }),
  },
};
