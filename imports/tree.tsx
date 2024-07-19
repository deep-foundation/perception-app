import {
  Box,
  Button,
  Stack, HStack, VStack,
  Input,
  SimpleGrid,
  Text,
  Editable,
  EditableInput,
  EditablePreview,
  EditableTextarea,
  useDisclosure,
  useBreakpointValue,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SlideFade,
  InputGroup,
  InputRightElement,
  Divider,
  Textarea,
  Tag,
  Flex,
  Checkbox,
} from '@chakra-ui/react';
import { useDeep } from "@deep-foundation/deeplinks/imports/client";
import { useMinilinksApply } from "@deep-foundation/deeplinks/imports/minilinks";
import { Id, Link } from '@deep-foundation/deeplinks/imports/minilinks';
import { createContext, Dispatch, DOMElement, memo, SetStateAction, use, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useHotkeys, useHotkeysContext } from 'react-hotkeys-hook';
import { LinkButton } from './link';
import { link } from 'fs';
import { MdEdit, MdSaveAlt } from "react-icons/md";
import { Editor } from './editor';
import isEqual from 'lodash/isEqual';
import { TypedIcon } from './icons/typed';
import { DownIcon } from './icons/down';
import { UpIcon } from './icons/up';
import { TypeIcon } from './icons/type';
import { InIcon } from './icons/in';
import { OutIcon } from './icons/out';
import { FromIcon } from './icons/from';
import { ToIcon } from './icons/to';
import { FinderContext, FinderPopover } from './finder';
import { useResizeDetector } from 'react-resize-detector';
import { BsX, BsCheck2, BsXLg } from 'react-icons/bs';
import {useDebounce, useDebounceCallback} from '@react-hook/debounce';
import { GrClear } from 'react-icons/gr';
import VisibilitySensor from 'react-visibility-sensor';

type NavDirection =  'current' | 'delete' | 'edit-from' | 'from' | 'type' | 'to' | 'edit-to' | 'out' | 'typed' | 'in' | 'up' | 'down' | 'promises' | 'rejects' | 'selectors' | 'selected' | 'prev' | 'next' | 'contains' | 'insert' | 'value' | 'results' | 'auto';

interface NavMap {
  left: NavDirection; up: NavDirection; right: NavDirection; down: NavDirection;
}

class Nav {
  name: string;
  map: NavMap;
  constructor(name: string, map: NavMap ) {
    this.name = name;
    this.map = map;
  }
  get left() { return navs[this.map.left] }
  get up() { return navs[this.map.up] }
  get right() { return navs[this.map.right] }
  get down() { return navs[this.map.down] }
}
const nav = (name: string, map: NavMap) => navs[name] = new Nav(name, map);
const navs: { [name: string]: Nav } = {};
nav('current', { left: 'prev', up: 'current', right: 'delete', down: 'type' });
nav('delete', { left: 'current', up: 'current', right: 'next', down: 'type' });
nav('edit-from', { left: 'prev', up: 'current', right: 'from', down: 'out' });
nav('from', { left: 'edit-from', up: 'current', right: 'type', down: 'out' });
nav('type', { left: 'from', up: 'current', right: 'to', down: 'typed' });
nav('to', { left: 'type', up: 'current', right: 'edit-to', down: 'in' });
nav('edit-to', { left: 'to', up: 'current', right: 'next', down: 'in' });
nav('out', { left: 'prev', up: 'from', right: 'typed', down: 'up' });
nav('typed', { left: 'out', up: 'type', right: 'in', down: 'up' });
nav('in', { left: 'typed', up: 'to', right: 'next', down: 'down' });
nav('up', { left: 'prev', up: 'out', right: 'down', down: 'selectors' });
nav('down', { left: 'up', up: 'in', right: 'promises', down: 'selected' });
nav('selectors', { left: 'prev', up: 'up', right: 'selected', down: 'value' });
nav('selected', { left: 'selectors', up: 'in', right: 'promises', down: 'value' });
nav('promises', { left: 'selected', up: 'in', right: 'rejects', down: 'value' });
nav('rejects', { left: 'promises', up: 'down', right: 'next', down: 'value' });
nav('value', { left: 'prev', up: 'rejects', right: 'next', down: 'contains' });
nav('contains', { left: 'prev', up: 'value', right: 'insert', down: 'results' });
nav('insert', { left: 'contains', up: 'value', right: 'next', down: 'results' });
nav('results', { left: 'prev', up: 'contains', right: 'next', down: 'results' });
navs.next = navs.contains;
navs.prev = navs.contains;

type onEnterI = (link: Link<Id>) => void;
type onChangeI = (link: Link<Id>, path: PathI) => void;

interface PathItemI {
  key?: number;
  query?: any;
  linkId?: Id;
  position?: NavDirection;
  index?: number;
  count?: number;

  mode?: string;
  _tree_position_ids?: string[];

  // only for go()
  active?: boolean;
  itemIndex?: number;
}

interface PathI extends Array<PathItemI> {}

interface GoContextI {
  (pathItem: PathItemI): void;
}
const GoContext = createContext<GoContextI>((item) => {});

interface ConfigContextI {
  scope: string;
  onescreen: boolean;
  insert: boolean;
  autoFocus: boolean;
  onEnter?: onEnterI;
  width: number;
  height: number;

  focus: { current: PathI; };
  path: { current: PathI; };
  results: { current: { results: Link<Id>[], originalData: Link<Id>[] }[] };
}
const ConfigContext = createContext<ConfigContextI>({
  scope: '',
  onescreen: false,
  autoFocus: false,
  insert: true,
  width: 350, height: 300,

  focus: { current: [] },
  path: { current: [] },
  results: { current: [] },
});

