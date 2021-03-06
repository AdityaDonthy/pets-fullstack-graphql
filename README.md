### A simple full-stack graphql app with React app using apollo-client and a node server using apollo-server to manage Pets

## Server

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

On server side we define the following things
<li> Type Definitions </li>
<li> Query Definitions </li>
<li> Mutation Definitions </li>
<li> Resolvers </li>


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
 <li>The first parameter(_) is the parent resolver. This is null if the resolvers are from Query definition </li>
 <li> The second parameter is the 'arguments' a client passes while querying frm frontend </li>
 <li>The third parameter is the context object that is passed during the server startup. We destructure data access models from Context </li>
 
We return the data by calling our data access functions exposed on the model object

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

## Client

On the client side we use apollo-client. We need to create a client as shown below
```
const client = new ApolloClient({
  cache,
  link,
  typeDefs,
  resolvers,
});

const query = gql`
  query Pets {
    pets {
      name
      id
      type
    }
  }
`;

client.query({query}).then(res => console.log(res))

```

Once the client is created, it needs to be passed to our App. We do this using the React's context as shown below.

```
<ApolloProvider client={client}>
      <App />
</ApolloProvider>
```

The above code we create a client and then query and log the results. It's that simple! We have a [Pets]() page component which renders 2 ui components ```NewPet``` and ```PetBox``` . In this component we also Query for data, i.e the ```Pets``` stored in our db and also a mutation, when we create a ```Pet```. To achieve this we use hooks provided by Apollo. 

### useQuery
The useQuery React hook is the primary API for executing queries in an Apollo application. To run a query within a React component, call useQuery and pass it a GraphQL query string. When your component renders, useQuery returns an object from Apollo Client that contains loading, error, and data properties you can use to render your UI.
```
const ALL_PETS = gql`
  query Pets {
    pets {
      name
      id
      type
      img
    }
  }
`;
```
We use it in the component as shown below. We pass the ```ALL_PETS``` query to ```useQuery``` . This hook returns an object with the properties loading, error, and data

```
  //The function component will rerender when any one of the below states change
  const { data, loading, error } = useQuery(ALL_PETS);
```

### useMutation
The ```useMutation``` React hook is the primary API for executing mutations in an Apollo application. To run a mutation, you first call useMutation within a React component and pass it a GraphQL string that represents the mutation. When your component renders, useMutation returns a tuple that includes:

<li>A mutate function that you can call at any time to execute the mutation</li>
<li>An object with fields that represent the current status of the mutation's execution</li>

```
 //useMutation doesn't run on caling it, unlike the useQuery. It runs when the function in the argument is invoked 'createPet'
  
 const [createPet, { data: d, loading: l, error: e }] = useMutation(ADD_PET, {
    //We can pass in an optional updater function which will be invoked after the mutatation completes on server
    //This function will be invoked with the internal Apollo cache and the response from the mutation
    //We will now update the query in the local cache to the latest response to keep them in sync
    //This will cause a rerender of the component
    
    update(cache, { data: { createPet } }) {
      const data = cache.readQuery({ query: ALL_PETS });
      cache.writeQuery({
        query: ALL_PETS,
        data: { pets: [createPet, ...data.pets] },
      });
    },
  });
```

In the above code we have deined a mutation and also defined the caching strategy. This is run once the mutation on the server completes successfully. We are updating the locl cache with the data that was updated on server by this mutation. 

We invoke the mutatin when someone fills out the Pet form and hits Submit
```
  const onSubmit = (input) => {
    setModal(false);
    createPet({ variables: { newPet: input } });
  };
```
