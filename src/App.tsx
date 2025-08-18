import React from 'react';
import { NhostProvider } from '@nhost/react';
import { ApolloProvider } from '@apollo/client';
import { nhost } from './lib/nhost';
import { apolloClient } from './lib/apollo';
import { AppContent } from './components/AppContent';

function App() {
  return (
    <NhostProvider nhost={nhost}>
      <ApolloProvider client={apolloClient}>
        <AppContent />
      </ApolloProvider>
    </NhostProvider>
  );
}

export default App;