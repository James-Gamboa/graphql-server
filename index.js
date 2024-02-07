import { ApolloServer, UserInputError, gql } from "apollo-server";
import { v1 as uuid } from "uuid";

const persons = [
  {
    name: "Rocky",
    age: "11",
    phone: "034-1234567",
    street: "Calle Frontend",
    city: "Guarari",
    id: "3d594650-3436-11e9-bc57-8b80ba54c431",
  },
  {
    name: "James",
    age: "23",
    phone: "044-123456",
    street: "Avenida Fullstack",
    city: "Heredia",
    id: "3d599470-3436-11e9-bc57-8b80ba54c431",
  },
  {
    name: "Cookie",
    age: "19",
    street: "Pasaje Testing",
    city: "Los lagos",
    id: "3d599471-3436-11e9-bc57-8b80ba54c431",
  },
];

const typeDefs = gql`
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
    allPersons: [Person]!
    findPerson(name: String!): Person
  }

  type Mutation {
    addPerson(
      name: String!
      phone: String!
      street: String!
      city: String!
    ): Person
  }
`;

const resolvers = {
  Query: {
    personCount: () => persons.length,
    allPersons: () => persons,
    findPerson: (root, args) => {
      const { name } = args;
      return persons.find((person) => person.name === name);
    },
  },
  Mutation: {
    addPerson: (root, args) => {
      if (persons.find((p) => p.name === args.name)) {
        throw new UserInputError("Name must be unique", {
          invalidArgs: args.name,
        });
      }
      // const { name, phone , street , city } = args
      const person = { ...args, id: uuid() };
      persons.push(person); //update database with new person
      return person;
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
  console.log(`listening on ${url}`);
});
