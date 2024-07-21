import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Center,
  CircularProgress,
  Flex,
  Grid,
  GridItem,
  Image,
  Input,
  Link,
  Spacer,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react';
import { DeepNamespaceProvider, useDeep } from '@deep-foundation/deeplinks/imports/client';
import { MinilinksProvider } from '@deep-foundation/deeplinks/imports/minilinks';
import { useTokenController } from '@deep-foundation/deeplinks/imports/react-token';
import { ColorMode } from '@deep-foundation/perception-imports/imports/theme';
import { useQueryStore } from '@deep-foundation/store/query';
import { useTranslation } from 'next-i18next';
import getConfig from 'next/config';
import { useRouter } from 'next/router';
import { memo, StrictMode, useCallback, useEffect, useState } from 'react';
import { GrUserAdmin } from "react-icons/gr";
import { FaVrCardboard } from "react-icons/fa6";
import { IoEnterOutline, IoExitOutline } from "react-icons/io5";
import { IoMdPersonAdd } from "react-icons/io";
import { GoWorkflow, GoX } from "react-icons/go";
import { PiGraphBold } from "react-icons/pi";
import { BsLightningChargeFill } from "react-icons/bs";
import { BsGrid1X2Fill } from "react-icons/bs";
import { FinderPopover, FinderProvider } from '../imports/finder.tsx';
import { LinkButton } from '../imports/link.tsx';
import { PathItemSearch, Tree } from '../imports/tree.tsx';
import { i18nGetStaticProps } from '../src/i18n.tsx';
import { useDeepPath } from '../src/provider.tsx';
import { Mounted } from '../imports/mounted.tsx';
import { HotkeysProvider } from 'react-hotkeys-hook';
import { Packages } from '../imports/packages.tsx';
import { AutoGuest } from '@deep-foundation/perception-imports/imports/auto-guest';
import { Dash } from '../imports/dash.tsx';
import { Orientation } from '../imports/orientation.tsx';

const { publicRuntimeConfig } = getConfig();

export const Tab = ({
  id, name, type, icon, isActive, onClick,
  side = 'right'
}: {
  id: number;
  name: string;
  type: string;
  icon: string;
  isActive: boolean;
  onClick: (id: number) => void;
  side?: 'left' | 'right';
}) => {
  return <Box position='relative' display='inline-flex' h='3em' role="group">
    <LinkButton
      id={id} name={name} type={type} icon={icon} isActive={isActive} onClick={onClick} 
      zIndex={1}
    />
    <Box
      _groupHover={{ top: '100%' }}
      boxShadow='dark-lg'
      position='absolute' top='0%' {...({ [side]: '0px' })}
      transition='all 0.3s ease'
    >
      <Button
        h='2.5em' w='2.5em'
        onClick={() => onClick(id)}
      >❌</Button>
      <Button
        h='2.5em' w='2.5em'
        onClick={() => onClick(id)}
      >📌</Button>
    </Box>
  </Box>
};

export const LayoutButton = ({
  id, name, tooltip, isActive, onClick
}: {
  id: string;
  name: any;
  tooltip?: any;
  isActive: boolean;
  onClick: (id: string) => void;
}) => {
  return <Box position='relative' display='inline-flex' h='3em' role="group">
    <Button
      h='3em' w='3em' variant={isActive ? 'active' : 'solid'}
      zIndex={1}
      onClick={() => onClick(id)}
    >
      {name}
    </Button>
    <Box
      _groupHover={{ left: '100%' }}
      position='absolute' left='-5em' top='0px'
      transition='all 0.3s ease'
    >
      {!!tooltip && <Box
        p='0.4em' pt='0.2em' pb='0.2em' bg='deepBgDark' color='deepColor' display='inline-flex'
      >{tooltip}</Box>}
      <Button
        h='3em' w='3em'
        boxShadow='dark-lg'
        fontSize='lg' p='0'
        onClick={() => onClick(id)}
      >❌</Button>
    </Box>
  </Box>
};

