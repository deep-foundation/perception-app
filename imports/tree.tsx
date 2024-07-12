import {
  Box,
  Button,
  Stack, HStack, VStack,
} from '@chakra-ui/react';
import { useDeep } from "@deep-foundation/deeplinks/imports/client";
import { Id, Link } from '@deep-foundation/deeplinks/imports/minilinks';
import { DOMElement, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useHotkeys } from 'react-hotkeys-hook';
import { LinkButton } from './link';
import { link } from 'fs';

export const Item = memo(function Level({
  link,
  isActive,
}: {
  link: Link<Id> ;
  isActive?: boolean;
}) {
  const deep = useDeep();
  const ref = useRef<any>();
  useEffect(() => {
    if (isActive) ref.current.scrollIntoView({block: "center", inline: "nearest"});
  }, [isActive]);
  const symbol = useMemo(() => link?.type?.inByType[deep.idLocal('@deep-foundation/core', 'Symbol')]?.[0]?.value?.value, []);
  return <LinkButton
    buttonRef={ref}
    id={link.id}
    name={deep.nameLocal(link.id) as string}
    type={deep.nameLocal(link.type_id) as string}
    isActive={isActive}
    icon={symbol}
    w='100%'
  />
}, (o, n) => o.isActive == n.isActive && o.link === n.link);

export const Level = memo(function Level({
  link,
  links,
  active,
  setList,
  i,
}: {
  link?: Link<Id>;
  links?: Link<Id>[];
  active?: number;
  setList: (list: Link<Id>[][]) => void;
  i: number;
}) {
  const deep = useDeep();

  const mapped = useMemo(() => (links || []).map((l, i) => <Item key={l.id} link={l} isActive={i === active}/>), [links, active]);
  const onLoaded = useCallback((links) => setList(list => {
    const l = links; l.link = link;
    return [...list.slice(0, i), l];
  }), [i]);
  return <Box
    w='20em' h='100%'
    borderRight='1px solid' borderRightColor='deepColor'
    overflowY='scroll'
  >
    {!!link && <Box borderBottom='1px solid' borderBottomColor='deepColor'>
      <Item link={link}/>
      <Loader linkId={link.id} onLoaded={onLoaded}/>
    </Box>}
    {mapped}
  </Box>
}, (o, n) => o.active === n.active && o.links === n.links && o.link === n.link);

export const TreeView = memo(function TreeView({
  list,
  setList,
}: {
  list: Link<Id>[][];
  setList: (list: Link<Id>[][]) => void;
}) {
  const [active, setActive] = useState<[number, number]>([0, 0]);
  const [mem, setMem] = useState<number[]>([]);
  const setMemOne = useCallback((i, v) => {
    setMem([...mem.slice(0, i), v, ...mem.slice(i+1)]);
  }, [mem]);
  useHotkeys('up', async e => {
    const a = active;
    const n: any = a[1] > 0 ? [a[0], a[1] - 1] : a;
    const l = []; l.link = list[n[0]][n[1]];
    setMemOne(n[0], n[1]);
    if (l.link) setList([...list.slice(0, a[0] + 1), l]);
    setActive(n);
  }, [active, mem]);
  useHotkeys('down', async e => {
    const a = active;
    const n: any = list[a[0]]?.length - 1 > a[1] ? [a[0], a[1]+1] : a;
    const l = []; l.link = list[n[0]][n[1]];
    setMemOne(n[0], n[1]);
    if (l.link) setList([...list.slice(0, a[0] + 1), l]);
    setActive(n);
  }, [active, list]);
  useHotkeys('right', async e => {
    const a = active;
    const ma = a[0] + 1;
    const na = list[ma];
    const p = typeof(mem[ma]) === 'number' ? mem[ma] : 0;
    const n: any = na?.length ? [ma, p] : a;
    setMemOne(n[0], n[1]);
    setActive(n);
  }, [active, list, mem]);
  useHotkeys('left', async e => {
    const a = active;
    const ma = a[0] - 1;
    if (ma < 0) return;
    const na = list[ma];
    const p = typeof(mem[ma]) === 'number' ? mem[ma] : na?.[a[1]] ? a[1] : na.length - 1;
    const n: any = na?.length ? [ma, p] : a;
    setMemOne(n[0], n[1]);
    setActive(n);
  }, [active, list, mem]);
  useEffect(() => {
    setMem(mem.slice(0, list.length - 1));
  }, [list, mem]);
  const mapped = useMemo(() => list.map((l, i) => (
    <Level key={l?.link?.id || i} links={l} link={l?.link} active={active[0] === i ? active[1] : undefined} setList={setList} i={i}/>
  )), [list, active]);
  return <HStack
    position="absolute" left='0' top='0' right='0' bottom='0'
    overflowX='scroll' overflowY='hidden'
  >
    {mapped}
  </HStack>;
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
    },
  });
  useEffect(() => {
    onLoaded(data);
  }, [data]);
  return null;
}, () => true);

export const Tree = memo(function Tree() {
  const deep = useDeep();
  const [list, setList] = useState([]);
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