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
} from '@chakra-ui/react';
import { useDeep } from "@deep-foundation/deeplinks/imports/client";
import { Id, Link } from '@deep-foundation/deeplinks/imports/minilinks';
import { createContext, Dispatch, DOMElement, memo, SetStateAction, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useHotkeys } from 'react-hotkeys-hook';
import { LinkButton } from './link';
import { link } from 'fs';
import { MdEdit, MdSaveAlt } from "react-icons/md";
import { Editor } from './editor';

type NavDirection =  'from' | 'type' | 'to' | 'out' | 'typed' | 'in' | 'up' | 'down' | 'prev' | 'next' | 'current' | 'value';

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
const nav = (name: string, map: NavMap) => {
  navs[name] = new Nav(name, map);
}
const navs: { [name: string]: Nav } = {};
nav('from', { left: 'prev', up: 'from', right: 'type', down: 'out' });
nav('type', { left: 'from', up: 'type', right: 'to', down: 'typed' });
nav('to', { left: 'type', up: 'to', right: 'next', down: 'in' });
nav('out', { left: 'prev', up: 'from', right: 'typed', down: 'up' });
nav('typed', { left: 'out', up: 'type', right: 'in', down: 'up' });
nav('in', { left: 'typed', up: 'to', right: 'next', down: 'down' });
nav('up', { left: 'prev', up: 'out', right: 'down', down: 'value' });
nav('down', { left: 'up', up: 'in', right: 'next', down: 'value' });
nav('value', { left: 'prev', up: 'up', right: 'next', down: 'current' });
nav('current', { left: 'prev', up: 'value', right: 'next', down: 'current' });
navs.next = navs.current;
navs.prev = navs.current;

export const queries = {
  from: (l) => ({ id: l.from_id }),
  type: (l) => ({ id: l.type_id }),
  to: (l) => ({ id: l.to_id }),
  out: (l) => ({ from_id: l.id }),
  typed: (l) => ({ type_id: l.id }),
  in: (l) => ({ to_id: l.id }),
  up: (l) => ({ limit: 0 }),
  down: (l) => ({ limit: 0 }),
};

export const Item = memo(function Item({
  link,
  isActive,
  address,
  onEnter,
}: {
  link: Link<Id> ;
  isActive?: boolean;
  address?: [number, number, string];
  onEnter?: onEnterI;
}) {
  const deep = useDeep();
  const ref = useRef<any>();
  const setActive = useContext(SetActiveContext);
  useEffect(() => {
    if (isActive) ref.current.scrollIntoView({block: "center", inline: "nearest"});
  }, [isActive]);
  const symbol = useMemo(() => link?.type?.inByType[deep.idLocal('@deep-foundation/core', 'Symbol')]?.[0]?.value?.value, []);
  const [rename, setRename] = useState(false);
  const [name, setName] = useState(`${deep.nameLocal(link.id)}`);
  const enter = useCallback((force?: boolean) => {
    if (!isActive && !force) return;
    if (onEnter) return onEnter(link);
    const contain = link?.inByType[deep.idLocal('@deep-foundation/core', 'Contain')]?.[0];
    if (contain) {
      if (!!rename) {
        if (contain?.value) deep.update({ link_id: contain.id }, { value: name }, { table: 'strings' });
        else deep.insert({ link_id: contain.id, value: name }, { table: 'strings' });
      }
      setRename(!rename);
    }
  }, [isActive, rename, name]);
  useHotkeys('enter', () => enter(false), [isActive, rename, name]);
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
      opacity={isActive ? 1 : 0} transition='all 1s ease'
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
    isActive={isActive}
    icon={symbol}
    w='100%'
    role='group'
    onClick={id => address && setActive && setActive(address)}
  >
    <Button
      w='3em' h='3em' position='absolute' right='0' top='0'
      opacity={isActive ? 1 : 0} transition='all 1s ease'
      _groupHover={{ opacity: 1 }}
      onClick={() => enter(true)}
    >
      <MdEdit/>
    </Button>
  </LinkButton>
}, (o, n) => o.isActive == n.isActive && o.link === n.link);

