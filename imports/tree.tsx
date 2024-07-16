import {
  Box,
  Button,
  Stack, HStack, VStack,
  Input,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import { useDeep } from "@deep-foundation/deeplinks/imports/client";
import { Id, Link } from '@deep-foundation/deeplinks/imports/minilinks';
import { createContext, Dispatch, DOMElement, memo, SetStateAction, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useHotkeys } from 'react-hotkeys-hook';
import { LinkButton } from './link';
import { link } from 'fs';

type NavDirection =  'from' | 'type' | 'to' | 'out' | 'typed' | 'in' | 'up' | 'down' | 'prev' | 'next' | 'current';

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
nav('up', { left: 'prev', up: 'out', right: 'down', down: 'current' });
nav('down', { left: 'up', up: 'in', right: 'next', down: 'current' });
nav('current', { left: 'prev', up: 'up', right: 'next', down: 'current' });
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
}: {
  link: Link<Id> ;
  isActive?: boolean;
  address?: [number, number, string];
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
  const enter = useCallback(() => {
    if (!isActive) return;
    const contain = link?.inByType[deep.idLocal('@deep-foundation/core', 'Contain')]?.[0];
    if (contain) {
      if (!!rename) {
        if (contain?.value) deep.update({ link_id: contain.id }, { value: name }, { table: 'strings' });
        else deep.insert({ link_id: contain.id, value: name }, { table: 'strings' });
      }
      setRename(!rename);
    }
  }, [isActive, rename, name]);
  useHotkeys('enter', enter, [isActive, rename, name]);
  return rename ? <Input
    ref={ref}
    value={name}
    onChange={e => setName(e.target.value)}
    onKeyDown={e => e.key === 'Enter' && enter()}
    variant={isActive ? 'active' : undefined}
    autoFocus
  /> : <LinkButton
    buttonRef={ref}
    id={link.id}
    name={name as string}
    type={deep.nameLocal(link.type_id) as string}
    isActive={isActive}
    icon={symbol}
    w='100%'
    onClick={id => address && setActive && setActive(address)}
  />
}, (o, n) => o.isActive == n.isActive && o.link === n.link);