export const Result = memo(function Result({
  link,
  resultIndex = -1,
  pathItemIndex = -1,
  isFocused,
  _tree_position_ids,
}: {
  link: Link<Id>;
  resultIndex?: number;
  pathItemIndex?: number;
  isFocused?: boolean;
  _tree_position_ids?: string[];
}) {
  const deep = useDeep();
  const ref = useRef<any>();
  const config = useContext(ConfigContext);
  const go = useContext(GoContext);
  const symbol = useSymbol();

  useEffect(() => {
    if (isFocused) ref.current.scrollIntoView({block: "center", inline: "nearest"});
  }, [isFocused]);

  const [rename, setRename] = useState(false);
  const [name, setName] = useState(`${deep.nameLocal(link.id)}`);
  const enter = useCallback((force?: boolean) => {
    if (!isFocused && !force) return;
    if (config?.onEnter) return config?.onEnter(link);
    const contain = link?.inByType[deep.idLocal('@deep-foundation/core', 'Contain')]?.[0];
    if (contain) {
      if (!!rename) {
        if (contain?.value) deep.update({ link_id: contain.id }, { value: name }, { table: 'strings' });
        else deep.insert({ link_id: contain.id, value: name }, { table: 'strings' });
      }
      setRename(!rename);
    }
  }, [isFocused, rename, name]);
  useHotkeys('enter', () => enter(false), [isFocused, rename, name]);
  return rename ? <Box position="relative" role='group'>
    <Input
      ref={ref}
      value={name}
      onChange={e => setName(e.target.value)}
      onKeyDown={e => e.key === 'Enter' && enter(true)}
      variant={'unstyled'}
      autoFocus h='3em'
    />
    <Button
      w='3em' h='3em' position='absolute' right='0' top='0' zIndex={1}
      opacity={isFocused ? 1 : 0} transition='all 1s ease'
      _groupHover={{ opacity: 1 }}
      onClick={() => enter(true)}
    >
      <MdSaveAlt/>
    </Button>
  </Box> : <LinkButton
    buttonRef={ref}
    id={link.id}
    name={name as string}
    type={deep.nameLocal(link.type_id) as string}
    isActive={isFocused}
    icon={symbol(link)}
    w='100%'
    role='group'
    onClick={id => {
      go({
        itemIndex: pathItemIndex, index: resultIndex,
        linkId: id, position: 'next',
      });
    }}
  >
    <Button
      w='3em' h='3em' position='absolute' right='0' top='0'
      opacity={isFocused ? 1 : 0} transition='all 1s ease'
      _groupHover={{ opacity: 1 }}
      onClick={() => enter(true)}
    >
      <MdEdit/>
    </Button>
  </LinkButton>
});

export function symbol(link, deep) {
  return link?.type?.inByType[deep.idLocal('@deep-foundation/core', 'Symbol')]?.[0]?.value?.value;
}

export function useSymbol() {
  const deep = useDeep();
  return (link) => symbol(link, deep);
}

const loader = ({ query = {}, deep }: { query?: any, deep }) => {
  const typeQuery = {
    type: {
      relation: 'type',
      return: {
        valuetype: {
          relation: 'out',
          type_id: deep.idLocal('@deep-foundation/core', 'Value'),
        },
        symbol: {
          relation: 'in',
          type_id: deep.idLocal('@deep-foundation/core', 'Symbol'),
        },
        names: {
          relation: 'in',
          type_id: deep.idLocal('@deep-foundation/core', 'Contain'),
        },
      },
    },
  };
  return {
    ...query,
    return: {
      ...(query?.return || {}),
      names: {
        relation: 'in',
        type_id: deep.idLocal('@deep-foundation/core', 'Contain'),
      },
      from: { relation: 'from', return: { ...typeQuery } },
      ...typeQuery,
      to: { relation: 'to', return: { ...typeQuery } },
    },
  };
};

export function useLoader({
  query = {}, refVisibility, i
}: {
  query: any;
  refVisibility: any;
  i: number;
}) {
  const deep = useDeep();
  const q = useMemo(() => {
    return loader({ query, deep });
  }, [query, deep]);
  const results = deep.useQuery(q);
  // useEffect(() => {
  //   const interval = setInterval(async () => {
  //     if (refVisibility.current[i]) {
  //       // @ts-ignore
  //       console.log(await results.refetch());
  //     }
  //   }, 1000);
  //   return () => clearInterval(interval);
  // }, []);
  return results;
};

export function Loader({ query, timeout = 1000 }: { query: any; timeout?: number; }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), timeout);
    console.log('Loader mount', query);
    return () => {
      console.log('Loader unmount', query);
      clearTimeout(t);
    }
  }, []);
  return <>{ready ? [<LoaderCore key={JSON.stringify(query)} query={query}/>] : <></>}</>;
}
export function LoaderCore({ query }) {
  const deep = useDeep();
  const q = useMemo(() => {
    return loader({ query, deep });
  }, [query, deep]);
  deep.useSubscription(q);
  return <></>
}

export const EditorPathItem = memo(function EditorPathItem({
  item,
  focus,
  i,
  refVisibility,
}: {
  item: PathItemI;
  focus?: PathI;
  i: number;
  refVisibility: any;
}) {
  const deep = useDeep();
  const levelRef = useRef<any>();
  const config = useContext(ConfigContext);

  const valueTables = useMemo(() => ({
    [deep.idLocal('@deep-foundation/core', 'String')]: 'strings',
    [deep.idLocal('@deep-foundation/core', 'Number')]: 'numbers',
    [deep.idLocal('@deep-foundation/core', 'Object')]: 'objects',
    [deep.idLocal('@deep-foundation/core', 'File')]: 'files',
  }), []);

  const link = item.linkId ? deep.minilinks.byId[item.linkId] : undefined;

  const { data: [actual] } = deep.useSubscription(link.id);

  const value = link?.value?.value;
  const valueType = useMemo(() => link?.type?.outByType[deep.idLocal('@deep-foundation/core', 'Value')]?.[0]?.to_id, [link]);

  const [_value, _setValue] = useState(
    valueTables[valueType] === 'strings' ? value || '' :
    valueTables[valueType] === 'numbers' ? `${value}` :
    valueTables[valueType] === 'objects' ? JSON.stringify(value, null, 2) : '',
  );
  const resultValue = useMemo(() => {
    return valueTables[valueType] === 'strings' ? _value || '' :
    valueTables[valueType] === 'numbers' ? +_value :
    valueTables[valueType] === 'objects' ? JSON.parse(_value) : undefined;
  }, [_value]);

  const f = focus?.[focus.length-1];
  const isFocused = focus?.length-1 === i;

  const firstScrolled = useRef<any>(false);
  useEffect(() => {
    if (isFocused || !firstScrolled.current) {
      firstScrolled.current = true;
      levelRef?.current?.scrollIntoView({block: config.onescreen ? 'start' : "center", inline: config.onescreen ? 'start' : "nearest"});
    }
  }, [isFocused]);

  const { width, height } = useResizeDetector({ targetRef: levelRef });

  const update = useCallback(() => deep.value(link.id, resultValue), [link, resultValue]);

  return <Box
    ref={levelRef}
    minW={'40em'} maxW='100vw' h='100%'
    borderRight='1px solid' borderRightColor='deepColor'
    overflowY='scroll' overflowX='hidden' position='relative'
    onClick={(e) => {
      e.stopPropagation();
      e.preventDefault();
    }}
  >
    <Editor
      autoFocus
      height={`${height}px`}
      value={_value}
      onChange={_value => _setValue(_value)}
      onSave={update}
    />
    <Button
      w='3em' h='3em'
      transition='all 1s ease'
      position='absolute' right={!isEqual(resultValue, actual?.value?.value) ? '1em' : '-5em'} top='1em'
      boxShadow='dark-lg'
      variant={undefined}
      onClick={update}
    ><MdSaveAlt/></Button>
  </Box>
}, isEqual);