export const Level = memo(function Level({
  value,
  link,
  links,
  active,
  setList,
  i,
  levelsRefs,
  onEnter,
  onescreen,
}: {
  value?: Link<Id>['value'];
  link?: Link<Id>;
  links?: IListItem;
  active?: [number, number, string];
  setList: Dispatch<SetStateAction<any[]>>;
  i: number;
  levelsRefs?: { current: any[] };
  onEnter?: onEnterI;
  onescreen?: boolean;
}) {
  const deep = useDeep();
  const setActive = useContext(SetActiveContext);
  const activeRef = useRef(active); activeRef.current = active;
  const levelRef = useRef();
  const fromSymbol = useMemo(() => link?.from?.type?.inByType[deep.idLocal('@deep-foundation/core', 'Symbol')]?.[0]?.value?.value, []);
  const typeSymbol = useMemo(() => link?.type?.type?.inByType[deep.idLocal('@deep-foundation/core', 'Symbol')]?.[0]?.value?.value, []);
  const toSymbol = useMemo(() => link?.to?.type?.inByType[deep.idLocal('@deep-foundation/core', 'Symbol')]?.[0]?.value?.value, []);
  const valueType = useMemo(() => link?.type?.outByType[deep.idLocal('@deep-foundation/core', 'Value')]?.[0]?.to_id, []);
  useEffect(() => {
    levelsRefs.current[i] = levelRef;
  }, []);
  const mapped = useMemo(() => (links || []).map((l, ii) => <Item
    key={l.id} link={l} isActive={ii === active?.[1] && active?.[2] === 'current'} onEnter={onEnter} 
    address={[i,ii, 'current']}
  />), [links, active]);
  const onLoaded = useCallback((results) => setList((list) => {
    const l = results; l.link = links?.link; l.query = links?.query;
    return [...list.slice(0, i), l] as IList;
  }), [i]);
  const ref = useRef<any>();
  useEffect(() => {
    if (!!active && active?.[2] !== 'current') {
      ref?.current?.scrollIntoView({block: "center", inline: "nearest"});
      jump(active[2]);
    }
  }, [active]);
  const jump = useCallback((name) => {
    if (link) {
      const rel = link[name];
      if (rel) {
        let level: any;
        if (name && link) {
          level = [];
          level.link = link;
          level.value = link?.value
        } else if (Array.isArray(rel)) {
          level = rel;
          level.query = queries[name](link);
        } else {
          level = [];
          level.link = rel;
        }
        setList(l => [...l.slice(0, i+1), level]);
      }
    }
  }, [active, link]);
  return <Box
    ref={levelRef}
    minW='25em' w='25em' h='100%'
    borderRight='1px solid' borderRightColor='deepColor'
    overflowY='scroll'
    onClick={(e) => {
      e.stopPropagation();
      e.preventDefault();
    }}
  >
    {!!link?.id && !links?.query && <Loader linkId={link.id} onLoaded={onLoaded}/>}
    {!!links?.query && <Loader query={links.query} onLoaded={onLoaded}/>}
    {!!link && <Box borderBottom='1px solid' borderBottomColor='deepColor' overflowX={onescreen ? 'hidden' : 'auto'}>
      <Item link={link}/>
      <SimpleGrid columns={3}>
        <Button
          ref={active?.[2] === 'from' ? ref : undefined}
          variant={!link?.['from_id'] ? 'disabled' : active?.[2] === 'from' ? 'active' : undefined} justifyContent='right' textAlign='right'
          onClick={() => jump('from')}
          disabled={!link?.from_id}
        ><Box>
          <Box>from <Text pl={1} display='inline'>⊢</Text></Box>
          <Box><Text fontSize='xs'>{fromSymbol} {!!link?.from && deep.nameLocal(link.from_id)} {link?.from_id}</Text></Box>
        </Box></Button>
        <Button
          ref={active?.[2] === 'type' ? ref : undefined}
          variant={!link?.['type_id'] ? 'disabled' : active?.[2] === 'type' ? 'active' : undefined}
          onClick={() => jump('type')}
          disabled={!link?.type_id}
        ><Box>
          <Box>type <Text display='inline'>⇡</Text></Box>
          <Box><Text fontSize='xs'>{typeSymbol} {!!link?.type && deep.nameLocal(link.type_id)} {link?.type_id}</Text></Box>
        </Box></Button>
        <Button
          ref={active?.[2] === 'to' ? ref : undefined}
          variant={!link?.['to_id'] ? 'disabled' : active?.[2] === 'to' ? 'active' : undefined} justifyContent='left' textAlign='left'
          onClick={() => jump('to')}
          disabled={!link?.to_id}
        ><Box>
          <Box>to <Text pr={1} display='inline'>{'>'}</Text></Box>
          <Box><Text fontSize='xs'>{toSymbol} {!!link?.to && deep.nameLocal(link.to_id)} {link?.to_id}</Text></Box>
        </Box></Button>
      </SimpleGrid>
      <SimpleGrid columns={3}>
        <Button
          ref={active?.[2] === 'out' ? ref : undefined}
          variant={active?.[2] === 'out' ? 'active' : undefined} justifyContent='left' textAlign='left'
          onClick={() => jump('out')}
        >
          <Text rotate='180deg' pr={1}>⊨</Text> out
        </Button>
        <Button
          ref={active?.[2] === 'typed' ? ref : undefined}
          variant={active?.[2] === 'typed' ? 'active' : undefined}
          onClick={() => jump('typed')}
        >
          <Text pr={1}>⇣⇣⇣</Text> typed
        </Button>
        <Button
          ref={active?.[2] === 'in' ? ref : undefined}
          variant={active?.[2] === 'in' ? 'active' : undefined} justifyContent='right' textAlign='right'
          onClick={() => jump('in')}
        >
          in <Text pl={1}>≪</Text>
        </Button>
      </SimpleGrid>
      <SimpleGrid columns={2}>
        <Button
          ref={active?.[2] === 'up' ? ref : undefined}
          variant={active?.[2] === 'up' ? 'active' : undefined} justifyContent='center'
          onClick={() => jump('up')}
        >
          <Text pr={1}>≥</Text> up
        </Button>
        <Button
          ref={active?.[2] === 'down' ? ref : undefined}
          variant={active?.[2] === 'down' ? 'active' : undefined} justifyContent='center'
          onClick={() => jump('down')}
        >
          <Text pr={1}>≤</Text> down
        </Button>
      </SimpleGrid>
      <Box borderBottom='1px solid' borderBottomColor='deepColor'>
        <SimpleGrid columns={1}>
          {valueType === deep.idLocal('@deep-foundation/core', 'String') && <>
            <Button
              ref={active?.[2] === 'value' ? ref : undefined}
              variant={active?.[2] === 'value' ? 'active' : undefined} justifyContent='center'
              onClick={() => jump('value')}
            >
              <Text pr={1}>""</Text> string
            </Button>
          </>}
          {valueType === deep.idLocal('@deep-foundation/core', 'Number') && <>
            <Button
              ref={active?.[2] === 'value' ? ref : undefined}
              variant={active?.[2] === 'value' ? 'active' : undefined} justifyContent='center'
              onClick={() => jump('value')}
            >
              <Text pr={1}>{+link?.value?.value}</Text> number
            </Button>
          </>}
          {valueType === deep.idLocal('@deep-foundation/core', 'Object') && <>
            <Button
              ref={active?.[2] === 'value' ? ref : undefined}
              variant={active?.[2] === 'value' ? 'active' : undefined} justifyContent='center'
              onClick={() => jump('value')}
            >
              <Text pr={1}>{`{...}`}</Text> object
            </Button>
          </>}
        </SimpleGrid>
      </Box>
      {false && <SimpleGrid columns={1}>
        <Button
          ref={active?.[2] === 'current' ? ref : undefined}
          variant={active?.[2] === 'contains' ? 'active' : undefined} justifyContent='center'
          onClick={() => jump('contains')}
        >
          <Text pr={1}>🗂️</Text> contains
        </Button>
      </SimpleGrid>}
    </Box>}
    {mapped}
  </Box>
}, (o, n) => JSON.stringify(o.active) === JSON.stringify(n.active) && o.links === n.links && o.link === n.link);