export const Level = memo(function Level({
  link,
  links,
  active,
  setList,
  i,
  levelsRefs,
}: {
  link?: Link<Id>;
  links?: IListItem;
  active?: [number, number, string];
  setList: Dispatch<SetStateAction<any[]>>;
  i: number;
  levelsRefs?: { current: any[] }
}) {
  const deep = useDeep();
  const setActive = useContext(SetActiveContext);
  const activeRef = useRef(active); activeRef.current = active;
  const levelRef = useRef();
  useEffect(() => {
    levelsRefs.current[i] = levelRef;
  }, []);
  console.log('level active', active, `(${i})`);
  const mapped = useMemo(() => (links || []).map((l, ii) => <Item
    key={l.id} link={l} isActive={ii === active?.[1] && active?.[2] === 'current'}
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
        if (Array.isArray(rel)) {
          level = rel;
          level.query = queries[name](link);
        } else {
          level = [];
          level.link = rel;
        }
        setList(l => {
          console.log('jump', rel, [...l.slice(0, i+1), level])
          return [...l.slice(0, i+1), level];
        });
      }
    }
  }, [active, link]);
  return <Box
    ref={levelRef}
    minW='25em' w='25em' h='100%'
    borderRight='1px solid' borderRightColor='deepColor'
    overflowY='scroll'
  >
    {typeof(links?.query)}
    {!!link?.id && !links?.query && <Loader linkId={link.id} onLoaded={onLoaded}/>}
    {!!links?.query && <Loader query={links.query} onLoaded={onLoaded}/>}
    {!!link && <Box borderBottom='1px solid' borderBottomColor='deepColor'>
      <Item link={link}/>
      <SimpleGrid columns={3}>
        <Button
          ref={active?.[2] === 'from' ? ref : undefined}
          variant={!link?.['from_id'] ? 'disabled' : active?.[2] === 'from' ? 'active' : undefined} textAlign='left'
          onClick={() => jump('from')}
          disabled={!link?.from_id}
        >
          <Text pr={1}>⊢</Text> from
        </Button>
        <Button
          ref={active?.[2] === 'type' ? ref : undefined}
          variant={!link?.['type_id'] ? 'disabled' : active?.[2] === 'type' ? 'active' : undefined}
          onClick={() => jump('type')}
          disabled={!link?.type_id}
        >
          <Text>⇡</Text> type
        </Button>
        <Button
          ref={active?.[2] === 'to' ? ref : undefined}
          variant={!link?.['to_id'] ? 'disabled' : active?.[2] === 'to' ? 'active' : undefined} textAlign='right'
          onClick={() => jump('to')}
          disabled={!link?.to_id}
        >
          to <Text pl={1}>{'>'}</Text>
        </Button>
      </SimpleGrid>
      <SimpleGrid columns={3}>
        <Button
          ref={active?.[2] === 'out' ? ref : undefined}
          variant={active?.[2] === 'out' ? 'active' : undefined} textAlign='left'
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
          variant={active?.[2] === 'in' ? 'active' : undefined} textAlign='right'
          onClick={() => jump('in')}
        >
          <Text pr={1}>≪</Text> in
        </Button>
      </SimpleGrid>
      <SimpleGrid columns={2}>
        <Button
          ref={active?.[2] === 'up' ? ref : undefined}
          variant={active?.[2] === 'up' ? 'active' : undefined} textAlign='left'
          onClick={() => jump('up')}
        >
          <Text pr={1}>≥</Text> up
        </Button>
        <Button
          ref={active?.[2] === 'down' ? ref : undefined}
          variant={active?.[2] === 'down' ? 'active' : undefined} textAlign='right'
          onClick={() => jump('down')}
        >
          <Text pr={1}>≤</Text> down
        </Button>
      </SimpleGrid>
    </Box>}
    {mapped}
  </Box>
}, (o, n) => JSON.stringify(o.active) === JSON.stringify(n.active) && o.links === n.links && o.link === n.link);

const SetActiveContext = createContext<Dispatch<SetStateAction<[number, number, string]>>>(() => {});

interface IListItem extends Array<Link<Id>> {
  link?: Link<Id>;
  query?: any;
}
interface IList extends Array<IListItem> {
}

