const { gql } = require('apollo-server')

/**
 * Type Definitions for our Schema using the SDL.
 */
const typeDefs = gql`
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
      owner: User!
  }
  type Shoe{
    name: String!
    size: Int!
  }
  
  input ShoesInput{
    size: Int!
  }
  
  input PetsInput{
    type: String
  }
  
  input CreatePetInput{
    type: String!
    name: String!
  }
  
  input UpdatePetInput{
    ID: String!
    name: String!
  }
  
  input PetInput{
    name: String
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
`;

module.exports = typeDefs
