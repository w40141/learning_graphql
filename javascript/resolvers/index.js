import './query.js'
import './mutation.js'
import './type.js'

const resolvers = {
  Query,
  Mutation,
  ...Type
}

module.exports= resolvers;
