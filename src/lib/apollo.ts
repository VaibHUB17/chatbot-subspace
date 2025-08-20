import { ApolloClient, InMemoryCache, createHttpLink, split, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { onError } from '@apollo/client/link/error';
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
        Authorization: `Bearer ${nhost.auth.getAccessToken()}`,
      },
    }),
  })
);

const authLink = setContext((_, { headers }) => {
  const token = nhost.auth.getAccessToken();
  
  return {
    headers: {
      ...headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };
});

// Add error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      console.error(
        `[GraphQL error]: Message: ${err.message}, Location: ${err.locations}, Path: ${err.path}`,
        err
      );
      
      // You can handle specific error cases here if needed
    }
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    // Check for specific network error patterns
    const errorMessage = networkError.message || '';
    if (errorMessage.includes('not a valid json response from webhook')) {
      console.warn('Rate limit likely exceeded');
      // Note: We handle the UI update in the component
    }
  }
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
  from([errorLink, authLink.concat(httpLink)])
);

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});