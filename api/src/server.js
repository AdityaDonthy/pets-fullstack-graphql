const { ApolloServer } = require('apollo-server')
const typeDefs = require('./schema')
const resolvers = require('./resolvers')
const {models, db} = require('./db')

//This is a shared context object i.e an object with key and values pairs and functions is shared amongs't all the resolvers.
//Whatever context() returns, will be the shared context.
//We return an object which is the models object

//Model has 2 properties exposed as Pet and User. These properties are set to a function that has the data access logic in it

//Another way to achieve this is to import the models directly in the resolvers, just like we are doing here on line 4.
//The advantage of passing the models directly is that we can mock the dal layer easily.
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context() {
    const user = models.User.findOne()
      return { models, db, user }
    }
  }
)

server.listen(4824).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
})