export const PathItemInsert = memo(function PathItemInsert({
  link, item,
  isActive, buttonRef, containerId,
}: {
  link: Link<Id>;
  item: PathItemI;
  isActive: boolean;
  buttonRef?: any;
  containerId: Id;
}) {
  const deep = useDeep();
  const config = useContext(ConfigContext);
  const go = useContext(GoContext);

  const insertTypeDisclosure = useDisclosure();
  const insertDescriptionDisclosure = useDisclosure();

  const insertFromDisclosure = useDisclosure();
  const insertToDisclosure = useDisclosure();

  const ref = useContext(FinderContext);

  const [type, setType] = useState<any>();
  const [aboutType, setAboutType] = useState<any>();
  const [fromId, setFromId] = useState<any>();
  const [toId, setToId] = useState<any>();
  const [from, setFrom] = useState<any>();
  const [to, setTo] = useState<any>();
  const [name, setName] = useState<string>('');
  const [value, setValue] = useState<string>('');

  const saveFrom = useDebounceCallback(async (from_id) => !!+from_id && setFrom(await loader({ query: { id: +from_id }, deep })), 1000);
  const saveTo = useDebounceCallback(async (to_id) => !!+to_id && setTo(await loader({ query: { id: +to_id }, deep })), 1000);

  useMinilinksApply(deep.minilinks, `tree-${config.scope}-type`, aboutType || { data: [] });
  useMinilinksApply(deep.minilinks, `tree-${config.scope}-from`, from || { data: [] });
  useMinilinksApply(deep.minilinks, `tree-${config.scope}-to`, to || { data: [] });

  const V = deep.idLocal('@deep-foundation/core', 'Value');
  const S = deep.idLocal('@deep-foundation/core', 'String');
  const N = deep.idLocal('@deep-foundation/core', 'Number');
  const O = deep.idLocal('@deep-foundation/core', 'Object');
  const tV = type?.id ? deep.minilinks.select({ type_id: V, from_id: type.id })[0]?.to_id : undefined;

  const { isValid, validated } = useMemo(() => {
    let validated: any = value, isValid = false;
    try {
      if (tV === S) isValid = true;
      if (tV === N) {
        validated = +value;
        isValid = typeof(validated) === 'number' && !Number.isNaN(validated);
      }
      if (tV === O) {
        validated = JSON.parse(value as string);
        isValid = true;
      }
    } catch(e) {
      return { validated, isValid };
    }
    return { validated, isValid };
  }, [value]);

  // const { data: [_from] } = useLoader({ query: from ? { id: from } : { limit: 0 } });
  // const { data: [_to] } = useLoader({ query: to ? { id: to } : { limit: 0 } });

  const insertQuery = type ? {
    type_id: type.id,
    ...(from && to ? { from_id: fromId, to_id: toId } : {}),
    containerId,
    ...(name ? { name } : {}),
    ...(tV == S ? { string: { data: { value: validated } } } : tV == N ? { number: { data: { value: validated } }} : tV == O ? { object: { data: { value: validated } } } : {}),
  } : {};

  const buttons = <>
    <SlideFade in={true} offsetX='-0.5rem' style={{position: 'absolute', top: 0, right: '-4em'}}>
      <Button
        w='3em' h='3em'
        boxShadow='dark-lg'
        variant={undefined}
        onClick={async () => {
          insertDescriptionDisclosure.onClose();
        }}
      ><BsX /></Button>
    </SlideFade>
    <SlideFade in={((!!fromId && !!toId) || type?.id === 1 || (!type?.from_id && !type?.to_id)) && (isValid || value === '')} offsetX='-0.5rem' style={{position: 'absolute', bottom: 0, right: '-4em'}}>
      <Button
        w='3em' h='3em'
        boxShadow='dark-lg'
        variant={'active'}
        onClick={async () => {
          await deep.insert(insertQuery as any);
          insertDescriptionDisclosure.onClose();
        }}
      ><BsCheck2 /></Button>
    </SlideFade>
  </>;

  return <>
    <Button
      ref={isActive ? buttonRef : undefined}
      variant={isActive ? 'active' : undefined} justifyContent='center'
      onClick={() => {
        insertTypeDisclosure.onOpen();
      }}
    >
      <Text pr={1}>+</Text> insert
    </Button>
    <FinderPopover
      header='Choose type for insert instance of it:'
      linkId={link.id}
      mode='modal'
      disclosure={insertTypeDisclosure}
      onSubmit={async (link) => {
        setAboutType(await loader({ query: {
          type_id: V,
          return: { item: { relation: 'from', type_id: link.id } }
        }, deep }));
        setType(link);
        insertDescriptionDisclosure.onOpen();
      }}
    >
      <div/>
    </FinderPopover>
    <Modal isOpen={insertDescriptionDisclosure.isOpen} onClose={insertDescriptionDisclosure.onClose} portalProps={{ containerRef: ref }}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader position='absolute' bottom='100%'>Describe your<br/>new Link of type:</ModalHeader>
        <Box position='absolute' bottom='100%' maxW='50%' right={0}>
          {!!type && <LinkButton id={type.id} onClick={() => insertTypeDisclosure.onOpen()} maxW='100%'/>}
        </Box>
        <ModalBody p='1em'>
          {((!!type?.from_id && !!type?.to_id) || type?.id === 1) && <>
            <SimpleGrid columns={2} spacing={'1em'}>
              <Box>
                <Button fontSize='sm' float='right' leftIcon={<FromIcon />}>from</Button>
                <InputGroup size='md'>
                  <Input
                    type="number" placeholder='from_id' h='3em'
                    value={fromId} onChange={e => {
                      setFromId(+e.target.value);
                      saveFrom(+e.target.value);
                    }}
                  />
                  <InputRightElement m='0.25em'>
                    <FinderPopover
                      header='Choose link.from:'
                      linkId={fromId || deep.linkId}
                      mode='modal'
                      disclosure={insertFromDisclosure}
                      onSubmit={async (link) => {
                        setFromId(link.id);
                        setFrom(link);
                      }}
                    >
                      <Button h='3em' w='3em' size='sm' onClick={() => insertFromDisclosure.onOpen()}>
                        🪬
                      </Button>
                    </FinderPopover>
                  </InputRightElement>
                </InputGroup>
              </Box>
              <Box>
                <Button fontSize='sm' float='left' rightIcon={<ToIcon />}>to</Button>
                <InputGroup size='md'>
                  <Input
                    type="number" placeholder='to_id' h='3em'
                    value={toId} onChange={e => {
                      setToId(+e.target.value);
                      saveTo(+e.target.value);
                    }}
                  />
                  <InputRightElement m='0.25em'>
                    <FinderPopover
                      header='Choose link.to:'
                      linkId={toId || deep.linkId}
                      mode='modal'
                      disclosure={insertToDisclosure}
                      onSubmit={async (link) => {
                        setToId(link.id);
                        setTo(link);
                      }}
                    >
                      <Button h='3em' w='3em' size='sm' onClick={() => insertToDisclosure.onOpen()}>
                        🪬
                      </Button>
                    </FinderPopover>
                  </InputRightElement>
                </InputGroup>
              </Box>
            </SimpleGrid>
            <SimpleGrid columns={2} spacing={'1em'}>
              <Box>
                {!!from && <LinkButton id={fromId} w='100%'/>}
              </Box>
              <Box>
                {!!to && <LinkButton id={toId} w='100%'/>}
              </Box>
            </SimpleGrid>
            <Divider/>
          </>}
          <Button fontSize='sm' float='left' leftIcon={<FromIcon />} rightIcon={<ToIcon />}>name for 🗂️ contain:</Button>
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <Divider mt='1em' mb='1em'/>
          <Box position='relative'>
            {tV === S && <>
              <Editor
                value={value}
                placeholder='String value'
                onChange={setValue}
              />
            </>}
            {tV === N && <>
              <Input
                type='string'
                value={value}
                placeholder='Number value'
                onChange={e => setValue(e.target.value)}
              />
            </>}
            {tV === O && <>
              <Editor
                value={value}
                placeholder='Object value'
                onChange={setValue}
              />
            </>}
            {(tV === S || tV === N || tV === O) && <Tag
              size='lg' colorScheme={value === '' ? 'black' : isValid ? 'deepActive' : 'danger'} variant='solid' borderRadius='full'
              position='absolute' bottom='-0.5em' right='-0.5em'
            >{value === '' ? 'empty' : isValid ? 'valid' : 'invalid'}</Tag>}
          </Box>
          <Divider mt='1em' mb='1em'/>
          <Editor
            value={JSON.stringify(insertQuery, null, 2)}
            editable={false} readOnly
          />
        </ModalBody>
        {buttons}
      </ModalContent>
    </Modal>
  </>
});

