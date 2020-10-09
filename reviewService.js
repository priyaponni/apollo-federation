const { ApolloServer, gql } = require('apollo-server');
const { buildFederatedSchema } = require('@apollo/federation');
const fetch = require('node-fetch');

const typeDefs = gql`

  type Query {
    getUserReviews(id: ID! ): Review
    getUserService(id: ID!): User
    getFromGateway: User
  }
  type Review {
    body: String
    author: User @provides(fields: "username")
  }

   extend type User @key(fields: "id") {
      id: ID! @external
      reviews: [Review]
      username: String @external
   }
`;

const reviews = {
   1: { author: {id: 1}, body: 'User 1 review' },
   2: { author: {id: 2}, body: 'User 2 review' }
}

const resolvers = {
  Query: {
    getUserReviews(obj, args, context, info) {
        console.log('*** getUserReviews args -- ' + args.id);
        return reviews[args.id];
    },

    getUserService(obj, args, context, info) {
        const body = {query: `{me(id: ${args.id}){id, name, username, location}}`}
        fetch('http://localhost.paypal.com:4001/graphql', {
                method: 'post',
                body:  JSON.stringify(body),
                headers: { 'Content-Type': 'application/json' },
            })
            .then(res => res.text())
            .then(user => { 
                console.log('** response from user');
                console.log(user.data);
                const me = user.data.me;
                return {
                    ...me,
                    reviews: [reviews[args.id]] // just forming an array
                }
            });
    },

    getFromGateway() {
        const body = {query: `{me(id: ${args.id}){id, name, username, location}}`}
        fetch('http://localhost.paypal.com:4002/graphql', {
                method: 'post',
                body:  JSON.stringify(body),
                headers: { 'Content-Type': 'application/json' },
            })
            .then(res => res.text())
            .then(body => { 
                console.log('*** got response from gateway')
                console.log(body)
            });
        return {id: "1", username: "@ava"}
    }
  }
}

const server = new ApolloServer({
  schema: buildFederatedSchema([{ typeDefs, resolvers }])
});


server.listen(5001).then(({ url }) => {
    console.log(`🚀 Review: Implementation service 2 ready at ${url}`);
});
