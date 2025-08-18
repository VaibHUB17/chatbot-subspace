import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { nhost } from './nhost';

const httpLink = createHttpLink({
  uri: `${nhost.graphql.getUrl()}`,
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: nhost.graphql.getUrl().replace('http', 'ws'),
    connectionParams: () => ({
      headers: {
        Authorization: `Bearer ${nhost.auth.getJWTToken()}`,
      },
    }),
  })
);

const authLink = setContext((_, { headers }) => {
  const token = nhost.auth.getJWTToken();
  
  return {
    headers: {
      ...headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});