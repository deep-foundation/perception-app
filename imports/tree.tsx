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
  IconButton
} from '@chakra-ui/react';
import { useDeep } from "@deep-foundation/deeplinks/imports/client";
import { Id, Link } from '@deep-foundation/deeplinks/imports/minilinks';
import { createContext, Dispatch, DOMElement, memo, SetStateAction, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useHotkeys } from 'react-hotkeys-hook';
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

type NavDirection =  'current' | 'from' | 'type' | 'to' | 'out' | 'typed' | 'in' | 'up' | 'down' | 'promises' | 'rejects' | 'selectors' | 'selected' | 'prev' | 'next' | 'contains' | 'value' | 'results' | 'auto';

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
nav('current', { left: 'prev', up: 'current', right: 'next', down: 'type' });
nav('from', { left: 'prev', up: 'current', right: 'type', down: 'out' });
nav('type', { left: 'from', up: 'current', right: 'to', down: 'typed' });
nav('to', { left: 'type', up: 'current', right: 'next', down: 'in' });
nav('out', { left: 'prev', up: 'from', right: 'typed', down: 'up' });
nav('typed', { left: 'out', up: 'type', right: 'in', down: 'up' });
nav('in', { left: 'typed', up: 'to', right: 'next', down: 'down' });
nav('up', { left: 'prev', up: 'out', right: 'down', down: 'selectors' });
nav('down', { left: 'up', up: 'out', right: 'promises', down: 'selected' });
nav('selectors', { left: 'prev', up: 'up', right: 'selected', down: 'value' });
nav('selected', { left: 'selectors', up: 'in', right: 'rejects', down: 'value' });
nav('promises', { left: 'down', up: 'in', right: 'rejects', down: 'value' });
nav('rejects', { left: 'promises', up: 'in', right: 'next', down: 'value' });
nav('value', { left: 'prev', up: 'rejects', right: 'next', down: 'contains' });
nav('contains', { left: 'prev', up: 'value', right: 'next', down: 'results' });
nav('results', { left: 'prev', up: 'contains', right: 'next', down: 'results' });
navs.next = navs.contains;
navs.prev = navs.contains;

type onEnterI = (link: Link<Id>) => void;
type onChangeI = (link: Link<Id>, path: [number, number, string]) => void;

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
  onescreen: boolean;
  autoFocus: boolean;
  onEnter?: onEnterI;

  focus: { current: PathI; };
  path: { current: PathI; };
  results: { current: { results: Link<Id>[], originalData: Link<Id>[] }[] };
}
const ConfigContext = createContext<ConfigContextI>({
  onescreen: false,
  autoFocus: false,

  focus: { current: [] },
  path: { current: [] },
  results: { current: [] },
});

