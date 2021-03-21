import React, {useState} from 'react'
import gql from 'graphql-tag'
import PetBox from '../components/PetBox'
import NewPet from '../components/NewPet'
import { useQuery, useMutation } from '@apollo/react-hooks'
import Loader from '../components/Loader'

const ALL_PETS = gql`
    query Pets {
        pets {
            name,
            id,
            type,
            img
            }
    }
`
const ADD_PET = gql`
  mutation CreateAPet($newPet: CreatePetInput!) {
    createPet(input: $newPet){
      id,
      name,
      type,
      img
    }
  }
`
export default function Pets () {
  const [modal, setModal] = useState(false)
  //The function component will rerender when any one of the below states change
  const {data, loading, error} = useQuery(ALL_PETS)

  //useMutation doesn't run on caling it, unlike the useQuery. It runs when the function in the argument is invoked
  //'createPet' 
  const [createPet, {data: d, loading: l, error: e}] = useMutation(ADD_PET, {
    //We can pass in an optional updater function which will be invoked after the mutatation completes on server
    //Here we wil be called with the inter Apollo cache and the response fron the mutation
    //We will now update the query in the local cache to the latest response to keep them in sync
    //This will cause a rerender of the component
    update(cache, {data: {createPet}}) {
      const data = cache.readQuery({query: ALL_PETS})
      cache.writeQuery({
        query: ALL_PETS,
        data: {pets: [createPet, ...data.pets]}
      })
    }
  })

  if(loading || l) 
    return <Loader> </Loader>

  if(error || e)
    return <p>{error}</p>

  const onSubmit = input => {
    setModal(false)
    createPet({variables: {newPet: input}})
  }
  console.log(data.pets)
  const pets = data && data.pets
  const petsList = pets.map(pet => (
    <div className="col-xs-12 col-md-4 col" key={pet.id}>
      <div className="box">
        <PetBox pet={pet} />
      </div>
    </div>
  ))
  
  if (modal) {
    return (
      <div className="row center-xs">
        <div className="col-xs-8">
          <NewPet onSubmit={onSubmit} onCancel={() => setModal(false)}/>
        </div>
      </div>
    )
  }

  return (
    <div className="page pets-page">
      <section>
        <div className="row betwee-xs middle-xs">
          <div className="col-xs-10">
            <h1>Pets</h1>
          </div>

          <div className="col-xs-2">
            <button onClick={() => setModal(true)}>new pet</button>
          </div>
        </div>
      </section>
      <section>
        <div className="row">
          {petsList}
        </div>
      </section>
    </div>
  )
}