export const PathItemDelete = memo(function PathItemDelete({
  link, item,
  isActive, buttonRef, containerId,
}: {
  link: Link<Id>;
  item: PathItemI;
  isActive: boolean;
  buttonRef?: any;
  containerId?: Id;
}) {
  const deep = useDeep();
  const config = useContext(ConfigContext);
  const go = useContext(GoContext);

  const deleteDisclosure = useDisclosure();
  const ref = useContext(FinderContext);

  const [containment, setContainment] = useState<'contains' | 'container' | 'only'>('contains');
  const [down, setDown] = useState<boolean>(true);
  
  const { data: countDown }: any = deep.useQuery(deleteDisclosure.isOpen ? {
    up: {
      tree_id: deep.idLocal('@deep-foundation/core', 'containTree'),
      parent_id: link.id,
    },
  } : { limit: 0 }, { aggregate: 'count' });
  
  const { data: countInContains }: any = deep.useQuery({
    to_id: link.id,
    type_id: deep.idLocal('@deep-foundation/core', 'Contain'),
  }, { aggregate: 'count' });

  const deleteQuery = {
    _or: [
      (down ? {
        up: {
          tree_id: deep.idLocal('@deep-foundation/core', 'containTree'),
          parent_id: link.id,
        },
      } : {
        id: link.id,
      }),
      ...(containment === 'contains' ? [{
        type_id: deep.idLocal('@deep-foundation/core', 'Contain'),
        to_id: link.id,
      }] : containment === 'container' ? [{
        type_id: deep.idLocal('@deep-foundation/core', 'Contain'),
        from_id: containerId, to_id: link.id,
      }] : []),
    ],
  };

  return <>
    <Button
      ref={isActive ? ref : undefined}
      variant={isActive ? 'active' : 'danger'} justifyContent='left' textAlign='left'
      h='3em' w='3em'
      onClick={() => deleteDisclosure.onOpen()}
      disabled={!link?.to_id}
    ><BsXLg/></Button>
    <Modal isOpen={deleteDisclosure.isOpen} onClose={deleteDisclosure.onClose} portalProps={{ containerRef: ref }}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader position='absolute' bottom='100%'>Delete this link?:</ModalHeader>
        <Box position='absolute' bottom='100%' maxW='50%' right={0}>
          <LinkButton id={link.id} maxW='100%'/>
        </Box>
        <ModalBody>
          <Box>
            <Checkbox size='lg' checked={down} onChange={() => setDown(!down)}>
              Delete all contained in links? Total: ({countDown})
            </Checkbox>
          </Box>
          <Box>
            <Button fontSize='sm' rightIcon={<ToIcon />}>Need to delete contains to this link?</Button>
          </Box>
          <Box>
            <SimpleGrid columns={3}>
              <Button variant={containment === 'contains' ? 'active' : undefined} onClick={() => setContainment('contains')}><Box>
                <Box>all in</Box>
                <Box fontSize='xs'>contains: ({countInContains})</Box>
              </Box></Button>
              {!!containerId && <Button variant={containment === 'container' ? 'active' : undefined} onClick={() => setContainment('container')}><Box>
                <Box>only one</Box>
                <Box fontSize='xs'>from {containerId}</Box>
              </Box></Button>}
              <Button variant={containment === 'only' ? 'active' : undefined} onClick={() => setContainment('only')}><Box>
                <Box>not need</Box>
                <Box fontSize='xs'>to delete contains</Box>
              </Box></Button>
            </SimpleGrid>
          </Box>
          <Editor
            value={JSON.stringify(deleteQuery, null, 2)}
            editable={false} readOnly
          />
        </ModalBody>
        <ModalFooter>
          <SimpleGrid columns={2} w='100%'>
            <Button variant='active' onClick={() => deleteDisclosure.onClose()}>cancel</Button>
            <Button variant={'danger'} autoFocus onClick={async () => {
              await deep.delete(deleteQuery);
              deleteDisclosure.onClose();
            }}>delete</Button>
          </SimpleGrid>
        </ModalFooter>
      </ModalContent>
    </Modal>
  </>
});

export const PathItemSearch = memo(function PathItemSearch({
  link, item,
  isActive, buttonRef, containerId,
}: {
  link: Link<Id>;
  item: PathItemI;
  isActive: boolean;
  buttonRef?: any;
  containerId?: Id;
}) {
  return <>
  
  </>
});

