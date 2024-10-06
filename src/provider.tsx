import { useRouter } from 'next/router';
import { ChakraProvider } from '@chakra-ui/react';
import { DeepProvider, DeepNamespaceProvider, MinilinksProvider, TokenProvider, useTokenController } from '@deep-foundation/deeplinks';
import { ApolloClientTokenizedProvider } from '@deep-foundation/react-hasura/apollo-client-tokenized-provider';
// import { CapacitorStoreProvider } from '@deep-foundation/store/capacitor';
import { CookiesStoreProvider } from '@deep-foundation/store/cookies';
import { LocalStoreProvider, useLocalStore } from '@deep-foundation/store/local';
import { QueryStoreProvider } from '@deep-foundation/store/query';
import { CustomI18nProvider } from './i18n';
import { AutoGuest, GoCustomProvider, PreloadProvider, ReactHandlersProvider, theme } from '@deep-foundation/perception-imports';
import { memo, useEffect, useMemo } from 'react';
import { requires } from '../imports/requires';
import { Mounted } from '../imports/mounted';
import dynamic from 'next/dynamic.js';
import { HotkeysProvider } from 'react-hotkeys-hook';

import { Graph, GraphEdge, GraphNode, GraphStyle, useGraph } from '../imports/graph';
import { Wysiwyg } from '../imports/wysiwyg';

export const Editor = dynamic(() => import('@deep-foundation/perception-imports/imports/editor').then(m => m.Editor), {
  loading: () => <></>,
})

export function Provider({
  children,
  preloaded,
  path,
  token,
  secret,
  ws,
  ssl,
}: {
  children: JSX.Element;
  preloaded?: any;
  path: string;
  token?: string;
  secret?: string;
  ws?: boolean;
  ssl?: boolean;
}) {
  const customGo = useMemo(() => ({
    Graph, GraphEdge, GraphNode, GraphStyle, useGraph,
    Wysiwyg, Editor
  }), []);

  return (<>
    <ChakraProvider theme={theme}>
      <QueryStoreProvider useRouter={useRouter}>
        <CookiesStoreProvider>
          <LocalStoreProvider>
            <TokenProvider>
              <DeepProvider path={path} token={token} secret={secret} ws={ws} ssl={ssl}>
                <HotkeysProvider>
                  <DeepNamespaceProvider>
                    <MinilinksProvider>
                      <AutoGuest/>
                      <Mounted>
                        <GoCustomProvider value={customGo}>
                          <PreloadProvider preloaded={preloaded}>
                            <ReactHandlersProvider requires={requires} sync={false}>
                              {children}
                            </ReactHandlersProvider>
                          </PreloadProvider>
                        </GoCustomProvider>
                      </Mounted>
                    </MinilinksProvider>
                  </DeepNamespaceProvider>
                </HotkeysProvider>
              </DeepProvider>
            </TokenProvider>
          </LocalStoreProvider>
        </CookiesStoreProvider>
      </QueryStoreProvider>
    </ChakraProvider>
  </>);
};