export const LevelValue = memo(function LevelValue({
  link,
  value,
  links,
  active,
  setList,
  i,
  levelsRefs,
  onEnter,
  onescreen,
}: {
  link?: Link<Id>;
  value?: Link<Id>['value'];
  links?: IListItem;
  active?: [number, number, string];
  setList: Dispatch<SetStateAction<any[]>>;
  i: number;
  levelsRefs?: { current: any[] };
  onEnter?: onEnterI;
  onescreen?: boolean;
}) {
  const deep = useDeep();
  const levelRef = useRef();
  const refEditor = useRef();
  const [_value, _setValue] = useState(value?.value || '')
  return <Box
    ref={levelRef}
    minW={typeof(value?.value) === 'string' ? '40em' : '25em'} maxW='100vw' h='100%'
    borderRight='1px solid' borderRightColor='deepColor'
    overflowY='scroll'
    onClick={(e) => {
      e.stopPropagation();
      e.preventDefault();
    }}
  >
    {typeof(value?.value) === 'string' && <>
      <Editor
        refEditor={refEditor}
        value={_value}
        onChange={_value => _setValue(_value)}
        onSave={async value => {
          await deep.update({ link_id: link?.id }, { value }, { table: 'strings' });
        }}
      />
    </>}
    {typeof(value?.value) === 'number' && <>
      <Text as='pre'>{+value?.value}</Text>
    </>}
    {typeof(value?.value) === 'object' && <>
      <Text as='pre'>{JSON.stringify(value?.value, null, 2)}</Text>
    </>}
  </Box>
}, (o, n) => JSON.stringify(o.active) === JSON.stringify(n.active) && o.links === n.links && o.link === n.link);

