import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box, Button, Card, CardBody, CardHeader, CircularProgress, CircularProgressLabel, FormControl, FormLabel, HStack, Heading, Input, InputGroup, InputRightElement, List, ListIcon, ListItem, Select, SimpleGrid,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Switch,
  Text,
  useToast,
} from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon, SpinnerIcon, CheckIcon, TriangleDownIcon } from '@chakra-ui/icons'
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
import {
  InstallerProvider,
  useInstaller
} from '@deep-foundation/deepmemo-imports/imports/installer';
import {
  BackgroundGeolocationProvider,
  useBackgroundGeolocation
} from '@deep-foundation/deepmemo-imports/imports/background-geolocation';
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
import { EditorTextArea } from '@deep-foundation/deepcase/imports/editor/editor-textarea';
import times from 'lodash/times';
import { deepEqual } from 'assert';

const { version } = require('../package.json');

// force junk for connection
await import('@deep-foundation/deeplinks/imports/client');

const NEXT_PUBLIC_BUILD = process.env.NEXT_PUBLIC_BUILD || 'web';

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

const InstallerView = React.memo(function InstallerView({}: {}) {
  const installer = useInstaller();
  const deep = useDeep();
  const [apiKey, setApiKey] = useState('');
  const [containerId, setContainerId] = useLocalStore('deepmemo-app-containerId', null);

  useEffect(() => {
    if (installer?.['ApiKey']?.[0]?.value?.value) setApiKey(installer?.['ApiKey']?.[0]?.value?.value);
  }, [installer?.['ApiKey']?.[0]?.value?.value]);

  useEffect(() => {
    if (installer?.['space']?.id) setContainerId(installer?.['space']?.id);
  }, [installer?.['space']?.id]);

  return <>
    <Card maxWidth={'100%'}>
      <CardHeader>
        <Heading>
          Installer
        </Heading>
      </CardHeader>
      <CardBody>
        <SimpleGrid columns={{sm: 1, md: 2}}>
          <Box>
            {!installer?.installing ? <Button colorScheme={'blue'} onClick={() => installer.install()}>install</Button> : <Button disabled variant='outline'>{installer?.installing ? 'installing' : 'installed'}</Button>}
            {<Button colorScheme={'blue'} onClick={() => installer.reset()}>reset</Button>}
            <List spacing={3}>
              <ListItem>
                <ListIcon as={installer?.status ? CheckCircleIcon : WarningIcon} color={installer?.status ? 'green.500' : 'red.500'} />
                status
              </ListItem>
              <ListItem>
                <ListIcon as={deep ? CheckCircleIcon : WarningIcon} color={deep ? 'green.500' : 'red.500'} />
                connected
              </ListItem>
              <ListItem>
                <ListIcon as={installer?.isAdmin ? CheckCircleIcon : WarningIcon} color={installer?.isAdmin ? 'green.500' : 'red.500'} />
                isAdmin
              </ListItem>
              <ListItem>
                <ListIcon as={installer?.['@deep-foundation/chatgpt-azure']?.length ? CheckCircleIcon : WarningIcon} color={installer?.['@deep-foundation/chatgpt-azure']?.length ? 'green.500' : 'red.500'} />
                @deep-foundation/chatgpt-azure
              </ListItem>
              <ListItem>
                <ListIcon as={installer?.['@deep-foundation/chatgpt-azure-deep']?.length ? CheckCircleIcon : WarningIcon} color={installer?.['@deep-foundation/chatgpt-azure-deep']?.length ? 'green.500' : 'red.500'} />
                @deep-foundation/chatgpt-azure-deep
              </ListItem>
              <ListItem>
                <ListIcon as={installer?.['@deep-foundation/chatgpt-azure-templates']?.length ? CheckCircleIcon : WarningIcon} color={installer?.['@deep-foundation/chatgpt-azure-templates']?.length ? 'green.500' : 'red.500'} />
                @deep-foundation/chatgpt-azure-templates
              </ListItem>
              <ListItem>
                <ListIcon as={installer?.['@deep-foundation/deepmemo-links']?.length ? CheckCircleIcon : WarningIcon} color={installer?.['@deep-foundation/deepmemo-links']?.length ? 'green.500' : 'red.500'} />
                @deep-foundation/deepmemo-links
              </ListItem>
              <ListItem>
                <ListIcon as={installer?.installed ? CheckCircleIcon : WarningIcon} color={installer?.installed ? 'green.500' : 'red.500'} />
                installed
              </ListItem>
              <ListItem>
                <ListIcon as={installer?.['ApiKey']?.length ? CheckCircleIcon : WarningIcon} color={installer?.['ApiKey']?.length ? 'green.500' : 'red.500'} />
                ApiKey ({installer?.['ApiKey']?.[0]?.value?.value || ''})
                <InputGroup size='md'>
                  <Input placeholder='Enter token for choosen model' value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
                  <InputRightElement>
                    <Button size='sm' onClick={async () => {
                      await installer.saveApiKey(apiKey);
                    }}>save</Button>
                  </InputRightElement>
                </InputGroup>
              </ListItem>
              <ListItem>
                <ListIcon as={installer?.['UsesApiKey']?.length ? CheckCircleIcon : WarningIcon} color={installer?.['UsesApiKey']?.length ? 'green.500' : 'red.500'} />
                UsesApiKey
              </ListItem>
              <ListItem>
                <ListIcon as={installer?.['Model']?.length ? CheckCircleIcon : WarningIcon} color={installer?.['Model']?.length ? 'green.500' : 'red.500'} />
                Model
              </ListItem>
              <ListItem>
                <ListIcon as={installer?.['UsesModel']?.length ? CheckCircleIcon : WarningIcon} color={installer?.['UsesModel']?.length ? 'green.500' : 'red.500'} />
                UsesModel
                <Select placeholder='Choose model' value={String(installer?.['UsesModel']?.[0]?.to_id)} onChange={e => installer.saveUsesModel(+e.target.value)}>
                  {installer?.['Model']?.map(l => <option value={String(l.id)}>{l?.value?.value}</option>)}
                </Select>
              </ListItem>
              <ListItem>
                <ListIcon as={installer?.['space'] ? CheckCircleIcon : WarningIcon} color={installer?.['space'] ? 'green.500' : 'red.500'} />
                space ({installer?.['space']?.id || ''}) <Button disabled={!installer?.space} variant={!!installer?.space ? 'outline' : 'solid'} colorScheme={'blue'} onClick={() => installer.defineSpace()}>define</Button>
              </ListItem>
            </List>
          </Box>
          {deep?.linkId && <Graph linkId={deep.linkId}/>}
        </SimpleGrid>
      </CardBody>
    </Card>
  </>;
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

const TemplateView = React.memo(function TemplateView({ template }: { template: any }) {
  const deep = useDeep();
  const refEditor = useRef<any>();
  const [value, setValue] = useState(template?.value?.value || '');
  
  const savedValue = template?.value?.value;
  const [saving, setSaving] = useState(false);
  
  const save = async (value) => {
    setSaving(true);
    await deep.update({ link_id: template.id }, { value }, { table: 'strings' });
    setSaving(false);
  }

  const { data: promises } = deep.useDeepSubscription({
    up: {
      tree_id: deep.idLocal('@deep-foundation/core', 'promiseTree'),
      parent: {
        from_id: template.id,
        type_id: { _id: ['@deep-foundation/chatgpt-azure-templates', 'Apply'] },
      },
    },
  });

  const rejectsAndResolves = deep.useMinilinksSubscription({
    type_id: { _in: [deep.idLocal('@deep-foundation/core', 'Resolved'), deep.idLocal('@deep-foundation/core', 'Rejected')] },
    from: {
      type_id: deep.idLocal('@deep-foundation/core', 'Promise'),
      in: {
        type_id: deep.idLocal('@deep-foundation/core', 'Then'),
        from: {
          from_id: template.id,
        }
      },
    }
  });

  return <Box borderBottom={'1px'} borderColor={'gray.300'}>
    <SimpleGrid columns={{sm: 1, md: 2}}>
      <Box>
        <Box h={'10em'} p={2}>
          <EditorTextArea
            refEditor={refEditor}
            value={value}
            defaultLanguage={`javascript`}
            minimap={false}
            onChange={(value) => {
              setValue(value);
            }}
            onClose={() => {
            }}
            onSave={save}
            onMount={() => {}}
          />
        </Box>
        <HStack p={2} pt={0} spacing={2}>
          <Button
            colorScheme={savedValue === value || saving ? 'grey' : 'blue'} disabled={savedValue === value || saving} variant={'solid'} size="sm"
            onClick={() => save(value)}
          >
            {saving ? <SpinnerIcon/> : savedValue === value ? <CheckIcon/> : <TriangleDownIcon/>}
          </Button>
          <Button colorScheme={'blue'} variant={'solid'} size="sm">disabled</Button>
          <Button colorScheme={'blue'} variant={'outline'} size="sm">every minute</Button>
          <Button colorScheme={'green'} variant={'outline'} size="sm"
            onClick={async () => deep.insert({
              type_id: await deep.id('@deep-foundation/chatgpt-azure-templates', 'Apply'),
              from_id: template.id,
              to_id: deep?.linkId,
              in: { data: [
                { type_id: deep.idLocal('@deep-foundation/core', 'Contain'), from_id: template.id },
              ]},
            })}
          >manual</Button>
          <Button
            colorScheme={'red'} variant={'solid'} size="sm"
            onClick={() => deep.delete({ _or: [
              { id: template.id },
              { type_id: deep.idLocal('@deep-foundation/core', 'Contain'), from_id: deep?.linkId, to_id: template.id },
            ] })}
          >x</Button>
        </HStack>
      </Box>
      <Box p={2} h={'11em'} overflowY={'scroll'}>
        {rejectsAndResolves.map(n => <Box
          borderBottom={'1px'} borderColor={'gray.300'} p={2}
          color={n.type_id === deep.idLocal('@deep-foundation/core', 'Rejected') ? 'red.500' : 'green.500'}
        >
          {n.type_id === deep.idLocal('@deep-foundation/core', 'Rejected') && <pre><code>{JSON.stringify(n?.to?.value?.value, null, 2)}</code></pre>}
          {n.type_id === deep.idLocal('@deep-foundation/core', 'Resolved') && <pre><code>{n?.id}</code></pre>}
        </Box>)}
      </Box>
    </SimpleGrid>
  </Box>;
});

const TemplatesViewCore = React.memo(function TemplatesView({ }: { }) {
  const deep = useDeep();
  const device = useDevice();
  deep.useDeepSubscription({
    type_id: { _id: ['@deep-foundation/chatgpt-azure-templates', 'Template'] },
    in: {
      type_id: deep.idLocal('@deep-foundation/core', 'Contain'), from_id: deep?.linkId,
    }
  });
  const templates = deep.useMinilinksSubscription({
    type_id: { _id: ['@deep-foundation/chatgpt-azure-templates', 'Template'] },
  });
  return <>
    <Box borderTop={'1px'} borderColor={'gray.300'}>
      {templates.map(t => (<TemplateView template={t}/>))}
    </Box>
  </>;
});

const TemplatesView = React.memo(function TemplatesView({ }: { }) {
  const deep = useDeep();
  return <>
    <Heading>Templates
      <Button
        disabled={!deep?.linkId}
        colorScheme={'blue'} variant={'solid'} size="sm"
        onClick={async () => {
          await deep.insert({
            type_id: await deep.id('@deep-foundation/chatgpt-azure-templates', 'Template'),
            string: { data: { value: `Ниже я приведу последние созданные ассоциативные связи в памяти, расскажи что ты думаешь об этой памяти? Что случилось за этот запомненный период? Какие ты можешь дать рекомендации?

\${JSON.stringify((await deep.select({ order_by: { id: 'desc' }, limit: 10 })).data)}` } },
            in: { data: {
              type_id: deep.idLocal('@deep-foundation/core', 'Contain'),
              from_id: deep.linkId,
            } }
          });
        }}
      >+</Button>
    </Heading>
    {!!deep?.linkId && <TemplatesViewCore/>}
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
    {!!geolocation.status ? <Button colorScheme={'red'} onClick={() => geolocation.stop()}>stop</Button> : <Button colorScheme={'blue'} onClick={() => geolocation.request()}>request</Button>}
    <SimpleGrid columns={{sm: 1, md: 2}}>
      <Box><pre>{JSON.stringify(geolocation, null, 2)}</pre></Box>
      {deep?.linkId && geolocation?.position?.id && <Graph linkId={geolocation.position.id}/>}
    </SimpleGrid>
  </>;
});

const BackgroundGeolocationView = React.memo(function BackgroundGeolocationView({}: {}) {
  const deep = useDeep();
  const geolocation = useBackgroundGeolocation();
  return <>
    <Heading>Background Geolocation {geolocation?.position?.id ? <>{geolocation?.position?.id}</> : <>{'id not defined'}</>}</Heading>
    {!!geolocation.status ? <Button colorScheme={'red'} onClick={() => geolocation.stop()}>stop</Button> : <Button colorScheme={'blue'} onClick={() => geolocation.request()}>request</Button>}
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
  const [geolocationManual, setGeolocationManual] = useState(true);
  const [backgroundgeolocationSaver, setBackgroundGeolocationSaver] = useState(true);
  const [backgroundGeolocationManual, setBackgroundGeolocationManual] = useState(true);
  const [saver, setSaver] = useState<boolean>(false);
  useEffect(() => {
    if (!deep) setSaver(false);
    else deep.local = false;
  }, [deep]);

  return (<>
    <Connection/>
    <InstallerProvider>
      <Box p={4}>
        Version: {version}
        <InstallerView/>
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
            <GeolocationProvider saver={saver && geolocationSaver} interval={geolocationInterval} manual={geolocationManual}>
              <BackgroundGeolocationProvider saver={saver && backgroundgeolocationSaver} manual={backgroundGeolocationManual}>
                <VoiceProvider saver={saver}>
                  {NEXT_PUBLIC_BUILD}
                  <TemplatesView/>
                  <VoiceView/>
                  <Interval value={deviceInterval} onChange={setDeviceInterval}/>
                  <Syncing title={'Enable voice syncing with deep backend?'} value={deviceSaver} setValue={setDeviceSaver}/>
                  <DeviceView interval={deviceInterval}/>
                  <Interval value={geolocationInterval} onChange={setGeolocationInterval}/>
                  <Syncing title={'Enable geolocation syncing with deep backend?'} value={geolocationSaver} setValue={setGeolocationSaver}/>
                  <Syncing title={'Enable auto request foregraund geolocation?'} value={!geolocationManual} setValue={(v) => setGeolocationManual(!v)}/>
                  <GeolocationView interval={geolocationInterval}/>
                  <Syncing title={'Enable background geolocation syncing with deep backend?'} value={backgroundgeolocationSaver} setValue={setBackgroundGeolocationSaver}/>
                  <Syncing title={'Enable auto request background geolocation?'} value={!backgroundGeolocationManual} setValue={(v) => setBackgroundGeolocationManual(!v)}/>
                  <BackgroundGeolocationView/>
                </VoiceProvider>
              </BackgroundGeolocationProvider>
            </GeolocationProvider>
          </DeviceProvider>
        </SaverProvider>
      </Box>
    </InstallerProvider>
  </>);
}

export async function getStaticProps(arg) {
  return await i18nGetStaticProps(arg);
}