export function Status() {
  const deep = useDeep();
  return <>
    {deep ? <StatusWithDeep/> : <CircularProgress
      size="1em" isIndeterminate={false} value={100} color={(deep && deep?.linkId) ? 'cyan' : 'red'}
    />}
  </>;
}

export const StatusWithDeep = memo(function StatusWithDeep() {
  const deep = useDeep();
  // @ts-ignore
  const status = deep?.client?.useApolloNetworkStatus();
  return <>
    <CircularProgress
      size="1em" isIndeterminate={!!status.numPendingQueries} value={100} color={(deep && deep?.linkId) ? 'cyan' : 'red'}
    />
    <Text size="xxs" position='absolute' top='0.5em' right='0.5em'>
      {status.numPendingQueries}
    </Text>
  </>;
}, () => true);

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

  return <Box display='inline-flex' h='3em' role="group">
    <Button
      w='3em' h='3em'
    >{deep ? <IoExitOutline /> : <IoEnterOutline/>}</Button>
    <Box
      _groupHover={{ left: '0%' }}
      boxShadow='dark-lg'
      position='absolute' left='-35em' bottom='0px' w={canAdmin ? '15em' : '15em'}
      transition='all 1s ease' overflow="hidden"
      p='1em'
      bg="deepBg"
    >
      <VStack spacing={'1em'} mb='1em'>
        <Input value={_path} onChange={e => _setPath(e.target.value)} placeholder="path" w='100%' size='md' onKeyDown={e => e.key === 'Enter' && enter()}/>
        <Input type="password" value={_token} onChange={e => _setToken(e.target.value)} placeholder="token" w='100%' size='md' onKeyDown={e => e.key === 'Enter' && enter()}/>
      </VStack>
      <Flex>
        <Button variant='danger' w="3em" h="3em" onClick={() => {
          setPath('');
          setToken('');
        }}>
          <IoExitOutline/>
        </Button>
        <Spacer/>
        <Button variant="active" w="3em" h="3em" onClick={enter}>
          <IoEnterOutline/>
        </Button>
        {canAdmin && <Button w="3em" h="3em" onClick={() => {
          deep.id('deep', 'admin').then(admin => deep.login({ linkId: admin }));
        }}>
          <GrUserAdmin/>
        </Button>}
        <Button w="3em" h="3em" onClick={() => {
          deep.guest();
        }}>
          <IoMdPersonAdd/>
        </Button>
      </Flex>
    </Box>
  </Box>;
}