export const PathItem = memo(function PathItem({
  item,
  focus,
  i,
  refVisibility,
}: {
  item: PathItemI;
  focus?: PathI;
  i: number;
  refVisibility?: any;
}) {
  const deep = useDeep();
  const config = useContext(ConfigContext);
  const go = useContext(GoContext);
  const symbol = useSymbol();

  const f = focus?.[focus.length-1];
  const isFocused = focus?.length-1 === i;
  const p: NavDirection | undefined = isFocused ? f.position as NavDirection || 'auto' : undefined;

  useLoader({ query: item.linkId ? { id: item.linkId } : { limit: 0 }, refVisibility, i });
  // @ts-ignore
  const { data: results, originalData } = useLoader({ query: item.query, refVisibility, i });
  config.results.current[i] = { results, originalData };
  const link = item.linkId ? deep.minilinks.byId[item.linkId] : undefined;

  const value = link?.value?.value;
  const valueType = useMemo(() => link?.type?.outByType[deep.idLocal('@deep-foundation/core', 'Value')]?.[0]?.to_id, [link]);

  const pathItemRef = useRef<any>();
  const ref = useRef<any>();
  const firstScrolled = useRef<any>(false);
  useEffect(() => {
    if (isFocused || !firstScrolled.current) {
      firstScrolled.current = true;
      ref?.current?.scrollIntoView({block: config.onescreen ? 'start' : "center", inline: config.onescreen ? 'start' : "nearest"});
      pathItemRef?.current?.scrollIntoView({block: config.onescreen ? 'start' : "center", inline: config.onescreen ? 'start' : "nearest"});
    }
  }, [isFocused]);

  const focusedResult = isFocused && f.position === 'results' ? focus?.[focus?.length - 1] : undefined;

  const resultsView = useMemo(() => {
    return results.map((l, ii) => (l.id === link?.id ? <></> : <Result key={l.id} link={l} resultIndex={ii} pathItemIndex={i} isFocused={focusedResult?.index === ii} _tree_position_ids={item.mode === 'upTree' || item.mode === 'downTree' ? (originalData[ii]?.positionids || []).map(p => p.position_id) : undefined}/>));
  }, [results, focusedResult, item]);

  const fromDisclosure = useDisclosure();
  const toDisclosure = useDisclosure();

  return <VisibilitySensor partialVisibility onChange={(isVisible) => {
    refVisibility.current[i] = isVisible;
    console.log(refVisibility.current);
  }}><Box
    {...(config.onescreen ? { minW: config.width, w: config.width } : { minW: '25em', w: '25em' })}
    h='100%'
    borderRight='1px solid' borderRightColor='deepColor'
    overflowY='scroll'
    onClick={(e) => {
      e.stopPropagation();
      e.preventDefault();
    }}
  >
    {!!link && <>
      <Box borderBottom='1px solid' borderBottomColor='deepColor' overflowX='hidden' ref={pathItemRef}>
        <PathItemSearch link={link} isActive={p === 'delete'} buttonRef={p === 'delete' ? ref : undefined} containerId={link.id} item={item}/>
        <Flex>
          <LinkButton id={link.id} flex='1' isActive={p === 'current'} onClick={() => go({ itemIndex: -1, position: 'current', active: true })}/>
          <PathItemDelete link={link} isActive={p === 'delete'} buttonRef={p === 'delete' ? ref : undefined} containerId={link.id} item={item}/>
        </Flex>
        <SimpleGrid columns={3}>
          <Flex>
            {!!link?.['from_id'] ? <FinderPopover
              disclosure={fromDisclosure}
              header='Choose new link.from:'
              linkId={link.from_id}
              mode='modal'
              onSubmit={(l) => deep.update(link.id, { from_id: l.id })}
            >
              <Button
                ref={p === 'edit-from' ? ref : undefined}
                variant={p === 'edit-from' ? 'active' : undefined} justifyContent='right' textAlign='right' h='3em'
                onClick={() => {
                  go({ itemIndex: i, position: 'edit-from', active: true });
                  fromDisclosure.onOpen();
                }}
                disabled={!link?.from_id}
              ><Box>
                <MdEdit/>
              </Box></Button>
            </FinderPopover> : <Box/>}
            <Button
              ref={p === 'from' ? ref : undefined}
              variant={!link?.['from_id'] ? 'disabled' : p === 'from' ? 'active' : undefined} justifyContent='right' textAlign='right'
              flex='1' h='3em'
              onClick={() => go({ itemIndex: i, position: 'from', active: true })}
              disabled={!link?.from_id}
              rightIcon={<FromIcon />}
            ><Box>
              <Text>from</Text>
              <Box><Text fontSize='xs'>{symbol(link?.from)} {!!link?.from && deep.nameLocal(link.from_id)} {link?.from_id}</Text></Box>
            </Box></Button>
          </Flex>
          <Button
            ref={p === 'type' ? ref : undefined}
            variant={!link?.['type_id'] ? 'disabled' : p === 'type' ? 'active' : undefined}
            onClick={() => go({ itemIndex: i, position: 'type', active: true })} h='3em'
            disabled={!link?.type_id}
            leftIcon={<TypeIcon />}
          ><Box>
            <Text>type</Text>
            <Box><Text fontSize='xs'>{symbol(link?.type)} {!!link?.type && deep.nameLocal(link.type_id)} {link?.type_id}</Text></Box>
          </Box></Button>
          <Flex>
            <Button
              ref={p === 'to' ? ref : undefined}
              variant={!link?.['to_id'] ? 'disabled' : p === 'to' ? 'active' : undefined} justifyContent='left' textAlign='left'
              flex='1' h='3em'
              onClick={() => go({ itemIndex: i, position: 'to', active: true })}
              disabled={!link?.to_id}
              rightIcon={<ToIcon />}
            ><Box>
              <Text>to</Text>
              <Box><Text fontSize='xs'>{symbol(link?.to)} {!!link?.to && deep.nameLocal(link.to_id)} {link?.to_id}</Text></Box>
            </Box></Button>
            {!!link?.['to_id'] ? <FinderPopover
              disclosure={toDisclosure}
              header='Choose new link.to:'
              linkId={link.id}
              mode='modal'
              onSubmit={async (l) => deep.update(link.id, { to_id: l.id })}
            ><Button
              ref={p === 'edit-to' ? ref : undefined}
              variant={p === 'edit-to' ? 'active' : undefined} justifyContent='right' textAlign='right' h='3em'
              onClick={() => {
                go({ itemIndex: i, position: 'edit-to', active: true });
                toDisclosure.onOpen();
              }}
              disabled={!link?.to_id}
            ><Box>
              <MdEdit/>
            </Box></Button></FinderPopover> : <Box/>}
          </Flex>
        </SimpleGrid>
        <SimpleGrid columns={3}>
          <Button
            ref={p === 'out' ? ref : undefined}
            variant={p === 'out' ? 'active' : undefined} justifyContent='left' textAlign='left'
            onClick={() => go({ itemIndex: i, position: 'out', active: true })}
            leftIcon={<OutIcon />}
          >
            <Text>out</Text>
          </Button>
          {/* <IconButton aria-label='typed' icon={<TypedIcon />} /> */}
          <Button
            ref={p === 'typed' ? ref : undefined}
            variant={p === 'typed' ? 'active' : undefined}
            onClick={() => go({ itemIndex: i, position: 'typed', active: true })}
            leftIcon={<TypedIcon />}
          >
            <Text>typed</Text>
          </Button>
          <Button
            ref={p === 'in' ? ref : undefined}
            variant={p === 'in' ? 'active' : undefined} justifyContent='right' textAlign='right'
            onClick={() => go({ itemIndex: i, position: 'in', active: true })}
            rightIcon={<InIcon />}
          >
            <Text>in</Text>
          </Button>
        </SimpleGrid>
        <SimpleGrid columns={2}>
          <Button
            ref={p === 'up' ? ref : undefined}
            variant={p === 'up' ? 'active' : undefined} justifyContent='center'
            onClick={() => go({ itemIndex: i, position: 'up', active: true })}
            leftIcon={<UpIcon />}
          >
            <Text>up</Text>
          </Button>
          <Button
            ref={p === 'down' ? ref : undefined}
            variant={p === 'down' ? 'active' : undefined} justifyContent='center'
            onClick={() => go({ itemIndex: i, position: 'down', active: true })}
            leftIcon={<DownIcon />}
          >
            <Text>down</Text>
          </Button>
        </SimpleGrid>
        <SimpleGrid columns={4}>
          <Button
            ref={p === 'selectors' ? ref : undefined}
            variant={p === 'selectors' ? 'active' : undefined} justifyContent='center'
            onClick={() => go({ itemIndex: i, position: 'selectors', active: true })}
          >
            <Text pr={1}>🪡</Text> selectors
          </Button>
          <Button
            ref={p === 'selected' ? ref : undefined}
            variant={p === 'selected' ? 'active' : undefined} justifyContent='center'
            onClick={() => go({ itemIndex: i, position: 'selected', active: true })}
          >
            <Text pr={1}>🪡</Text> selected
          </Button>
          <Button
            ref={p === 'promises' ? ref : undefined}
            variant={p === 'promises' ? 'active' : undefined} justifyContent='center'
            onClick={() => go({ itemIndex: i, position: 'promises', active: true })}
          >
            <Text pr={1}>🤞</Text> promises
          </Button>
          <Button
            ref={p === 'rejects' ? ref : undefined}
            variant={p === 'rejects' ? 'active' : undefined} justifyContent='center'
            onClick={() => go({ itemIndex: i, position: 'rejects', active: true })}
          >
            <Text pr={1}>🔴</Text> rejects
          </Button>
        </SimpleGrid>
        <Box borderBottom='1px solid' borderBottomColor='deepColor'>
          <SimpleGrid columns={1}>
            {!valueType && <>
              <Button
                ref={p === 'value' ? ref : undefined}
                variant={p === 'value' ? 'active' : undefined} justifyContent='center'
                onClick={() => go({ itemIndex: i, position: 'value', active: true })}
              >
                type can't have value, allow?
              </Button>
            </>}
            {valueType === deep.idLocal('@deep-foundation/core', 'String') && <>
              <Button
                ref={p === 'value' ? ref : undefined}
                variant={p === 'value' ? 'active' : undefined} justifyContent='center'
                onClick={() => go({ itemIndex: i, position: 'value', active: true })}
              >
                <Text pr={1}>""</Text> string
              </Button>
            </>}
            {valueType === deep.idLocal('@deep-foundation/core', 'Number') && <>
              <Button
                ref={p === 'value' ? ref : undefined}
                variant={p === 'value' ? 'active' : undefined} justifyContent='center'
                onClick={() => go({ itemIndex: i, position: 'value', active: true })}
              >
                <Text pr={1}>{+link?.value?.value}</Text> number
              </Button>
            </>}
            {valueType === deep.idLocal('@deep-foundation/core', 'Object') && <>
              <Button
                ref={p === 'value' ? ref : undefined}
                variant={p === 'value' ? 'active' : undefined} justifyContent='center'
                onClick={() => go({ itemIndex: i, position: 'value', active: true })}
              >
                <Text pr={1}>{`{...}`}</Text> object
              </Button>
            </>}
          </SimpleGrid>
        </Box>
        <SimpleGrid columns={config.insert ? 2 : 1}>
          <Button
            ref={p === 'contains' ? ref : undefined}
            variant={p === 'contains' ? 'active' : undefined} justifyContent='center'
            onClick={() => go({ itemIndex: i, position: 'contains', active: true })}
          >
            <Text pr={1}>🗂️</Text> contains
          </Button>
          {!!config.insert && <PathItemInsert link={link} isActive={p === 'insert'} buttonRef={ref} containerId={link.id} item={item}/>}
        </SimpleGrid>
      </Box>
    </>}
    {resultsView}
  </Box></VisibilitySensor>;
}, isEqual);

