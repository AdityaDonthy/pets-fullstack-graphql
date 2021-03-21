/**
 * Here are your Resolvers for your Schema. They must match
 * the type definitions in your schema
 */

module.exports = {
  //It's a Query Resolver with one resolver for fetching all the pets
  Query: {
    //For each field defined in the Query definition, there is a resolver function with the same name
    //The first parameter is the parent resolver. This is null if the resolvers are from Query definition
    //The second parameter is the 'arguments' a client passes while querying
    //The third parameter is the context object that is passed during the server startup. We destructure models from Context
    pets(_, {input}, {models}) {
      console.log('Everytime someone queries for `pets`, this function is run')
      return models.Pet.findMany(input)
    },
    
    pet(_,{input}, {models}){
      console.log('Everytime someone queries for a `pet`, this function is run')
      return models.Pet.findOne(input);
    },
    
    shoes(_, {input}, context) {
      return [{
        name: 'nike',
        size: 12
      },
        {
          name: 'adidas',
          size: 11
        }].filter(s => s.size === input.size)
    },
  },
  Mutation: {
    createPet(_,{input}, context) {
      return context.models.Pet.create(input);
    },

    updatePet(_,{input}, {models}) {
      return {
        ...input
      }
    }
  },
  Pet: {
    //Register a resolver for a field 'owner' on 'Pet'
    //We need to tell GraphQL how to resolve an owner that has a Pet, so in here I need to resolve the User type
    //This is a field level resolver, any resolver for a field that's on a type, that's other than the mutation or query.
    //Unlike createPet and updatePet, this is not on a Mutation but a Type. owner is in the Pet Type
    //The first argument is the actual Pet that get's resolved, meaning when someone asks for a Pet, first the 'Pet' QueryResolver
    // is run first and then pass the resolved pet here.
    owner(pet, __, context) {
      console.log(`field level resolver runs and received a`, {pet})
      return context.models.User.findOne()
    },
    img(pet) {
      return pet.type === 'DOG'
        ? 'https://placedog.net/300/300'
        : 'http://placekitten.com/300/300'
    }
  },
  User: {
    pets(user,__, context) {
      console.log('Inside a field level resolver fro the User', {user})
      return context.models.Pet.findMany();
    }
  }
}
