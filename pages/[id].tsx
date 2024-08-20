import {
  Box
} from '@chakra-ui/react';
import { DeepNamespaceProvider, useDeep } from '@deep-foundation/deeplinks/imports/client';
import { MinilinksProvider } from '@deep-foundation/deeplinks/imports/minilinks';
import { AutoGuest } from '@deep-foundation/perception-imports/imports/auto-guest';
import { GoCustomProvider, GoProvider, useGoCore } from '@deep-foundation/perception-imports/imports/go';
import { PreloadProvider, usePreload } from '@deep-foundation/perception-imports/imports/hooks';
import { ReactHandlersProvider } from '@deep-foundation/perception-imports/imports/react-handler';
import isEqual from 'lodash/isEqual';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { memo, useEffect, useMemo, useState } from 'react';
import { HotkeysProvider } from 'react-hotkeys-hook';
import { Id } from '../deeplinks/imports/minilinks';
import { Graph, GraphEdge, GraphNode, GraphStyle, useGraph } from '../imports/graph';
import { Mounted } from '../imports/mounted';
import { requires } from '../imports/requires';
import { i18nGetStaticProps } from '../src/i18n';
import { useDeepPath } from '../src/provider';

import preloaded from '../imports/preloaded.js';
console.log('preloaded packages', preloaded?.packages?.length);
console.log('preloaded handlers', preloaded?.handlers?.length);

const dpl = '@deep-foundation/perception-links';
const dc = '@deep-foundation/core';

export function usePathState(defaultValue) {
  // return useQueryStore('orientation', defaultValue);
  return useState(defaultValue);
}

export const GoLayout = memo(function GoLayout({ handlerId }: { handlerId: Id }) {
  const deep = useDeep();
  const go = useGoCore();
  return <>
    <go.Handler
      linkId={deep?.linkId}
      handlerId={handlerId}
    />
  </>;
}, isEqual)

export const Content = memo(function Content() {
  const deep = useDeep();
  const { t } = useTranslation();
  const [isPreloaded, reloadPreloads] = usePreload();
  const router = useRouter();

  if (deep) {
    deep.local = false;

    (global as any).deep = deep;
    (global as any).ml = deep?.minilinks;

    if (typeof(window) === 'object') {
      // @ts-ignore
      if (!window.deep) console.log('deep', deep);
      // @ts-ignore
      window.deep = deep;
      // @ts-ignore
      window.require = require;
    }
  }

  useEffect(() => {
    if (deep) deep.select({ id: deep.linkId }, { apply: 'user' });
  }, [deep]);

  return (<>
    {/* {!!deep && <Packages/>} */}
    <Box>{+deep.linkId}</Box>
    <Box>{+router?.query?.id}</Box>
    {!!isPreloaded && [<GoProvider key={deep.linkId} linkId={+router?.query?.id} hotkeys>
      {/* <GoLayout handlerId={+router?.query?.id}/> */}
    </GoProvider>]}
  </>);
}, () => true);

export default function Page({
  defaultPath,
  defaultSsl,
  serverUrl,
  deeplinksUrl,
  appVersion,
  disableConnector,
}: {
  defaultPath: string;
  defaultSsl: boolean;
  serverUrl: string;
  deeplinksUrl: string;
  appVersion: string;
  disableConnector: boolean;
}) {
  const [path, setPath] = useDeepPath(defaultPath);
  const [ssl, setSsl] = useState(defaultSsl);
  const [portal, setPortal] = useState(true);
  
  const customGo = useMemo(() => ({ Graph, GraphEdge, GraphNode, GraphStyle, useGraph }), []);

  return (<>
    <HotkeysProvider>
      <DeepNamespaceProvider>
        <MinilinksProvider>
          <AutoGuest/>
          <Mounted>
            <PreloadProvider preloaded={preloaded}>
              <ReactHandlersProvider requires={requires} sync={true}>
                <GoCustomProvider value={customGo}>
                  <Content/>
                </GoCustomProvider>
              </ReactHandlersProvider>
            </PreloadProvider>
          </Mounted>
        </MinilinksProvider>
      </DeepNamespaceProvider>
    </HotkeysProvider>
  </>);
};

export async function getStaticProps(arg) {
  const result: any = await i18nGetStaticProps(arg);
  result.props = result?.props || {};
  return result;
}

export async function getStaticPaths() {
  console.log(preloaded?.handlers ? preloaded?.handlers.map(h => `/${h.handler_id}`) : []);
  return {
    paths: preloaded?.handlers ? preloaded?.handlers.map(h => `/${h.handler_id}`) : [],
    fallback: true
  }
}