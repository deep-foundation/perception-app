import {
  Box, Button, CircularProgress, CircularProgressLabel, FormControl, FormLabel, Heading, SimpleGrid,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Switch,
  useToast,
} from '@chakra-ui/react';
import CytoGraph from '@deep-foundation/deepcase/imports/cyto/graph';
import { useRefstarter } from '@deep-foundation/deepcase/imports/refstater';
import { useDeep } from '@deep-foundation/deeplinks/imports/client';
import { Id, Link } from '@deep-foundation/deeplinks/imports/minilinks';
import {
  DeviceProvider,
  useDevice
} from '@deep-foundation/deepmemo-imports/imports/device';
import {
  GeolocationProvider,
  useGeolocation
} from '@deep-foundation/deepmemo-imports/imports/geolocation';
import React, { useEffect, useRef, useState } from 'react';
import { Connection } from '../src/connection';
import { i18nGetStaticProps } from '../src/i18n';
import { SaverProvider } from '@deep-foundation/deepmemo-imports/imports/saver';

const Loading = React.memo(function Loading({ factor, interval }: { factor: any, interval: number }) {
  const [value, setValue] = useState(0);
  const [synced, setSynced] = useState(false);
  useEffect(() => {
    setValue(0);
    setSynced(true);
    const i = setInterval(() => setValue(v => {
      if (v > (interval / 2)) setSynced(false);
      return v > interval ? 0 : v + (interval / 100);
    }), interval / 100);
    return () => clearInterval(i);
  }, [factor]);
  return <CircularProgress value={(value / interval) * 100} size="1em" color={synced ? 'green.400' : 'blue.400'}>
    <CircularProgressLabel fontSize={'0.5em'} color={synced ? 'black' : 'gray.500'}>{synced ? '✔' : '✗'}</CircularProgressLabel>
  </CircularProgress>;
});

const Interval = React.memo(function Loading({ value, onChange }: { value: any, onChange: any }) {
  return <Box p={4} pt={6}><Slider value={value / 100} onChange={(v) => onChange(v * 100)}>
    <SliderMark value={25} mt={'2'} ml={'-2.5'} fontSize={'sm'}>
      2500
    </SliderMark>
    <SliderMark value={50} mt={'2'} ml={'-2.5'} fontSize={'sm'}>
      5000
    </SliderMark>
    <SliderMark value={75} mt={'2'} ml={'-2.5'} fontSize={'sm'}>
      7500
    </SliderMark>
    <SliderMark
      value={value / 100}
      textAlign='center'
      bg='blue.500'
      color='white'
      mt='-10'
      ml='-7'
      w='15'
    >
      {value}ms
    </SliderMark>
    <SliderTrack>
      <SliderFilledTrack />
    </SliderTrack>
    <SliderThumb />
  </Slider></Box>;
});

const Graph = React.memo(function Graph({ linkId }: { linkId: Id }) {
  const deep = useDeep();
  const cyRef = useRef();
  const cytoViewportRef = useRefstarter<{ pan: { x: number; y: number; }; zoom: number }>();
  const { data: links = [] }: { data?: Link<Id>[] } = deep.useDeepSubscription({
    up: { parent_id: linkId || 0, tree_id: deep.idLocal('@deep-foundation/core', 'containTree') },
    _not: { type_id: { _in: [
      deep.idLocal('@deep-foundation/core', 'Promise'),
      deep.idLocal('@deep-foundation/core', 'Then'),
      deep.idLocal('@deep-foundation/core', 'Resolved'),
      deep.idLocal('@deep-foundation/core', 'Rejected'),
      deep.idLocal('@deep-foundation/core', 'PromiseResult'),
    ] } },
  });
  return <>
    {!!linkId && <Box w={500} h={500} border={'1px'} rounded='md' position="relative">
      {deep?.linkId && <CytoGraph links={links} cyRef={cyRef} cytoViewportRef={cytoViewportRef}/>}
    </Box>}
  </>;
});

const DeviceView = React.memo(function DeviceView({ interval }: { interval: number }) {
  const deep = useDeep();
  const device = useDevice();
  return <>
    <Heading>Device {device?.id ? <>{device?.id}</> : <>{'id not defined'}</>} <Loading factor={device} interval={interval}/></Heading>
    <SimpleGrid columns={{sm: 1, md: 2}}>
      <Box><pre>{JSON.stringify(device, null, 2)}</pre></Box>
      {deep?.linkId && device?.id && <Graph linkId={device.id}/>}
    </SimpleGrid>
  </>;
});

const GeolocationView = React.memo(function GeolocationView({ interval }: { interval: number }) {
  const deep = useDeep();
  const geolocation = useGeolocation();
  return <>
    <Heading>Geolocation {geolocation?.position?.id ? <>{geolocation?.position?.id}</> : <>{'id not defined'}</>} <><Loading factor={geolocation.position} interval={interval}/></></Heading>
    <Button onClick={() => geolocation.request()}>request</Button>
    <SimpleGrid columns={{sm: 1, md: 2}}>
      <Box><pre>{JSON.stringify(geolocation, null, 2)}</pre></Box>
      {deep?.linkId && geolocation?.position?.id && <Graph linkId={geolocation.position.id}/>}
    </SimpleGrid>
  </>;
});

export default function Page() {
  const deep = useDeep();
  const toast = useToast();

  // @ts-ignore
  if (typeof(window) === 'object') window.deep = deep;
  console.log('deep', deep);

  const [deviceInterval, setDeviceInterval] = useState(5000);
  const [geolocationInterval, setGeolocationInterval] = useState(5000);
  const [saver, setSaver] = useState<boolean>(false);
  useEffect(() => {
    if (!deep) setSaver(false);
  }, [deep]);

  return (<>
    <Connection/>
    <Box p={4}>
    <FormControl display='flex' alignItems='center'>
      <FormLabel htmlFor='syncing' mb='0'>
        Enable syncing with deep backend?
      </FormLabel>
      <Switch id='syncing'
        isChecked={saver}
        onChange={() => setSaver(s => !s)}
        disabled={!deep?.id}
      />
    </FormControl>
      <SaverProvider onSave={({ Type, id, object, mode, promise }) => {
        toast.promise(promise, {
          success: { title: `Saved ${mode} #${id || '?'} of type (#${Type}) to deep`, isClosable: true },
          error: { title: `Error with saving ${mode} #${id || '?'} of type (#${Type}) to deep`, isClosable: true },
          loading: { title: `Saving ${mode} #${id || '?'} of type (#${Type}) to deep`, isClosable: true },
        })
      }}>
        <DeviceProvider saver={saver} containerId={deep?.linkId} interval={deviceInterval}>
          <GeolocationProvider saver={saver} interval={geolocationInterval}>
            <Interval value={deviceInterval} onChange={setDeviceInterval}/>
            <DeviceView interval={deviceInterval}/>
            <Interval value={geolocationInterval} onChange={setGeolocationInterval}/>
            <GeolocationView interval={geolocationInterval}/>
          </GeolocationProvider>
        </DeviceProvider>
      </SaverProvider>
    </Box>
  </>);
}

export async function getStaticProps(arg) {
  return await i18nGetStaticProps(arg);
}