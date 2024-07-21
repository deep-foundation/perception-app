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
  Center,
  Progress,
  Spacer,
} from '@chakra-ui/react';
import { useDeep } from "@deep-foundation/deeplinks/imports/client";
import { useMinilinksApply } from "@deep-foundation/deeplinks/imports/minilinks";
import { Id, Link } from '@deep-foundation/deeplinks/imports/minilinks';
import { createContext, Dispatch, DOMElement, memo, SetStateAction, use, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useHotkeys, useHotkeysContext } from 'react-hotkeys-hook';
import { LinkButton } from './link';
import { link } from 'fs';
import { MdEdit, MdSaveAlt } from "react-icons/md";
import { AiOutlineStop } from "react-icons/ai";
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
import { BsX, BsCheck2, BsXLg, BsDatabase, BsRegex } from 'react-icons/bs';
import {useDebounce, useDebounceCallback} from '@react-hook/debounce';
import { GrClear } from 'react-icons/gr';
import VisibilitySensor from 'react-visibility-sensor';
import {matchSorter} from 'match-sorter';
import { GoContext, PathContext, FocusContext, ConfigContext, PathI, PathItemI, onEnterI, onChangeI, NavDirection } from './orientation';

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
    if (isFocused) ref.current.scrollIntoView({ block: "center", inline: "nearest", behavior: 'smooth' });
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
    borderBottom='solid 1px'
    borderBottomColor='deepBgHover'
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
  return {
    ...query,
    return: {
      ...(query?.return || {}),
      names: {
        relation: 'in',
        type_id: deep.idLocal('@deep-foundation/core', 'Contain'),
        return: {
          parent: { relation: 'from' },
        },
      },
      from: { relation: 'from' },
      to: { relation: 'to' },
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
  const refResults = useRef(results);
  refResults.current = results;
  useEffect(() => {
    const interval = setInterval(async () => {
      if (refVisibility.current[i]) {
        // @ts-ignore
        await refResults.current.refetch();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  return results;
};

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
      levelRef?.current?.scrollIntoView({ block: config.onescreen ? 'start' : "center", inline: config.onescreen ? 'start' : "nearest", behavior: 'smooth' });
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
    <FinderPopover
      scope={config.scope+'-insert'}
      header='Choose type for insert instance of it:'
      search='Type'
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
      <Button
        ref={isActive ? buttonRef : undefined}
        variant={isActive ? 'active' : undefined} justifyContent='center'
        onClick={() => {
          insertTypeDisclosure.onOpen();
        }}
      >
        <Text pr={1}>+</Text> insert
      </Button>
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
                      scope={config.scope+'-finder'}
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
                      scope={config.scope+'-to'}
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
            value={`await deep.insert(${JSON.stringify(insertQuery, null, 2)})`}
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
      ref={isActive ? buttonRef : undefined}
      variant={isActive ? 'active' : 'danger'} justifyContent='center'
      onClick={() => {
        deleteDisclosure.onOpen();
      }}
    >
      <Text pr={1}>x</Text> delete
    </Button>
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
            value={`await deep.delete(${JSON.stringify(deleteQuery, null, 2)})`}
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
  value: _value = '',
  query: _query,

  oneline = false,
  finder = false,
  where = {},
}: {
  link?: Link<Id>;
  item?: PathItemI;
  isActive?: boolean;
  buttonRef?: any;
  containerId?: Id;
  value?: string;
  query?: string;

  oneline?: boolean;
  finder?: boolean;
  where?: any;
}) {
  const deep = useDeep();
  const go = useContext(GoContext);
  const ref = useRef();
  const [value, setValue] = useState(_query ? JSON.stringify(_query) : _value);
  const [db, setDb] = useState(false);
  const [contains, setContains] = useState(false);
  const [regexp, setRegexp] = useState(false);
  const [values, setValues] = useState(false);
  const [query, setQuery] = useState(!_value && !!_query);
  
  const num = parseFloat(value);
  const q: any = { _or: [] };
  const _or = q._or;
  if (!Number.isNaN(num)) {
    _or.push({ id: num }, { number: { value: num } });
  }
  if (values) {
    if (regexp) _or.push({ string: { value: { _iregex: value } } });
    else _or.push({ string: { value: { _ilike: `%${value}%` } } });
  };
  _or.push({ in: { type_id: deep.idLocal('@deep-foundation/core', 'Contain'), string: { value: regexp ? { _iregex: value } : { _ilike: `%${value}%` } } } });
  if (!contains) q._not = { type_id: deep.idLocal('@deep-foundation/core', 'Contain') };

  const firstRef = useRef(false);
  useEffect(() => {
    if (value && firstRef.current) {
      search(value);
    }
    firstRef.current = true;
  }, [value, db, contains, regexp, values]);

  const queryRef = useRef(query);
  const valueRef = useRef(value);

  useEffect(() => {
    if (queryRef.current !== query) {
      if (!!query) setValue(JSON.stringify(q, null, 2));
      else setValue(valueRef.current);
      queryRef.current = query;
      valueRef.current = value;
    }
  }, [query]);

  const search = useDebounceCallback((value) => {
    let cq;
    if (query) try { cq = JSON.parse(value); } catch(error) {
      go({ error });
      console.error(error);
    }
    go({ position: 'results', query: query ? cq : q, search: query ? valueRef.current : value, local: !db, ...where });
  }, 1000);
  const { width, height, ref: resizeRef } = useResizeDetector();
  const finderDisclosure = useDisclosure();
  const config = useContext(ConfigContext);
  return <Box ref={resizeRef} position='relative'>
    <SimpleGrid columns={oneline ? 2 : 1} w={oneline ? finder ? '28em' : '25em' : undefined}>
      <Flex>
        {!!finder && <FinderPopover
          scope={config.scope+'-search'}
          mode='popover'
          search={query ? undefined : value}
          query={query ? ((() => {
            if (query) try { return JSON.parse(value); } catch(error) {}
          })()) : undefined}
          disclosure={finderDisclosure}
          where={{ position: 'results', mode: 'search' }}
          onSubmit={async (link) => {
            go({ position: 'next', search: link.id, linkId: link.id, mode: 'search' });
          }}
        >
          <Button h='3em' maxW='3em' w='3em' position='relative' bg='deepActiveBg' onClick={() => {}}>
            🪬
          </Button>
        </FinderPopover>}
        <Editor
          refEditor={ref}
          value={value}
          autofocus={config.autoFocus}
          height='3em' width={oneline ? '15em' : `${width}px`}
          onChange={value => {
            setValue(value);
          }}
          basicSetup={{
            lineNumbers: false
          }}
        />
      </Flex>
      <Flex>
        <Button h='3em' maxW='3em' w='3em' position='relative' onClick={() => setDb(!db)}>
          <BsDatabase/>
          {!db && <Center position='absolute' top='0' left='0' right='0' bottom='0' fontSize='2em'><AiOutlineStop/></Center>}
        </Button>
        <Button h='3em' maxW='3em' w='3em' position='relative' onClick={() => setRegexp(!regexp)}>
          <BsRegex/>
          {!regexp && <Center position='absolute' top='0' left='0' right='0' bottom='0' fontSize='2em'><AiOutlineStop/></Center>}
        </Button>
        <Button h='3em' maxW='3em' w='3em' position='relative' onClick={() => setQuery(!query)}>
          {`{q}`}
          {!query && <Center position='absolute' top='0' left='0' right='0' bottom='0' fontSize='2em'><AiOutlineStop/></Center>}
        </Button>
        <Spacer/>
        <Button h='3em' maxW='3em' w='3em' position='relative' onClick={() => setValues(!values)}>
          "v"
          {!values && <Center position='absolute' top='0' left='0' right='0' bottom='0' fontSize='2em'><AiOutlineStop/></Center>}
        </Button>
        <Button h='3em' maxW='3em' w='3em' position='relative' onClick={() => setContains(!contains)}>
          🗂️
          {!contains && <Center position='absolute' top='0' left='0' right='0' bottom='0' fontSize='2em'><AiOutlineStop/></Center>}
        </Button>
      </Flex>
    </SimpleGrid>
  </Box>
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
  const { data: _results, originalData, loading, error } = useLoader({ query: item.local ? { limit: 0 } : item.query, refVisibility, i });
  const local = deep.useMinilinksSubscription(item.local ? item.query : { limit: 0 });
  const results = item.local ? local : _results;
  config.results.current[i] = { results, originalData };
  const link = item.linkId ? deep.minilinks.byId[item.linkId] : undefined;

  useEffect(() => {
    if (item.mode === 'search' && results.length === 1) {
      go({ position: 'results', linkId: results[0].id, mode: 'search' });
    } else if (item.mode === 'search' && item.linkId) {
      go({ position: 'contains', active: true, mode: 'search' });
    }
  }, [results]);

  useEffect(() => {
    go({ loading, error });
  }, [loading, error]);

  const value = link?.value?.value;
  const valueType = useMemo(() => link?.type?.outByType[deep.idLocal('@deep-foundation/core', 'Value')]?.[0]?.to_id, [link]);

  const pathItemRef = useRef<any>();
  const ref = useRef<any>();
  const firstScrolled = useRef<any>(false);
  useEffect(() => {
    if (isFocused || !firstScrolled.current) {
      firstScrolled.current = true;
      ref?.current?.scrollIntoView({ block: config.onescreen ? 'start' : "center", inline: config.onescreen ? 'start' : "nearest", behavior: 'smooth' });
      pathItemRef?.current?.scrollIntoView({ block: config.onescreen ? 'start' : "center", inline: config.onescreen ? 'start' : "nearest", behavior: 'smooth' });
    }
  }, [isFocused]);

  const focusedResult = isFocused && f.position === 'results' ? focus?.[focus?.length - 1] : undefined;

  const resultsView = useMemo(() => {
    const sorted = item.search ? matchSorter(results.map(l => ({ id: l.id, name: l.name, value: l?.value?.value })), item.search, {keys: ['id','name','value']}) : undefined;
    return (sorted || results).map((ll, ii) => {
      const l = deep.minilinks.byId[ll.id];
      return (!l || l?.id === link?.id ? <></> : <Result key={l.id} link={l} resultIndex={ii} pathItemIndex={i} isFocused={focusedResult?.index === ii} _tree_position_ids={item.mode === 'upTree' || item.mode === 'downTree' ? (originalData[ii]?.positionids || []).map(p => p.position_id) : undefined}/>);
    });
  }, [results, focusedResult, item]);

  const fromDisclosure = useDisclosure();
  const toDisclosure = useDisclosure();

  return <VisibilitySensor partialVisibility onChange={(isVisible) => {
    refVisibility.current[i] = isVisible;
  }}><Box
    {...(config.onescreen ? { minW: config.width, w: config.width } : { minW: '25em', w: '25em' })}
    h='100%'
    borderRight='1px solid' borderRightColor='deepColor'
    overflowY='scroll' position='relative'
    onClick={(e) => {
      e.stopPropagation();
      e.preventDefault();
    }}
    >
    <PathItemSearch link={link} isActive={p === 'delete'} buttonRef={p === 'delete' ? ref : undefined} containerId={link?.id} item={item} value={item.search}/>
    <Button
      ref={p === 'close' ? ref : undefined}
      w='3em' h='3em' position='absolute' right='0' top='0' bg='deepBgDark'
      variant={p === 'close' ? 'active' : undefined}
      onClick={() => go({ itemIndex: i, position: 'close', active: true })}
    >x</Button>
    {!!link && <>
      <Box borderBottom='1px solid' borderBottomColor='deepColor' overflowX='hidden' ref={pathItemRef}>
        <Flex>
          {link && <LinkButton id={link?.id} flex='1' isActive={p === 'current'} onClick={() => go({ itemIndex: -1, position: 'current', active: true })} needParent={false}/>}
        </Flex>
        <SimpleGrid columns={2 + (config.insert ? 1 : 0) + (config.delete ? 1 : 0)}>
          <Button
            ref={p === 'parents' ? ref : undefined}
            variant={p === 'parents' ? 'active' : undefined} justifyContent='center'
            onClick={() => go({ itemIndex: i, position: 'parents', active: true })}
          >
            <Text pr={1}>🗂️</Text> parents
          </Button>
          <Button
            ref={p === 'contains' ? ref : undefined}
            variant={p === 'contains' ? 'active' : undefined} justifyContent='center'
            onClick={() => go({ itemIndex: i, position: 'contains', active: true })}
          >
            <Text pr={1}>🗂️</Text> contains
          </Button>
          {!!config.insert && <PathItemInsert link={link} isActive={p === 'insert'} buttonRef={ref} containerId={link.id} item={item}/>}
          {!!config.delete && <PathItemDelete link={link} isActive={p === 'delete'} buttonRef={p === 'delete' ? ref : undefined} containerId={link.id} item={item}/>}
        </SimpleGrid>
        <SimpleGrid columns={3}>
          <Flex>
            {!!link?.['from_id'] ? <FinderPopover
              scope={config.scope+'-from'}
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
              scope={config.scope+'-to'}
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
      </Box>
    </>}
    <Progress size='xs' isIndeterminate={item.loading} value={100} />
    {!item.loading && !item.error && !results?.length && <Text color='deepColorDisabled' p='2m' align='center'>No results</Text>}
    {!!item.error && <Editor
      value={JSON.stringify(item.error, Object.getOwnPropertyNames(item.error), 2)}
      editable={false} readonly
    />}
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
  autoFocus = false,
  onescreen: _onescreen,
}: {
  query?: any
  autoFocus?: boolean;
  onescreen?: boolean;
}) {
  const deep = useDeep();
  const path = useContext(PathContext);
  const focus = useContext(FocusContext);

  const refPath = useRef(path);
  refPath.current = path;
  const refFocus = useRef(focus);
  refFocus.current = focus;
  const refResults = useRef([]);
  const refVisibility = useRef<any>({});

  const [__onescreen, setOnescreen] = useState(false);
  const onescreen = typeof(_onescreen) === 'boolean' ? _onescreen : __onescreen;
  const pathItemsView = useMemo(() => {
    return path.map((p, i) => {
      const Component = p.mode === 'editor' ? EditorPathItem : PathItem;
      return <Component key={p.key} i={i} item={p} focus={focus.length - 1 === i ? focus : undefined} refVisibility={refVisibility}/>;
    });
  }, [path, focus]);

  return <HStack
    position="absolute" left='0' top='0' right='0' bottom='0'
    overflowX={'scroll'} overflowY='hidden'
    autoFocus={autoFocus}
  >
    {pathItemsView}
  </HStack>
}, () => true);