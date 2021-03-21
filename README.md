### A simple full-stack graphql app with React app using apollo-client and a node server using apollo-server to manage Pets

To start an apollo server we first need to create schema and resolvers and pass that object to ApolloServer.

On the server, a shared context object i.e an object with key and values pairs and functions is shared amongs't all the resolvers. Whatever context() function returns, will be the shared context across resolvers. In this function We return an object which is the models object

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
//There's a relationship between the User and Pet
//A User can have Pets and a Pet can have a User

  type User {
      id: ID!
      username: String!
      pets: [Pet]!
  }

  type Pet{
      id: ID!
      createdAt: String
      name: String!
      type: String!
      img: String
      owner: User!
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

In our Query type, we have a query by name pets. This query accepts an ```input``` of some type. This query returns a type ```Pet```. This looks just like a function signature. It infact is a function signature for your resolver function which we are gonna define.

The same applies to the Mtation type. The only difference being the functions defined in this are going to mutate db.

### Resolver 
[Resolvers](https://github.com/AdityaDonthy/pets-fullstack-graphql/blob/master/api/src/resolvers.js) are like controllers on the rest API , they're responsible for actually retrieving data from a data source, whether it's a database in memory, Redis or rest API, wherever the data is, it's the resolver's job to go fetch that data. It's totally agnostic to how and where you fetch your data from. It could be a realtime firestore, or signalR or Mongo or another BFF, it doesn't matter. 
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

	
### Query resolver
For each field defined in the Query definition, there is a resolver function with the same name. We have a resolver for Pets which returns an array of Pets and we have a resolver for Pet which returns a single Pet. Let's see the signatire of a resolver
 . The first parameter(_) is the parent resolver. This is null if the resolvers are from Query definition
 . The second parameter is the 'arguments' a client passes while querying frm frontend
 . The third parameter is the context object that is passed during the server startup. We destructure data access models from Context
 
We return the data by calling our data access functions exposed on the model object
![image](https://user-images.githubusercontent.com/11058475/111899337-0c1b5000-8a52-11eb-81c5-686ab39a60b6.png)

### Mutation resolver
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

### Relationships
Thinking in graphs is basically saying your API is no longer a predefined list of operations where you always return the same shapes of data.

So for instance, in REST, you have to literally create all the routes, with these verbs, and a set of parameters, and maybe a set of query strings and they're predefined ahead of time that's the only thing your client can do. 

Well, in this graph implementation you have no idea how someone's gonna access your server and instead you just say, here are these nodes they look like these. If you notice the schema carefully, there's a 2 way relationship between a User and Pet. This is purely virtual, it doesn't exist in the serialized binary data.

Let's consider the relation between a Pet and a User -> A Pet can have an 'owner' which is of type User. GraphQL can't figure out what an owner is using the Pet Query as this is a virtual field that doen't exist physically. So we need to write a **Field Resolver**

### Field resolvers
Basically, if you're writing a resolver for a field that belongs to a type that is anything other than a query or a mutation, it's a field level resolver. 

Queries and Mutations are top level resolvers, nothing resolves before them. They happen first, everything comes after, which includes a field. So we're writing a field level resolver, so it means its first argument is gonna be the type that got resolved before it. In this case, the type that gets resolved before an 'owner' is always gonna be a 'Pet'.

```
Pet: {
    owner(pet, __, context) {
      console.log(`field level resolver runs and received a`, {pet})
      return context.models.User.findOne()
    }
  }
```

We register a resolver for a field ```owner``` on ```Pet```. We need to tell GraphQL how to resolve an ```owner``` that has a ```Pet```, so in here we need to resolve the ```User``` type

Unlike ```createPet and updatePet```, this is not on a Mutation but a Type. owner is in the Pet Type. The first argument is the actual Pet that get's resolved, meaning when someone asks for a Pet, the ```Pet``` QueryResolver is run first and then pass the resolved pet here. We could use that resolved data here

Unlike REST, your API is a set of nodes that know how to resolve themselves and have links to other nodes. This allows a client to ask for nodes and then follow those links to get related nodes. And that's basically nodes and edges inside of graph, and **that's the graph in GraphQL.**
