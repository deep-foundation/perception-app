import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box, Button, CircularProgress, CircularProgressLabel, FormControl, FormLabel, Heading, Input, SimpleGrid,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Switch,
  Text,
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
import { SaverProvider } from '@deep-foundation/deepmemo-imports/imports/saver';
import {
  VoiceProvider,
  useVoice
} from '@deep-foundation/deepmemo-imports/imports/voice';
import { useLocalStore } from '@deep-foundation/store/local';
import React, { useEffect, useRef, useState } from 'react';
import { Connection } from '../src/connection';
import { i18nGetStaticProps } from '../src/i18n';
import useAxios from 'axios-hooks';

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

const Graph = React.memo(function Graph({ linkId, query = {} }: { linkId: Id; query?: any }) {
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
    ...(query)
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

const VoicesVoiceView = React.memo(function VoicesVoiceView({ voice, i }: { voice: any, i: number }) {
  const deep = useDeep();

  const ssl = deep.apolloClient.ssl;
  const path = deep.apolloClient.path.slice(0, -4);
  const url = `${ssl ? "https://" : "http://"}${path}/file?linkId=${voice.id}`;

  const [{ data, loading, error }, refetch] = useAxios({ 
    method: 'get', url: `${ssl ? "https://" : "http://"}${path}/file?linkId=${voice.id}`,
    headers: { 'Authorization': `Bearer ${deep.token}` },
    responseType: "blob",
  });
  const [src, setSrc] = useState<any>();
  useEffect(() => {
    if (!loading && data) {
      const reader = new window.FileReader();
      reader.onload = () => {
        setSrc(reader.result);
      }
      reader.readAsDataURL(data);
    }
  }, [data, loading]);

  const [text] = deep.useMinilinksSubscription({
    type_id: deep.idLocal('@deep-foundation/core', 'SyncTextFile'),
    in: { type_id: deep.idLocal('@deep-foundation/core', 'Contain'), from_id: voice.id },
  });

  return <>
    <AccordionItem>{({ isExpanded }) => (<>
      <h2>
        <AccordionButton>
          <Box>
            <Text noOfLines={1}>
              {voice?.id || i} {text?.value?.value || ''}
            </Text>
          </Box>
          <AccordionIcon />
        </AccordionButton>
      </h2>
      <AccordionPanel pb={4}>
        {!!isExpanded && !!src && <audio src={src} controls>Your browser does not support the audio element.</audio>}
        {!!text && <Box>{text?.value?.value}</Box>}
      </AccordionPanel>
    </>)}</AccordionItem>
  </>;
});

const VoicesView = React.memo(function VoiceView() {
  const deep = useDeep();
  const device = useDevice();
  const voice = useVoice();
  // const [voices, setVoices] = useState([]);
  const voices = deep.useMinilinksSubscription({
    type_id: deep.idLocal('@deep-foundation/core', 'AsyncFile'),
    in: { type_id: deep.idLocal('@deep-foundation/core', 'Contain'), from_id: device?.id || 0 },
    order_by: {id: 'asc'},
  });
  return <>
    <SimpleGrid columns={{sm: 1, md: 2}}>
      <Box>
        <Accordion allowToggle>
          {voices.map((v, i) => <>
            <VoicesVoiceView key={v.id} voice={v} i={i}/>
          </>)}
        </Accordion>
      </Box>
      {deep?.linkId && device?.id && <Graph linkId={device.id} query={{
        up: { parent: { type_id: deep.idLocal('@deep-foundation/core', 'AsyncFile') } }
      }}/>}
    </SimpleGrid>
  </>;
});

const VoiceView = React.memo(function VoiceView() {
  const deep = useDeep();
  const voice = useVoice();
  const device = useDevice();
  return <>
    <Heading>Voice</Heading>
    {!!deep && !!device?.id && <VoicesView/>}
    {voice.status ? (
      voice.recording ? (<>
        <Button onClick={async () => {
          const record = await voice.stop();
        }}>stop</Button>
        {voice.paused ? (
          <Button onClick={() => voice.pause()}>pause</Button>
        ) : (
          <Button onClick={() => voice.resume()}>resume</Button>
        )}
      </>) : (
        <Button onClick={() => voice.start()}>start</Button>
      )
    ) : (
      <Button onClick={() => voice.request()}>request</Button>
    )}
  </>;
});

export function Syncing({ title, value, setValue }) {
  const deep = useDeep();
  return <FormControl display='flex' alignItems='center'>
    <FormLabel htmlFor='syncing' mb='0'>
      {title}
    </FormLabel>
    <Switch id='syncing'
      isChecked={value}
      onChange={() => setValue(s => !s)}
      disabled={!deep?.id}
    />
  </FormControl>;
}

export default function Page() {
  const deep = useDeep();
  const toast = useToast();

  // @ts-ignore
  if (typeof(window) === 'object') window.deep = deep;
  console.log('deep', deep);

  const [containerId, setContainerId] = useLocalStore('deepmemo-app-containerId', null);
  const [deviceInterval, setDeviceInterval] = useState(5000);
  const [deviceSaver, setDeviceSaver] = useState(true);
  const [geolocationInterval, setGeolocationInterval] = useState(5000);
  const [geolocationSaver, setGeolocationSaver] = useState(true);
  const [saver, setSaver] = useState<boolean>(false);
  useEffect(() => {
    if (!deep) setSaver(false);
    else deep.local = false;
  }, [deep]);

  return (<>
    <Connection/>
    <Box p={4}>
      <Syncing title={'Enable syncing with deep backend?'} value={saver} setValue={setSaver}/>
      <FormControl display='flex' alignItems='center'>
        <FormLabel htmlFor='syncing' mb='0'>
          ContainerId
        </FormLabel>
        <Input
          placeholder={`${deep?.linkId}`}
          value={containerId} onChange={(e) => setContainerId(e.target.value)}
          w={'10em'}
        />
      </FormControl>
      <SaverProvider onSave={({ Type, id, object, mode, promise }) => {
        toast.promise(promise, {
          success: { title: `Saved ${mode} #${id || '?'} of type (#${Type}) to deep`, isClosable: true },
          error: (e) => ({ title: `Error with saving ${mode} #${id || '?'} of type (#${Type}) to deep`, description: e.toString(), isClosable: true }),
          loading: { title: `Saving ${mode} #${id || '?'} of type (#${Type}) to deep`, isClosable: true },
        })
      }}>
        <DeviceProvider saver={saver && deviceSaver} containerId={containerId} interval={deviceInterval}>
          <GeolocationProvider saver={saver && geolocationSaver} interval={geolocationInterval}>
            <VoiceProvider saver={saver}>
              <VoiceView/>
              <Interval value={deviceInterval} onChange={setDeviceInterval}/>
              <Syncing title={'Enable voice syncing with deep backend?'} value={deviceSaver} setValue={setDeviceSaver}/>
              <DeviceView interval={deviceInterval}/>
              <Interval value={geolocationInterval} onChange={setGeolocationInterval}/>
              <Syncing title={'Enable geolocation syncing with deep backend?'} value={geolocationSaver} setValue={setGeolocationSaver}/>
              <GeolocationView interval={geolocationInterval}/>
            </VoiceProvider>
          </GeolocationProvider>
        </DeviceProvider>
      </SaverProvider>
    </Box>
  </>);
}

export async function getStaticProps(arg) {
  return await i18nGetStaticProps(arg);
}