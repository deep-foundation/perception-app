import { useRouter } from 'next/router';
import { ChakraProvider } from '@chakra-ui/react';
import { DeepProvider, TokenProvider, useTokenController } from '@deep-foundation/deeplinks';
import { ApolloClientTokenizedProvider } from '@deep-foundation/react-hasura/apollo-client-tokenized-provider';
import { CapacitorStoreProvider } from '@deep-foundation/store/capacitor';
import { CookiesStoreProvider } from '@deep-foundation/store/cookies';
import { LocalStoreProvider, useLocalStore } from '@deep-foundation/store/local';
import { QueryStoreProvider } from '@deep-foundation/store/query';
import { CustomI18nProvider } from './i18n';
import { theme } from '@deep-foundation/perception-imports';
import { memo, useEffect } from 'react';

export function useDeepPath(defaultValue: string | undefined = process?.env?.NEXT_PUBLIC_GRAPHQL_URL) {
  return useLocalStore('dc-dg-path', defaultValue);
}
export function useDeepToken(defaultValue: string | undefined = process?.env?.NEXT_PUBLIC_DEEP_TOKEN) {
  return useTokenController(defaultValue);
}

export const ProviderCore = memo(function ProviderCore({
  children,
}: {
  children: JSX.Element;
}) {
  const [connection, setConnection] = useDeepPath();

  let options;
  try {
    options = {
      client: "@deep-foundation/perception-app",
      ...(connection && {
        path:
          new URL(connection).host +
          new URL(connection).pathname +
          new URL(connection).search +
          new URL(connection).hash,
        ssl: new URL(connection).protocol === "https:",
      }),
      ws: !!process?.browser,
    };
  } catch(e) {}

  return (
    <>
      {!!connection && !!options ? (
        <ApolloClientTokenizedProvider
          options={options}
        >
          <DeepProvider>
            {children}
          </DeepProvider>
        </ApolloClientTokenizedProvider>
      ) : <>{children}</>}
    </>
  );
}, () => true);

export function Provider({
  children,
}: {
  children: JSX.Element;
}) {
  return (<>
    <ChakraProvider theme={theme}>
      <QueryStoreProvider useRouter={useRouter}>
        <CookiesStoreProvider>
          <LocalStoreProvider>
            <TokenProvider>
              <ProviderCore>
                <CustomI18nProvider>
                  {children}
                </CustomI18nProvider>
              </ProviderCore>
            </TokenProvider>
          </LocalStoreProvider>
        </CookiesStoreProvider>
      </QueryStoreProvider>
    </ChakraProvider>
  </>);
};