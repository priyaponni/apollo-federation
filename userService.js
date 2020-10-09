const { ApolloServer, gql } = require('apollo-server');
const { buildFederatedSchema } = require('@apollo/federation');

const typeDefs = gql`
  type Query {
    me(id: ID): User
  }

  type User @key(fields: "id"){
    id: ID!
    username: String
    name: String
    location: String
  }
`;

const users = {
    1: { id: 1, username: "@ava", name: "Ava", location: "San Jose" },
    2: { id: 2, username: "@priya", name: "Priya", location: "San Fransisco" }
}

const resolvers = {
  Query: {
    me(obj, args, context, info) {
        console.log('*** me query ---- ' + args.id);
        console.log(users);
      return users[args.id]
    }
  },
  User: {
    __resolveReference(user, { fetchUserById }){
        console.log('*** getting user');
        console.log(users[user.id]);
      return users[user.id]
    }
  }
}

const server = new ApolloServer({
  schema: buildFederatedSchema([{ typeDefs, resolvers }])
});


server.listen(4001).then(({ url }) => {
    console.log(`🚀 User: Implementation service 1 ready at ${url}`);
});
