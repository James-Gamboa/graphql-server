import { ApolloServer, UserInputError, gql } from "apollo-server";
import { v1 as uuid } from "uuid";
import axios from "axios";

let personsFromRestApi = [];

const typeDefs = gql`
  enum YesNo {
    YES
    NO
  }

  type Address {
    street: String!
    city: String!
  }

  type Person {
    name: String!
    phone: String
    address: Address!
    canDrink: Boolean!
    id: ID!
  }

  type Query {
    personCount: Int!
    allPersons(phone: YesNo): [Person]!
    findPerson(name: String!): Person
  }

  type Mutation {
    addPerson(
      name: String!
      phone: String!
      street: String!
      city: String!
    ): Person
    editNumber(name: String!, phone: String!): Person
  }
`;

const resolvers = {
  Query: {
    personCount: () => personsFromRestApi.length,
    allPersons: async (root, args) => {
      const { data } = await axios.get("http://localhost:3000/persons");
      personsFromRestApi = data;
      if (!args.phone) return personsFromRestApi;
      const byPhone = (person) =>
        args.phone === "YES" ? person.phone : !person.phone;
      return personsFromRestApi.filter(byPhone);
    },
    findPerson: (root, args) => {
      const { name } = args;
      return personsFromRestApi.find((person) => person.name === name);
    },
  },
  Mutation: {
    addPerson: (root, args) => {
      if (personsFromRestApi.find((p) => p.name === args.name)) {
        throw new UserInputError("Name must be unique", {
          invalidArgs: args.name,
        });
      }
      const person = { ...args, id: uuid() };
      personsFromRestApi.push(person);
      return person;
    },
    editNumber: (root, args) => {
      const personIndex = personsFromRestApi.findIndex(
        (p) => p.name === args.name
      );
      if (personIndex === -1) return null;
      const person = personsFromRestApi[personIndex];
      const updatedPerson = { ...person, phone: args.phone };
      personsFromRestApi[personIndex] = updatedPerson;
      return updatedPerson;
    },
  },
  Person: {
    canDrink: (root) => root.age > 18,
    address: (root) => {
      return {
        street: root.street,
        city: root.city,
      };
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