export function Content() {
  const deep = useDeep();
  const { t } = useTranslation();
  const router = useRouter();

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

  const [layout, setLayout] = useQueryStore('layout', 't');

  const [spaceId, setSpaceId] = useState<any>();
  const [containerId, setContainerId] = useState();

  return (
    <Orientation scope='deep' linkId={deep.linkId}>
      <Grid
        templateAreas={`"tabs tabs"
                        "nav main"`}
        gridTemplateRows={'3em 1fr'}
        gridTemplateColumns={'3em 1fr'}
        h='100%' w="100%" position="fixed" left="0%" top="0%"
        color='blackAlpha.700'
        fontWeight='bold'
      >
        <GridItem area={'tabs'} zIndex={1}>
          <Flex w="100%" h="100%">
            <Box/>
            <Spacer/>
            <PathItemSearch oneline finder where={{ position: 'results', mode: 'search' }} value='380'/>
          </Flex>
        </GridItem>
        <GridItem area={'nav'} zIndex={1} position="relative" h="100%">
          <Flex direction='column' h='100%'>
            <LayoutButton isActive={layout === 'd'} id={'d'} tooltip='dashbord' name={<Image src='./logo.svg' alt='logo' w='2em' />} onClick={id => setLayout(id)}/>
            <LayoutButton isActive={layout === 'c'} id={'c'} tooltip='graph' name={<PiGraphBold/>} onClick={id => setLayout(id)}/>
            <LayoutButton isActive={layout === 'g'} id={'g'} tooltip='grid' name={<BsGrid1X2Fill/>} onClick={id => setLayout(id)}/>
            <LayoutButton isActive={layout === 't'} id={'t'} tooltip='tree' name={'🎄'} onClick={id => setLayout(id)}/>
            <LayoutButton isActive={layout === 'f'} id={'f'} tooltip='processes' name={<GoWorkflow/>} onClick={id => setLayout(id)}/>
            <LayoutButton isActive={layout === 'o'} id={'o'} tooltip='openchakra' name={<BsLightningChargeFill/>} onClick={id => setLayout(id)}/>
            <LayoutButton isActive={layout === 'a'} id={'a'} tooltip='VR' name={<FaVrCardboard/>} onClick={id => setLayout(id)}/>
            <Button w='3em' h='3em'>+</Button>
            <Spacer/>
            {!!deep && <Packages/>}
            <ColorMode w='3em' h='3em' dark={{ children: <SunIcon/> }} light={{ children: <MoonIcon/> }}/>
            <Button w='3em' h='3em'><Status/></Button>
            <Auth/>
          </Flex>
        </GridItem>
        <GridItem area={'main'} overflow="hidden" position="relative">
          {layout === 'd' && <Center w='100%' h='100%'>
            {!!deep && <Dash/>}
          </Center>}
          {layout === 'c' && <Center w='100%' h='100%'>
            soon, optimized <Link href="https://js.cytoscape.org/">js.cytoscape.org</Link> version here
          </Center>}
          {layout === 'g' && <Center w='100%' h='100%'>
            for example some thing like: <Link href="https://react-grid-layout.github.io/react-grid-layout/examples/11-no-vertical-compact.html">react-grid-layout.github.io</Link>
          </Center>}
          {layout === 't' && <Box w='100%' h='100%'>
            {!!deep && <>{[<Tree key={deep?.linkId || ''}/>]}</>}
          </Box>}
          {layout === 'f' && <Center w='100%' h='100%' bg='pink'>
            for example some thing like: <Link href="https://reactflow.dev/">reactflow.dev</Link>
          </Center>}
          {layout === 'o' && <Box w='100%' h='100%'>
            <iframe src='https://openchakra.app/' width='100%' height='100%'></iframe>
          </Box>}
          {layout === 'a' && <Box w='100%' h='100%'>
            
          </Box>}
        </GridItem>
      </Grid>
    </Orientation>
  );
  // return (<Flex w="100%" h="100%" position="fixed" l="0%" t="0%">
  //   <Box w='2em' bg='gray.500' overflowX="hidden" overflowY="scroll">
  //   </Box>
  //   <Box flex='1' bg='tomato' overflow="hidden">
  //   </Box>
  // </Flex>);
};

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
  const [logo, setLogo] = useState(true);
  useEffect(() => {
    setTimeout(() => setLogo(false), 1000);
  }, []);

  return (<>
    <HotkeysProvider>
      <FinderProvider>
        <DeepNamespaceProvider>
          <MinilinksProvider>
            {!!path && <>
              {/* <CyberDeepProvider namespace="cyber"/> */}
              {/* <AutoGuest/> */}
            </>}
            <Mounted>
              <Content/>
            </Mounted>
            <AutoGuest/>
          </MinilinksProvider>
        </DeepNamespaceProvider>
      </FinderProvider>
    </HotkeysProvider>
    <Center
      bg='#0D1117' zIndex={777} position='fixed' w='100%' h='100%' left='0' top='0'
      transition={'all 1s ease'} pointerEvents={logo ? 'all' : 'none'} opacity={logo ? 0.9 : 0}
    >
      <Image src='./logo.svg' alt='logo' w='10em' />
    </Center>
  </>);
};

export async function getStaticProps(arg) {
  const result: any = await i18nGetStaticProps(arg);
  result.props = result?.props || {};
  return result;
}