const SetActiveContext = createContext<Dispatch<SetStateAction<[number, number, string]>>>(() => {});

interface IListItem extends Array<Link<Id>> {
  link?: Link<Id>;
  query?: any;
  value?: Link<Id>['value'];
}
interface IList extends Array<IListItem> {
}

export const TreeView = memo(function TreeView({
  list,
  setList,
  onEnter,
  onChange,
  autoFocus=false,
  onescreen=false,
}: {
  list: IList;
  setList: Dispatch<SetStateAction<any[]>>;
  onEnter?: onEnterI;
  onChange?: onChangeI;
  autoFocus?: boolean;
  onescreen?: boolean;
}) {
  const [active, setActive] = useState<[number, number, NavDirection]>([0, 0, 'current']);
  const activeRef = useRef(active); activeRef.current = active;
  const listRef = useRef(list); listRef.current = list;
  const setActiveRef = useRef(setActive); setActiveRef.current = setActive;
  activeRef.current = active;
  const [mem, setMem] = useState<number[]>([]);
  const memRef = useRef(mem); memRef.current = mem;
  const setMemOne = useCallback((i, v) => {
    setMem([...mem.slice(0, i), v, ...mem.slice(i+1)]);
  }, [mem]);
  const setActiveOne = useCallback((a: [number, number, NavDirection]) => {
    setActive(a);
    const list = listRef.current;
    const link = list[a[0]][a[1]] || list[a[0]].link 
    if (link) {;
      const l: IListItem = list[a[0]+1]?.link?.id === link?.id ? list[a[0]+1] : []; l.link = link;
      if (l.link) setList([...list.slice(0, a[0] + 1), l]);
    }
  }, [mem]);
  const hotkeyRef = useHotkeys('up,down,right,left,space', async (e, h) => {
    if (h.keys.length > 1) return;
    if (h.keys[0] === 'up') {
      const list = listRef.current;
      const mem = memRef.current;
      const setActive = setActiveOne;
      const a = activeRef.current;
      const nextNav = navs[a[2]].up.name;
      const dir = navs[a[2]].map.down;
      const n: any = a[2] === 'current' && a[1] > 0 ? [a[0], a[1] - 1, 'current'] : [a[0], a[1], nextNav];
      const l: IListItem = []; l.link = list[n[0]][n[1]];
      setMemOne(n[0], n[1]);
      if (l.link) setList([...list.slice(0, a[0] + 1), l]);
      setActive(n);
    }
    if (h.keys[0] === 'down') {
      const list = listRef.current;
      const mem = memRef.current;
      const setActive = setActiveOne;
      const a = activeRef.current;
      const nextNav = navs[a[2]].down.name;
      const dir = navs[a[2]].map.down;
      const n: any = navs[a[2]].name !== 'current' && dir === 'current' ? (list[a[0]]?.length ? [a[0], 0, 'current'] : a) : a[2] === 'current' && list[a[0]]?.length - 1 > a[1] ? [a[0], a[1]+1, nextNav] : [a[0], a[1], nextNav];
      const l: IListItem = []; l.link = list[n[0]][n[1]];
      setMemOne(n[0], n[1]);
      if (l.link) setList([...list.slice(0, a[0] + 1), l]);
      setActive(n);
    }
    if (h.keys[0] === 'right') {
      const list = listRef.current;
      const mem = memRef.current;
      const setActive = setActiveOne;
      const a = activeRef.current;
      const ma = a[0] + 1;
      const na = list[ma];
      const p = typeof(mem[ma]) === 'number' ? mem[ma] : 0;
      const nextNav = navs[a[2]].right.name;
      const dir = navs[a[2]].map.right;
      const n: any = (a[2] === 'current' || dir === 'next') && na ? na?.length ? [ma, p, 'current'] : [ma, p, 'type'] : [a[0], a[1], nextNav];
      setMemOne(n[0], n[1]);
      setActive(n);
    }
    if (h.keys[0] === 'left') {
      const list = listRef.current;
      const mem = memRef.current;
      const setActive = setActiveOne;
      const a = activeRef.current;
      const ma = a[0] - 1;
      const na = list[ma];
      if (ma < 0 || !na) return;
      const p = typeof(mem[ma]) === 'number' ? mem[ma] : na?.[a[1]] ? 0 : na.length - 1;
      const nextNav = navs[a[2]].left.name;
      const dir = navs[a[2]].map.left;
      const n: any = (a[2] === 'current' || dir === 'prev') && na ? [ma, p, 'current'] : [a[0], a[1], nextNav];
      setMemOne(n[0], n[1]);
      setActive(n);
    }
    if (h.keys[0] === 'space') {
      const a = activeRef.current;
      const ref = levelsRefs.current[a?.[1]];
      if (ref) {
        setActiveOne([a?.[0] + 1, 0, 'type']);
        levelsRefs?.current?.[a?.[0] + 1]?.scrollIntoView && levelsRefs?.current?.[a?.[0] + 1]?.scrollIntoView({block: "center", inline: "nearest"});
      }
    }
  }, []);
  useEffect(() => {
    if (mem.length > list.length) setMem(mem.slice(0, list.length - 1));
  }, [list, mem]);
  const levelsRefs = useRef([]);
  const mapped = useMemo(() => list.map((l, i) => {
    const Component = !!l?.value ? LevelValue : Level;
    return <Component key={`${l?.link?.id}-${JSON.stringify(l?.query)}-${i}`} levelsRefs={levelsRefs} links={l} link={l?.link} value={l?.link?.value} active={active[0] === i ? active : undefined} setList={setList} i={i} onEnter={onEnter} onescreen={onescreen}/>
  }), [list, active, JSON.stringify(active)]);
  useEffect(() => {
    const list: any = listRef.current; const a = active;
    if (onChange) onChange(list?.[a[0]]?.[a[1]] as Link<Id>, active);
  }, [active]);
  useEffect(() => {
    if (onescreen) {
      levelsRefs?.current?.[active?.[0]]?.scrollIntoView && levelsRefs?.current?.[active?.[0]]?.scrollIntoView({block: "center", inline: "nearest"});
    }
  }, [active, onescreen]);
  return <SetActiveContext.Provider value={setActiveOne}>
    <HStack
      ref={hotkeyRef as any}
      position="absolute" left='0' top='0' right='0' bottom='0'
      overflowX={onescreen ? 'hidden' : 'scroll'} overflowY='hidden'
      autoFocus={autoFocus}
    >
      {mapped}
    </HStack>
  </SetActiveContext.Provider>;
}, (o,n) => o.list === n.list);

