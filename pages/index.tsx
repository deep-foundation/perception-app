import { useDeep } from '@deep-foundation/deeplinks/imports/client';
import CytoGraph from '@deep-foundation/deepcase/imports/cyto/graph';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { i18nGetStaticProps } from '../src/i18n';
import {
  DeviceProvider,
  useDevice
} from '@deep-foundation/deepmemo-imports/imports/device';
import Test from '@deep-foundation/deepmemo-imports/imports/index';
import { Connection } from '../src/connection';
import { Id, Link } from '@deep-foundation/deeplinks/imports/minilinks';
import { useRef } from 'react';
import { useRefstarter } from '@deep-foundation/deepcase/imports/refstater';
import { Box, Heading, SimpleGrid } from '@chakra-ui/react';

function DeviceView() {
  const device = useDevice();
  const deep = useDeep();
  const cyRef = useRef();
  const cytoViewportRef = useRefstarter<{ pan: { x: number; y: number; }; zoom: number }>();
  const { data: containTree } = deep.useDeepId('@deep-foundation/core', 'containTree');
  const { data: links = [] }: { data?: Link<Id>[] } = deep.useDeepSubscription({ up: { parent_id: device?.id || 0, tree_id: containTree || 0 } });
  return <>
    <Heading>Device {device?.id ? device?.id : 'syncing'}</Heading>
    <SimpleGrid columns={{sm: 1, md: 2}}>
      <Box><pre>{JSON.stringify(device, null, 2)}</pre></Box>
      {!!device?.id && <Box w={500} h={500} border={'1px'} rounded='md' position="relative">
        <CytoGraph links={links} cyRef={cyRef} cytoViewportRef={cytoViewportRef}/>
      </Box>}
    </SimpleGrid>
  </>;
}

export default function Page() {
  const deep = useDeep();
  const { t } = useTranslation();
  const router = useRouter();

  // @ts-ignore
  if (typeof(window) === 'object') window.deep = deep;
  console.log('deep', deep);

  return (<>
    <Connection/>
    {!!deep?.linkId && <>
      <DeviceProvider containerId={deep.linkId}>
        <DeviceView/>
      </DeviceProvider>
    </>}
  </>);
}

export async function getStaticProps(arg) {
  return await i18nGetStaticProps(arg);
}