import {
  Box,
  Button,
  CircularProgress,
  Flex,
  Input,
  Spacer,
  Text,
  VStack
} from '@chakra-ui/react';
import { DeepNamespaceProvider, MinilinksProvider, useDeep, useTokenController, getServerSidePropsDeep, useDeepPath, useDeepToken } from '@deep-foundation/deeplinks';
import { AutoGuest, ColorMode, getServerSidePropsPreload, GoProvider, useGoCore, usePreload } from '@deep-foundation/perception-imports';
import isEqual from 'lodash/isEqual';
import { useTranslation } from 'next-i18next';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { HotkeysProvider } from 'react-hotkeys-hook';
import { GrUserAdmin } from "react-icons/gr";
import { IoMdPersonAdd } from "react-icons/io";
import { IoEnterOutline, IoExitOutline } from "react-icons/io5";
import { useAsyncMemo } from 'use-async-memo';
import { Graph, GraphEdge, GraphNode, GraphStyle, useGraph } from '../imports/graph';
import { Mounted } from '../imports/mounted';
import { Wysiwyg } from '../imports/wysiwyg';
import { i18nGetStaticProps } from '../src/i18n';


const dpl = '@deep-foundation/perception-links';
const dc = '@deep-foundation/core';

export function usePathState(defaultValue) {
  // return useQueryStore('orientation', defaultValue);
  return useState(defaultValue);
}

export const StatusWithDeep = memo(function StatusWithDeep() {
  const deep = useDeep();
  // @ts-ignore
  const status = deep?.client?.useApolloNetworkStatus();
  return <>
    <CircularProgress
      size="1em" isIndeterminate={!!status.numPendingQueries} value={100} color={(deep && deep?.linkId) ? 'deepColorActive' : 'red'}
    />
    <Text size="xxs" position='absolute' top='0.5em' right='0.5em'>
      {status.numPendingQueries}
    </Text>
  </>;
}, () => true);

export function Status() {
  const deep = useDeep();
  return <>
    {deep ? <StatusWithDeep/> : <CircularProgress
      size="1em" isIndeterminate={false} value={100} color={(deep && deep?.linkId) ? 'deepColorActive' : 'red'}
    />}
  </>;
}

export function Auth() {
  const deep = useDeep();
  const [path, setPath] = useDeepPath();
  const [token, setToken] = useTokenController();
  const [_path, _setPath] = useState('');
  const [_token, _setToken] = useState('');

  useEffect(() => {
    if (path) _setPath(path);
    if (token) _setToken(token);
  }, [path, token]);

  const enter = useCallback(() => {
    setPath(_path);
    setToken(_token);
  }, [_path, _token]);

  const [canAdmin, setCanAdmin] = useState(false);

  useEffect(() => {
    if (deep && deep?.linkId) {
      deep.can(deep.linkId, deep.linkId, deep.idLocal('@deep-foundation/core', 'AllowAdmin')).then(admin => {
        if (admin) setCanAdmin(false);
        else deep.can(380, deep.linkId, deep.idLocal('@deep-foundation/core', 'AllowLogin')).then(can => setCanAdmin(can));
      });
    }
  }, [deep, deep?.linkId]);

  const user = deep.useLink(deep.linkId);

  return <Box display='inline-flex' h='3em' role="group">
    <Button
      w='3em' h='3em'
    >{deep ? <IoExitOutline /> : <IoEnterOutline/>}</Button>
    <Box
      _groupHover={{ left: '0%' }}
      boxShadow='dark-lg'
      zIndex={1}
      position='absolute' left='-35em' bottom='0px' w={canAdmin ? '15em' : '15em'}
      transition='all 1s ease' overflow="hidden"
      p='1em'
      bg="deepBg"
    >
      {!!deep?.linkId && !!user?.name && <Box color='deepColorActive' textAlign='center' p='0.5em'>{''+user?.name}</Box>}
      <VStack spacing={'1em'} mb='1em'>
        <Input value={_path} onChange={e => _setPath(e.target.value)} placeholder="path" w='100%' size='md' onKeyDown={e => e.key === 'Enter' && enter()}/>
        <Input value={_token} onChange={e => _setToken(e.target.value)} placeholder="token" w='100%' size='md' onKeyDown={e => e.key === 'Enter' && enter()}/>
      </VStack>
      <Flex>
        <Spacer/>
        <Button variant="active" w="3em" h="3em" onClick={enter}>
          <IoEnterOutline/>
        </Button>
        {canAdmin && <Button w="3em" h="3em" onClick={() => {
          deep.id('deep', 'admin').then(admin => deep.login({ linkId: admin }));
        }}>
          <GrUserAdmin/>
        </Button>}
        {!!deep.linkId && <Button w="3em" h="3em" onClick={() => {
          deep.guest();
        }}>
          <IoMdPersonAdd/>
        </Button>}
        <Button variant='danger' w="3em" h="3em" onClick={() => {
          setPath('');
          setToken('');
        }}>
          <IoExitOutline/>
        </Button>
      </Flex>
    </Box>
  </Box>;
}
  
export const GoLayout = memo(function GoLayout() {
  const deep = useDeep();
  const go = useGoCore();
  return <>
    <go.Handler
      linkId={deep?.linkId}
      handlerId={deep.idLocal(dpl, 'Layout')}
      Auth={Auth}
      Status={Status}
      ColorMode={ColorMode}
    />
  </>;
}, isEqual)

export const Content = memo(function Content() {
  const deep = useDeep();
  const { t } = useTranslation();
  const [isPreloaded, reloadPreloads] = usePreload();

  useEffect(() => {
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

      deep.handleOperation = (operation, query, value, options) => {
        console.log('handleOperation', operation, options);
        if (operation === 'delete' || operation === 'update') options.local = true;
      };
    }
  }, [deep]);

  const user = useAsyncMemo(async () => {
    if (deep?.linkId) return (await deep.select({ id: deep.linkId }, { apply: 'user' })).data?.[0];
  }, [deep]);

  return (<>
    {/* {!!deep && <Packages/>} */}
    {!!isPreloaded && user && [<GoProvider key={deep.linkId} linkId={deep.idLocal(dpl, 'Layout')} hotkeys>
      <GoLayout/>
    </GoProvider>]}
  </>);
}, () => true);

export default function Page({
  preloaded,
}: {
  preloaded?: any;
}) {
  return (<>
    <Content/>
  </>);
};

// import _preloaded from '../imports/preloaded.js';
// export async function getStaticProps(arg) {
//   const result: any = await i18nGetStaticProps(arg);
//   result.props = result?.props || {};
//   result.props.preloaded = _preloaded;
//   return result;
// }

export async function getServerSideProps(arg: any) {
  const result: any = {};
  await i18nGetStaticProps(arg, result);
  await getServerSidePropsPreload(arg, result);
  await getServerSidePropsDeep(arg, result);
  return result;
}