export const Result = memo(function Result({
  link,
  resultIndex,
  pathItemIndex,
  isFocused,
  _tree_position_ids,
}: {
  link: Link<Id>;
  resultIndex: number;
  pathItemIndex: number;
  isFocused: boolean;
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

function useSymbol() {
  const deep = useDeep();
  return function(link) {
    return link?.type?.inByType[deep.idLocal('@deep-foundation/core', 'Symbol')]?.[0]?.value?.value;
  }
}

export function useLoader({
  query = {},
}: {
  query?: any;
}) {
  const deep = useDeep();
  const typeQuery = useMemo(() => ({
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
  }), []);
  const results = deep.useDeepQuery({
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
  });
  return results;
};

export const EditorPathItem = memo(function EditorPathItem({
  item,
  focus,
  i,
}: {
  item: PathItemI;
  focus?: PathI;
  i: number;
}) {
  const deep = useDeep();
  const levelRef = useRef();
  const refEditor = useRef();

  const valueTables = useMemo(() => ({
    [deep.idLocal('@deep-foundation/core', 'String')]: 'strings',
    [deep.idLocal('@deep-foundation/core', 'Number')]: 'numbers',
    [deep.idLocal('@deep-foundation/core', 'Object')]: 'objects',
    [deep.idLocal('@deep-foundation/core', 'File')]: 'files',
  }), []);

  const link = item.linkId ? deep.minilinks.byId[item.linkId] : undefined;

  const value = link?.value?.value;
  const valueType = useMemo(() => link?.type?.outByType[deep.idLocal('@deep-foundation/core', 'Value')]?.[0]?.to_id, [link]);

  const [_value, _setValue] = useState(
    valueTables[valueType] === 'strings' ? value || '' :
    valueTables[valueType] === 'numbers' ? `${value}` :
    valueTables[valueType] === 'objects' ? JSON.stringify(value, null, 2) : '',
  );
  return <Box
    ref={levelRef}
    minW={'40em'} maxW='100vw' h='100%'
    borderRight='1px solid' borderRightColor='deepColor'
    overflowY='scroll'
    onClick={(e) => {
      e.stopPropagation();
      e.preventDefault();
    }}
  >
    <Editor
      refEditor={refEditor}
      value={_value}
      onChange={_value => _setValue(_value)}
      onSave={async value => {
        // @ts-ignore
        await deep.update({ link_id: link?.id }, { value }, { table: valueTables[valueType] });
      }}
    />
  </Box>
}, isEqual);

export const PathItem = memo(function PathItem({
  item,
  focus,
  i,
}: {
  item: PathItemI;
  focus?: PathI;
  i: number;
}) {
  const deep = useDeep();
  const config = useContext(ConfigContext);
  const go = useContext(GoContext);
  const symbol = useSymbol();

  const f = focus?.[focus.length-1];
  const isFocused = focus?.length-1 === i;
  const p: NavDirection | undefined = isFocused ? f.position as NavDirection || 'auto' : undefined;

  useLoader({ query: item.linkId ? { id: item.linkId } : { limit: 0 } });
  // @ts-ignore
  const { data: results, originalData } = useLoader({ query: item.query });
  config.results.current[i] = { results, originalData };
  const link = item.linkId ? deep.minilinks.byId[item.linkId] : undefined;

  const value = link?.value?.value;
  const valueType = useMemo(() => link?.type?.outByType[deep.idLocal('@deep-foundation/core', 'Value')]?.[0]?.to_id, [link]);

  const ref = useRef<any>();
  useEffect(() => {
    if (isFocused) {
      ref?.current?.scrollIntoView({block: "center", inline: "nearest"});
    }
  }, [isFocused]);

  const focusedResult = isFocused && f.position === 'results' ? focus?.[focus?.length - 1] : undefined;

  const resultsView = useMemo(() => {
    return results.map((l, ii) => (l.id === link?.id ? <></> : <Result key={l.id} link={l} resultIndex={ii} pathItemIndex={i} isFocused={focusedResult?.index === ii} _tree_position_ids={item.mode === 'upTree' || item.mode === 'downTree' ? (originalData[ii]?.positionids || []).map(p => p.position_id) : undefined}/>));
  }, [results, focusedResult, item]);

  return <Box
    minW='25em' w='25em' h='100%'
    borderRight='1px solid' borderRightColor='deepColor'
    overflowY='scroll'
    onClick={(e) => {
      e.stopPropagation();
      e.preventDefault();
    }}
  >
    {!!link && <>
      <Box borderBottom='1px solid' borderBottomColor='deepColor' overflowX='hidden'>
        <Result link={link} resultIndex={-1} pathItemIndex={i} isFocused={p === 'current'}/>
        <SimpleGrid columns={3}>
          <Button
            ref={p === 'from' ? ref : undefined}
            variant={!link?.['from_id'] ? 'disabled' : p === 'from' ? 'active' : undefined} justifyContent='right' textAlign='right'
            onClick={() => go({ itemIndex: i, position: 'from', active: true })}
            disabled={!link?.from_id}
            rightIcon={<FromIcon />}
          ><Box>
            <Text>from</Text>
            <Box><Text fontSize='xs'>{symbol(link?.from)} {!!link?.from && deep.nameLocal(link.from_id)} {link?.from_id}</Text></Box>
          </Box></Button>
          <Button
            ref={p === 'type' ? ref : undefined}
            variant={!link?.['type_id'] ? 'disabled' : p === 'type' ? 'active' : undefined}
            onClick={() => go({ itemIndex: i, position: 'type', active: true })}
            disabled={!link?.type_id}
            leftIcon={<TypeIcon />}
          ><Box>
            <Text>type</Text>
            <Box><Text fontSize='xs'>{symbol(link?.type)} {!!link?.type && deep.nameLocal(link.type_id)} {link?.type_id}</Text></Box>
          </Box></Button>
          <Button
            ref={p === 'to' ? ref : undefined}
            variant={!link?.['to_id'] ? 'disabled' : p === 'to' ? 'active' : undefined} justifyContent='left' textAlign='left'
            onClick={() => go({ itemIndex: i, position: 'to', active: true })}
            disabled={!link?.to_id}
            rightIcon={<ToIcon />}
          ><Box>
            <Text>to</Text>
            <Box><Text fontSize='xs'>{symbol(link?.to)} {!!link?.to && deep.nameLocal(link.to_id)} {link?.to_id}</Text></Box>
          </Box></Button>
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
        <SimpleGrid columns={1}>
          <Button
            ref={p === 'contains' ? ref : undefined}
            variant={p === 'contains' ? 'active' : undefined} justifyContent='center'
            onClick={() => go({ itemIndex: i, position: 'contains', active: true })}
          >
            <Text pr={1}>🗂️</Text> contains
          </Button>
        </SimpleGrid>
      </Box>
    </>}
    {resultsView}
  </Box>;
}, isEqual);

let itemsCounter = 0;

const modes = {
  'up': 'upTree',
  'upTree': 'upTreeBranch',
  'down': 'downTree',
};

export const Tree = memo(function Tree({
  onEnter,
  onChange,
  autoFocus = false,
  onescreen = false,
}: {
  onEnter?: onEnterI;
  onChange?: onChangeI;
  autoFocus?: boolean;
  onescreen?: boolean;
}) {
  const deep = useDeep();

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
      query: queries.contains(deep.linkId),
      linkId: deep.linkId,
      position: 'results',
      index: 0,
    },
  ]);

  const [focus, setFocus] = useState<PathI>([
    { position: 'results', index: 0 }
  ]);

  const refPath = useRef(path);
  refPath.current = path;
  const refFocus = useRef(focus);
  refFocus.current = focus;
  const refResults = useRef([]);

  useEffect(() => {
    if (focus.length > path.length) setFocus(focus.slice(path.length))
  }, [focus, path]);

  const go = useCallback((item) => {
    const r = refResults.current;
    let f = refFocus.current;
    let p = refPath.current;

    let ff, pp;

    if (typeof(item.itemIndex) === 'number') {
      f = f.slice(0, item.itemIndex + 1);
    }

    let fi = typeof(item.itemIndex) === 'number' ? item.itemIndex : f?.length - 1;

    console.log({ fi, itemIndex: item.itemIndex });

    if (item.position) {
      if (['current', 'from', 'type', 'to', 'out', 'typed', 'in', 'up', 'down', 'value', 'contains', 'promises', 'rejects', 'selectors', 'selected'].includes(item.position)) {
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

    if(item.active) {
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
        console.log({ f, fi, link });
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
          
          // , 'out', 'typed', 'in', 'up', 'down', 'value', 'contains'].includes(item.position)
        // 'prev' | 'next' | 'auto'
    }
  }, []);

  const hotkeyRef = null;
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
      go({ position: pos, });
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
  }, { preventDefault: true }, []);

  const pathItemsView = useMemo(() => {
    return path.map((p, i) => {
      const Component = p.mode === 'editor' ? EditorPathItem : PathItem;
      return <Component key={p.key} i={i} item={p} focus={focus.length - 1 === i ? focus : undefined}/>;
    });
  }, [path, focus]);

  console.log(path, focus);

  const config = useMemo(() => {
    return {
      onescreen, autoFocus,
      onEnter,
      focus: refFocus,
      path: refPath,
      results: refResults,
    };
  }, [onescreen, autoFocus]);

  return <ConfigContext.Provider value={config}>
    <GoContext.Provider value={go}>
      <HStack
        ref={hotkeyRef as any}
        position="absolute" left='0' top='0' right='0' bottom='0'
        overflowX={onescreen ? 'hidden' : 'scroll'} overflowY='hidden'
        autoFocus={autoFocus}
      >
        {pathItemsView}
      </HStack>
    </GoContext.Provider>
  </ConfigContext.Provider>;
}, () => true);