export const Loader = memo(function Loader({
  linkId, query = {}, onLoaded,
}: {
  linkId?: Id,
  query?: any;
  onLoaded: (links) => void;
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
  const { data } = deep.useDeepQuery({
    ...(linkId ? {
      in: {
        type_id: deep.idLocal('@deep-foundation/core', 'Contain'),
        from_id: linkId,
      },
    } : { ...query }),
    return: {
      names: {
        relation: 'in',
        type_id: deep.idLocal('@deep-foundation/core', 'Contain'),
      },
      from: { relation: 'from', return: { ...typeQuery } },
      ...typeQuery,
      to: { relation: 'to', return: { ...typeQuery } },
    },
  });
  useEffect(() => {
    onLoaded(data);
  }, [data]);
  return null;
}, () => true);

type onEnterI = (link: Link<Id>) => void;
type onChangeI = (link: Link<Id>, path: [number, number, string]) => void;

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
  const [list, setList] = useState([]);
  const onLoaded = useCallback((links) => setList(list => [links, ...list.slice(1)]), []);
  useEffect(() => {
    if (typeof(window) === 'object') {
      const tree = list.map(l => ({ link: l.link, value: l.value, links: l }));
      // @ts-ignore
      if (!window.tree) console.log('tree', tree);
      // @ts-ignore
      window.tree = tree;
    }
  }, [list]);
  return <>
    <Loader query={{
      _or: [
        { id: { _in: [deep.linkId] } },
        { type_id: deep.idLocal('@deep-foundation/core', 'Package'), },
      ],
    }} onLoaded={onLoaded}/>
    <TreeView list={list} setList={setList} onEnter={onEnter} onChange={onChange} autoFocus={autoFocus} onescreen={onescreen}/>
  </>;
}, () => true);