import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import gql from 'graphql-tag'


const link = new HttpLink({uri: 'http://localhost:4824/'})
const cache = new InMemoryCache()

//These are the client types that are extended from the server types - > Say the computed ones
const typeDefs = gql`
  extend type Pet {
    vaccinated: Boolean!
  }
`

//This is a resolver for Pet, just like we wrote one on the Server but will be run on the client side
//This is what it means to run graphql on the browser!
const resolvers = {
  Pet: {
    vaccinated() {
      return true;
    }
  }
}

const client = new ApolloClient({
    cache,
    link,
    typeDefs,
    resolvers
  })

const query = gql`

    query Pets {
        pets {
            name,
            id,
            type
            }
    }
`

//client.query({query}).then(res => console.log(res))

export default client