export const TreeView = memo(function TreeView({
  list,
  setList,
}: {
  list: IList;
  setList: Dispatch<SetStateAction<any[]>>;
}) {
  const [active, setActive] = useState<[number, number, NavDirection]>([0, 0, 'current']);
  console.log('treeview active', active);
  const activeRef = useRef(active); activeRef.current = active;
  const listRef = useRef(list); listRef.current = list;
  const _setActive = (v) => {
    console.log('_setActive', v);
    return setActive(v);
  };
  const setActiveRef = useRef(_setActive); setActiveRef.current = _setActive;
  activeRef.current = active;
  const [mem, setMem] = useState<number[]>([]);
  const memRef = useRef(mem); memRef.current = mem;
  const setMemOne = useCallback((i, v) => {
    setMem([...mem.slice(0, i), v, ...mem.slice(i+1)]);
  }, [mem]);
  const setActiveOne = useCallback((a: [number, number, NavDirection]) => {
    _setActive(a);
    const list = listRef.current;
    const link = list[a[0]][a[1]] || list[a[0]].link 
    if (link) {;
      const l: IListItem = list[a[0]+1]?.link?.id === link?.id ? list[a[0]+1] : []; l.link = link;
      if (l.link) setList([...list.slice(0, a[0] + 1), l]);
    }
  }, [mem]);
  useHotkeys('up', async e => {
    const list = listRef.current;
    const mem = memRef.current;
    const setActive = setActiveOne;
    const a = activeRef.current;
    const nextNav = navs[a[2]].up.name;
    const dir = navs[a[2]].map.down;
    const n: any = a[2] === 'current' && a[1] > 0 ? [a[0], a[1] - 1, 'current'] : [a[0], a[1], nextNav];
    console.log('up', n, nextNav, dir, 'list', list, 'active', active);
    const l: IListItem = []; l.link = list[n[0]][n[1]];
    setMemOne(n[0], n[1]);
    if (l.link) setList([...list.slice(0, a[0] + 1), l]);
    setActive(n);
  }, []);
  useHotkeys('down', async e => {
    const list = listRef.current;
    const mem = memRef.current;
    const setActive = setActiveOne;
    const a = activeRef.current;
    const nextNav = navs[a[2]].down.name;
    const dir = navs[a[2]].map.down;
    const n: any = navs[a[2]].name !== 'current' && dir === 'current' ? (list[a[0]]?.length ? [a[0], 0, 'current'] : a) : a[2] === 'current' && list[a[0]]?.length - 1 > a[1] ? [a[0], a[1]+1, nextNav] : [a[0], a[1], nextNav];
    console.log('down', n, nextNav, dir, 'list', list, 'active', active);
    const l: IListItem = []; l.link = list[n[0]][n[1]];
    setMemOne(n[0], n[1]);
    if (l.link) setList([...list.slice(0, a[0] + 1), l]);
    setActive(n);
    console.log('setActive down', n);
  }, []);
  useHotkeys('right', async e => {
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
  }, []);
  useHotkeys('left', async e => {
    const list = listRef.current;
    const mem = memRef.current;
    const setActive = setActiveOne;
    const a = activeRef.current;
    const ma = a[0] - 1;
    const na = list[ma];
    if (ma < 0 || !na) return;
    const p = typeof(mem[ma]) === 'number' ? mem[ma] : na?.[a[1]] ? a[1] : na.length - 1;
    const nextNav = navs[a[2]].left.name;
    const dir = navs[a[2]].map.left;
    const n: any = (a[2] === 'current' || dir === 'prev') && na?.length ? [ma, p, 'current'] : [a[0], a[1], nextNav];
    console.log('left', n, nextNav, dir, 'list', list, 'active', active);
    setMemOne(n[0], n[1]);
    setActive(n);
  }, []);
  useHotkeys('space', async e => {
    const a = activeRef.current;
    const ref = levelsRefs.current[a?.[1]];
    if (ref) {
      setActiveOne([a?.[0] + 1, 0, 'type']);
      levelsRefs?.current?.[a?.[0] + 1]?.scrollIntoView({block: "center", inline: "nearest"});
    }
  }, []);
  useEffect(() => {
    if (mem.length > list.length) {
      setMem(mem.slice(0, list.length - 1));
      console.log('list to mem');
    }
  }, [list, mem]);
  const levelsRefs = useRef([]);
  const mapped = useMemo(() => list.map((l, i) => {
    return <Level key={`${l?.link?.id}-${JSON.stringify(l?.query)}-${i}`} levelsRefs={levelsRefs} links={l} link={l?.link} active={active[0] === i ? active : undefined} setList={setList} i={i}/>
  }), [list, active, JSON.stringify(active)]);
  return <SetActiveContext.Provider value={setActiveOne}>
    <HStack
      position="absolute" left='0' top='0' right='0' bottom='0'
      overflowX='scroll' overflowY='hidden'
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
      from: { relation: 'from' },
      type: {
        relation: 'type',
        return: {
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
      to: { relation: 'to' },
    },
  });
  useEffect(() => {
    onLoaded(data);
  }, [data]);
  return null;
}, () => true);

export const Tree = memo(function Tree() {
  const deep = useDeep();
  const [list, _setList] = useState([]);
  const setList = (v) => {
    console.log('setList', v);
    _setList(v);
  }
  const onLoaded = useCallback((links) => setList(list => [links, ...list.slice(1)]), []);
  return <>
    <Loader query={{
      _or: [
        { id: { _in: [deep.linkId] } },
        { type_id: deep.idLocal('@deep-foundation/core', 'Package'), },
      ],
    }} onLoaded={onLoaded}/>
    <TreeView list={list} setList={setList}/>
  </>;
}, () => true);