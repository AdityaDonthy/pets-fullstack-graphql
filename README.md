### A simple full-stack graphql React client with apollo-client and a apollo-server node server to manage Pets

To start an apollo server we first need to create schema and resolvers and pass that object to ApolloServer
On the server, a shared context object i.e an object with key and values pairs and functions is shared amongs't all the resolvers.
Whatever context() function returns, will be the shared context across resolvers.
In this function We return an object which is the models object

What is a 'Model' ? [model](https://github.com/AdityaDonthy/pets-fullstack-graphql/blob/master/api/src/db/pet.js) is responsible for talking to the db. This is basically the 'repository pattern' if you think about it. All the data access logic encapsulated inside an object!


```
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context() {
    const user = models.User.findOne()
      return { models, db, user }
    }
  }
) 
```
We then simply start the apollo server
```
server.listen(4824).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
})
```
We also need to define a [schema](https://github.com/AdityaDonthy/pets-fullstack-graphql/blob/master/api/src/schema.js) on the server which describes the data we are exposing from our server. You're gonna create types, those types are usually based off on shapes in your database.
We could also have virtual fields here, meaning these fields don't exist directly in the db but are computed on the server and exposed in the api.

We have to define
<ol>
  <li> type <li/>
  <li> input <li/>
  <li> query <li/>
  <li> mutation <li/>
</ol>

Example :
```
type Pet{
      id: ID!
      createdAt: String
      name: String!
      type: String!
      owner: User!
      img: String
  }
  
type Query {
      pets(input: PetsInput): [Pet]!
      shoes(input: ShoesInput): [Shoe]!
      pet(input: PetInput): Pet!
  }
  
  type Mutation {
    createPet(input: CreatePetInput!): Pet!
    updatePet(input: UpdatePetInput): Pet!
  }
```

In our Query type, we have a query by name pets. This query accepts an 'input' of some type. This qery returns a type 'Pet'. This looks just like a function signature. It infact is a function signature for your resolver function which we are gonna define.

The same applies to the Mtation type. The only difference being the functions defined in this are going to mutate db.

###Resolver 
Resolvers are like controllers on the rest API , they're responsible for actually retrieving data from a data source, whether it's a database in memory, Redis or rest API, wherever the data is, it's the resolver's job to go fetch that data. It's totally agnostic to how and where you fetch your data from. It could be a realtime firestore, or signalR or Mongo or another BFF, it doesn't matter. 
```
  Query: {
    pets(_, {input}, {models}) {
      console.log('Everytime someone queries for `pets`, this function is run')
      return models.Pet.findMany(input)
    },
    
    pet(_,{input}, {models}){
      console.log('Everytime someone queries for a `pet`, this function is run')
      return models.Pet.findOne(input);
    },
  }
```

	
###Query resolver
For each field defined in the Query definition, there is a resolver function with the same name. We have a resolver for Pets which returns an array of Pets and we have a resolver for Pet which returns a single Pet. Let's see the signatire of a resolver
 . The first parameter(_) is the parent resolver. This is null if the resolvers are from Query definition
 . The second parameter is the 'arguments' a client passes while querying frm frontend
 . The third parameter is the context object that is passed during the server startup. We destructure data access models from Context
 
We return the data by calling our data access functions exposed on the model object

###Mutation resolver
Just like for queries, we wrte reolvers for our mutations. Below is an example to create and update a Pet
```
Mutation: {
    createPet(_,{input}, context) {
      return context.models.Pet.create(input);
    },

    updatePet(_,{input}, {models}) {
      return {
        ...input
      }
    }
  }
 ```
If mutations are creating things, what do they return? Well, that's up to you and your application and your use case. It's a good habit of always returning the thing that we mutated. So if I created something, I return that. If I updated something, I return that after I updated it so the client knows for sure. 