let itemsCounter = 0;

const modes = {
  'up': 'upTree',
  'upTree': 'upTreeBranch',
  'down': 'downTree',
};

export const Tree = memo(function Tree({
  query,
  linkId,
  scope,
  onEnter,
  onChange,
  autoFocus = false,
  onescreen: _onescreen,
  insert=true,
}: {
  query?: any;
  linkId?: Id;
  scope: string;
  onEnter?: onEnterI;
  onChange?: onChangeI;
  autoFocus?: boolean;
  onescreen?: boolean;
  insert?: boolean;
}) {
  const deep = useDeep();

  const [__onescreen, setOnescreen] = useState(false);
  const onescreen = typeof(_onescreen) === 'boolean' ? _onescreen : __onescreen;

  const { width, height, ref } = useResizeDetector();
  const dinamicOnescreen = useBreakpointValue(
    { base: true, md: false, },
    { fallback: 'md' },
  );
  useEffect(() => setOnescreen(dinamicOnescreen), [dinamicOnescreen]);

  const { enabledScopes, disableScope, enableScope } = useHotkeysContext();
  useEffect(() => {
    const treeScopes = enabledScopes.filter(s => s.includes('tree-hotkeys-scope-'));
    if (!treeScopes.length) enableScope(`tree-hotkeys-scope-${scope}`);
  }, [enabledScopes]);
  useEffect(() => {
    const treeScopes = enabledScopes.filter(s => s.includes('tree-hotkeys-scope-'));
    for (let i = 0; i < treeScopes.length; i++) disableScope(treeScopes[i]);
    enableScope(`tree-hotkeys-scope-${scope}`);
    return () => disableScope(`tree-hotkeys-scope-${scope}`);
  }, []);

  const queries = useMemo(() => ({
    out: (linkId) => ({ from_id: linkId }),
    typed: (linkId) => ({ type_id: linkId }),
    in: (linkId) => ({ to_id: linkId }),
    contains: (linkId) => ({ in: { type_id: deep.idLocal('@deep-foundation/core', 'Contain'), from_id: linkId } }),
    promises: (linkId) => ({
      type_id: deep.idLocal('@deep-foundation/core', 'Promise'),
      up: {
        tree_id: deep.idLocal('@deep-foundation/core', 'containTree'),
        parent_id: linkId,
      },
      order_by: { id: 'desc' },
    }),
    rejects: (linkId) => ({
      type_id: deep.idLocal('@deep-foundation/core', 'Rejected'),
      up: {
        tree_id: deep.idLocal('@deep-foundation/core', 'containTree'),
        parent_id: linkId,
      },
      order_by: { id: 'desc' },
    }),
    upTrees: (linkId) => ({
      type_id: deep.idLocal('@deep-foundation/core', 'Tree'),
      tree: {
        link_id: linkId,
      },
    }),
    upTree: (linkId, treeId) => ({
      down: {
        depth: { _eq: 0 },
        self: { _eq: true },
        tree_id: treeId,
        by_parent: {
            tree_id: treeId,
            link_id: linkId
        },
      },
      return: {
        positionids: {
          relation: 'up',
          tree_id: { _eq: treeId },
          self: { _eq: true },
        },
      },
    }),
    upTreeBranch: (linkId, treeId, rootId) => ({
      up: {
        root_id: { _eq: rootId },
        tree_id: { _eq: treeId },
      },
      down: {
        link_id: { _eq: linkId },
        tree_id: { _eq: treeId },
      },
      return: {
        level: {
          relation: 'up',
          root_id: { _eq: rootId },
          tree_id: { _eq: treeId },
          self: { _eq: true },
        },
      },
    }),
    downTrees: (linkId) => ({
      type_id: deep.idLocal('@deep-foundation/core', 'Tree'),
      tree: {
        parent_id: linkId,
      },
    }),
    downTree: (linkId, treeId) => ({
      up: {
        tree_id: treeId,
        parent_id: linkId,
      },
    }),
    selectors: (linkId) => ({
      type_id: deep.idLocal('@deep-foundation/core', 'Selector'),
      selected: { item_id: { _eq: linkId } },
    }),
    selected: (linkId) => ({
      selectors: {
        selector_id: { _eq: linkId }
      },
    }),
  }), []);

  const [path, setPath] = useState<PathI>([
    {
      key: itemsCounter++,
      query: query || queries.contains(deep.linkId),
      linkId: query ? linkId || undefined : linkId || deep.linkId,
      position: 'current',
      index: -1,
    },
  ]);

  const [focus, setFocus] = useState<PathI>([
    { position: 'current', index: -1, linkId }
  ]);

  const refPath = useRef(path);
  refPath.current = path;
  const refFocus = useRef(focus);
  refFocus.current = focus;
  const refResults = useRef([]);
  const refVisibility = useRef<any>({});

  useEffect(() => {
    if (focus.length > path.length) setFocus(focus.slice(path.length))
  }, [focus, path]);

  const focusedLinkId = refResults?.current?.[focus.length - 1]?.results?.[focus[focus.length - 1]?.index]?.id || path[focus.length - 1]?.linkId;
  useEffect(() => {
    onChange && focusedLinkId && onChange(deep.minilinks.byId[focusedLinkId], focus);
  }, [focusedLinkId]);

  const go = useCallback((item) => {
    const r = refResults.current;
    let f = refFocus.current;
    let p = refPath.current;

    let ff, pp;

    if (typeof(item.itemIndex) === 'number') {
      f = f.slice(0, item.itemIndex + 1);
    }

    let fi = typeof(item.itemIndex) === 'number' ? item.itemIndex : f?.length - 1;

    if (item.position) {
      if (['current', 'delete', 'edit-from', 'from', 'type', 'to', 'edit-to', 'out', 'typed', 'in', 'up', 'down', 'value', 'contains', 'insert', 'promises', 'rejects', 'selectors', 'selected'].includes(item.position)) {
        if (item.position === 'from' && !deep.minilinks.byId[p[fi]?.linkId]?.[`from_id`]) {
          go({ ...item, position: f[fi].position === 'type' ? 'prev' : 'type' });
        } else if (item.position === 'to' && !deep.minilinks.byId[p[fi]?.linkId]?.[`to_id`]) {
          go({ ...item, position: f[fi].position === 'type' ? 'next' : 'type' });
        } else {
          setPath(pp = [
            ...p.slice(0, fi),
            { ...p[fi], position: item.position, index: -1 },
            ...p.slice(f.length),
          ]);
          setFocus(ff = [
            ...f.slice(0, fi),
            { ...f[fi], position: item.position, index: -1 },
          ]);
        }
      } else if(item.position === 'results') {
        if (typeof(item.index) === 'number') {
          setPath(pp = [
            ...p.slice(0, fi),
            { ...p[fi], position: item.position, index: item.index },
            ...p.slice(f.length),
          ]);
          setFocus(ff = [
            ...f.slice(0, fi),
            { ...f[fi], position: item.position, index: item.index },
            ...f.slice(f.length),
          ]);
        } else if(item.query) {
          setPath(pp = [
            ...p.slice(0, fi),
            { ...p[fi], query: item.query, position: item.position, index: 0 },
            ...p.slice(f.length),
          ]);
          setFocus(ff = [
            ...f.slice(0, fi),
            { ...f[fi], position: item.position, index: 0 },
          ]);
        }
      } else if (item.position === 'next') {
        let nextMode;
        if (p[fi].mode) nextMode = modes[p[fi].mode];
        if (nextMode === 'upTree') {
          const linkId = r[fi]?.results?.[f[fi].index]?.id || p?.[fi+1]?.linkId;
          if (linkId) {
            if (p?.[fi+1]?.linkId != linkId) {
              setPath(pp = [
                ...p.slice(0, fi),
                { ...p[fi], position: 'results', index: f[fi].index },
                { key: itemsCounter++, position: 'results', index: 0, linkId: linkId, query: queries.upTree(p[fi].linkId, linkId), mode: nextMode },
              ] as PathI);
            }
            setFocus(ff = [
              ...f.slice(0, fi),
              { ...f[fi], position: 'results', index: f[fi].index },
              { position: 'results', index: 0 },
            ] as PathI);
          }
        } else if (nextMode === 'upTreeBranch') {
          const linkId = r[fi]?.results?.[f[fi].index]?.id || p?.[fi+1]?.linkId;
          if (linkId) {
            if (p?.[fi+1]?.linkId != linkId) {
              setPath(pp = [
                ...p.slice(0, fi),
                { ...p[fi], position: 'results', index: f[fi].index },
                { key: itemsCounter++, position: 'results', index: 0, linkId: linkId, query: queries.upTreeBranch(p[fi - 1].linkId, p[fi].linkId, linkId), mode: nextMode },
              ] as PathI);
            }
            setFocus(ff = [
              ...f.slice(0, fi),
              { ...f[fi], position: 'results', index: f[fi].index },
              { position: 'results', index: 0 },
            ] as PathI);
          }
        } else if (nextMode === 'downTree') {
          const linkId = r[fi]?.results?.[f[fi].index]?.id || p?.[fi+1]?.linkId;
          if (linkId) {
            if (p?.[fi+1]?.linkId != linkId) {
              setPath(pp = [
                ...p.slice(0, fi),
                { ...p[fi], position: 'results', index: f[fi].index },
                { key: itemsCounter++, position: 'results', index: 0, linkId: linkId, query: queries.downTree(p[fi].linkId, linkId), mode: nextMode },
              ] as PathI);
            }
            setFocus(ff = [
              ...f.slice(0, fi),
              { ...f[fi], position: 'results', index: f[fi].index },
              { position: 'results', index: 0 },
            ] as PathI);
          }
        } else if (item.linkId) {
          setPath(pp = [
            ...p.slice(0, fi),
            { ...p[fi], position: 'results', index: item.index },
            { key: itemsCounter++, position: p[fi+1]?.position || 'contains', index: typeof(p[fi+1]?.index) === 'number' ? p[fi+1]?.index : 0, linkId: item.linkId, query: queries.contains(item.linkId) },
          ] as PathI);
          setFocus(ff = [
            ...f.slice(0, fi),
            { ...f[fi], position: 'results', index: item.index }
          ] as PathI);
        } else {
          item.linkId = r?.[fi]?.results?.[f[fi]?.index]?.id;
          if (f[fi]?.position === 'results' && typeof(f[fi]?.index) === 'number' && item.linkId) {
            if (p?.[fi+1]?.linkId !== item.linkId) {
              setPath(pp = [
                ...p.slice(0, fi),
                { ...p[fi], position: f[fi].position, index: f[fi].index },
                { key: itemsCounter++, position: p[fi+1]?.position || 'contains', index: 0, linkId: item.linkId, query: queries.contains(item.linkId) },
              ]);
            }
            setFocus(ff = [
              ...f.slice(0, fi),
              { ...f[fi], position: f[fi].position, index: f[fi].index },
              { position: p[fi+1]?.position || 'contains', index: typeof(p[fi+1]?.index) === 'number' ? p[fi+1]?.index : 0 },
            ]);
          } else if(p[fi+1]) {
            setFocus(ff = [
              ...f.slice(0, fi+1),
              { position: p[fi+1].position, index: p[fi+1].index },
            ]);
          }
        }
      } else if(item.position === 'prev') {
        if (f.length > 1) setFocus(ff = [
          ...f.slice(0, fi),
        ]);
      }
    }

    p = pp || p;
    f = ff || f;
    fi = typeof(item.itemIndex) === 'number' ? item.itemIndex : f?.length - 1;

    if(item.active && f[fi]) {
      if (f[fi]?.position === 'value') {
        setPath([
          ...p.slice(0, fi),
          { ...p[fi], position: f[fi].position },
          { key: itemsCounter++, ...p[fi], mode: 'editor' },
        ]);
        setFocus([
          ...f.slice(0, fi),
          { ...f[fi], position: f[fi].position },
          {},
        ]);
      } else {
        const link = deep.minilinks.byId[p[fi]?.linkId];
        if (!link) return;
        if (['from', 'type', 'to'].includes(f[fi].position)) {
          go({
            position: 'next', itemIndex: fi,
            linkId: link[`${f[fi].position}_id`],
          });
        } else if (['out', 'typed', 'in', 'contains', 'promises', 'rejects', 'selectors', 'selected'].includes(f[fi].position)) {
          setPath([
            ...p.slice(0, fi),
            { ...p[fi], position: f[fi].position, query: queries[f[fi].position](link.id), mode: f[fi].position },
            ...p.slice(fi+1),
          ]);
          setFocus([
            ...f.slice(0, fi),
            { ...f[fi], position: f[fi].position },
          ]);
        } else if (['up', 'down'].includes(f[fi].position)) {
          setPath([
            ...p.slice(0, fi),
            { ...p[fi], position: f[fi].position, query: queries[`${f[fi].position}Trees`](link.id), mode: f[fi].position },
            ...p.slice(fi+1),
          ]);
          setFocus([
            ...f.slice(0, fi),
            { ...f[fi], position: f[fi].position },
          ]);
        }
      }
    }
  }, []);

  useHotkeys('up,down,right,left,space,enter', async (e, h) => {
    const r = refResults.current;
    const f = refFocus.current;

    const fi = f.length - 1;

    const cp = refPath.current[fi];
    const cpi = typeof(cp?.index) === 'number' ? cp.index : -1;
    const cpc = r[fi]?.results?.length || 0;
    let cpos = cp?.position || 'auto';

    if (h.keys.length > 1) return;
    if (h.keys[0] === 'up') {
      cpos = cpos === 'auto' ? (cpc > 0 ? 'results' : 'value') : cpos;
      const pos = cpos === 'results' && cpi > 0 ? cpos : navs[cpos]?.map?.[h.keys[0]];
      if (pos === 'results') {
        go({
          position: pos,
          index: cpi < 0 ? (cpc - 1) : (cpi - 1),
        });
      } else {
        go({ position: pos });
      }
    }
    if (h.keys[0] === 'down') {
      cpos = cpos === 'auto' ? 'type' : cpos;
      const pos = navs[cpos]?.map?.[h.keys[0]];
      if (pos === 'results') {
        go({
          position: pos,
          index: cpi < 0 ? 0 : (cpc-1 > cpi ? cpi + 1 : cpi),
        });
      } else {
        go({ position: pos });
      }
    }
    if (h.keys[0] === 'right') {
      const pos = navs[cpos]?.map?.[h.keys[0]];
      go({ position: pos, active: cpos === 'value' });
    }
    if (h.keys[0] === 'left') {
      const pos = navs[cpos]?.map?.[h.keys[0]];
      go({ position: pos });
    }
    if (h.keys[0] === 'space') {
      go(cpos === 'results' ? { position: 'next' } : { active: true });
    }
    if (h.keys[0] === 'enter') {
      go({ active: true });
    }
  }, { preventDefault: true, scopes: `tree-hotkeys-scope-${scope}` }, []);

  const pathItemsView = useMemo(() => {
    return path.map((p, i) => {
      const Component = p.mode === 'editor' ? EditorPathItem : PathItem;
      return <Component key={p.key} i={i} item={p} focus={focus.length - 1 === i ? focus : undefined} refVisibility={refVisibility}/>;
    });
  }, [path, focus]);

  const config = useMemo(() => {
    return {
      scope,
      onescreen, autoFocus,
      onEnter,
      focus: refFocus,
      path: refPath,
      results: refResults,
      width, height,
      insert,
    };
  }, [onescreen, autoFocus, width, height, insert]);

  console.log(JSON.stringify(path, null, 2), JSON.stringify(focus, null, 2));

  return <ConfigContext.Provider value={config}>
    <GoContext.Provider value={go}>
      <HStack
        ref={ref as any}
        position="absolute" left='0' top='0' right='0' bottom='0'
        overflowX={'scroll'} overflowY='hidden'
        autoFocus={autoFocus}
      >
        {pathItemsView}
      </HStack>
    </GoContext.Provider>
  </ConfigContext.Provider>;
}, () => true);