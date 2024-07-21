import {
  Box,
  useBreakpointValue
} from '@chakra-ui/react';
import { useDeep } from "@deep-foundation/deeplinks/imports/client";
import { Id, Link } from '@deep-foundation/deeplinks/imports/minilinks';
import { createContext, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useHotkeys, useHotkeysContext } from 'react-hotkeys-hook';
import { useResizeDetector } from 'react-resize-detector';

export type NavDirection =  'current' | 'close' | 'delete' | 'edit-from' | 'from' | 'type' | 'to' | 'edit-to' | 'out' | 'typed' | 'in' | 'up' | 'down' | 'promises' | 'rejects' | 'selectors' | 'selected' | 'prev' | 'next' | 'parents' | 'contains' | 'insert' | 'value' | 'results' | 'auto';

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
nav('close', { left: 'prev', up: 'close', right: 'next', down: 'current' });
nav('current', { left: 'prev', up: 'close', right: 'next', down: 'contains' });
nav('parents', { left: 'prev', up: 'current', right: 'contains', down: 'type' });
nav('contains', { left: 'parents', up: 'current', right: 'insert', down: 'type' });
nav('insert', { left: 'contains', up: 'current', right: 'delete', down: 'type' });
nav('delete', { left: 'insert', up: 'current', right: 'next', down: 'type' });
nav('edit-from', { left: 'prev', up: 'current', right: 'from', down: 'out' });
nav('from', { left: 'edit-from', up: 'current', right: 'type', down: 'out' });
nav('type', { left: 'from', up: 'contains', right: 'to', down: 'typed' });
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
nav('value', { left: 'prev', up: 'rejects', right: 'next', down: 'results' });
nav('results', { left: 'prev', up: 'value', right: 'next', down: 'results' });
navs.next = navs.contains;
navs.prev = navs.contains;

export type onEnterI = (link: Link<Id>) => void;
export type onChangeI = (link: Link<Id>, path: PathI) => void;

export interface PathItemI {
  key?: number;

  query?: any;
  search?: string;
  local?: boolean;
  loading?: boolean;
  error?: any;

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

export interface PathI extends Array<PathItemI> {}

export interface GoContextI {
  (pathItem: PathItemI): void;
}
export const GoContext = createContext<GoContextI>((item) => {});
export const PathContext = createContext<PathI>(undefined);
export const FocusContext = createContext<PathI>(undefined);

export interface ConfigContextI {
  scope: string;
  onescreen: boolean;
  insert: boolean;
  delete: boolean;
  autoFocus: boolean;
  onEnter?: onEnterI;
  width: number;
  height: number;

  focus: { current: PathI; };
  path: { current: PathI; };
  results: { current: { results: Link<Id>[], originalData: Link<Id>[] }[] };
}
export const ConfigContext = createContext<ConfigContextI>({
  scope: '',
  onescreen: false,
  autoFocus: false,
  insert: true,
  delete: true,
  width: 350, height: 300,

  focus: { current: [] },
  path: { current: [] },
  results: { current: [] },
});

let itemsCounter = 0;

const modes = {
  'up': 'upTree',
  'upTree': 'upTreeBranch',
  'down': 'downTree',
};

export const Orientation = memo(function Orientation({
  query,
  search,
  where,
  linkId,
  scope,
  onEnter,
  onChange,
  autoFocus = false,
  onescreen: _onescreen,
  insert=true,
  delete: _delete=true,
  children,
}: {
  query?: any;
  search?: string;
  where?: any;
  linkId?: Id;
  scope: string;
  onEnter?: onEnterI;
  onChange?: onChangeI;
  autoFocus?: boolean;
  onescreen?: boolean;
  insert?: boolean;
  delete?: boolean;
  children?: any;
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
    const treeScopes = enabledScopes.filter(s => s.includes('orientation-'));
    if (!treeScopes.length) enableScope(`orientation-${scope}`);
  }, [enabledScopes]);
  useEffect(() => {
    const treeScopes = enabledScopes.filter(s => s.includes('orientation-'));
    for (let i = 0; i < treeScopes.length; i++) disableScope(treeScopes[i]);
    enableScope(`orientation-${scope}`);
    return () => disableScope(`orientation-${scope}`);
  }, []);

  const queries = useMemo(() => ({
    out: (linkId) => ({ from_id: linkId }),
    typed: (linkId) => ({ type_id: linkId }),
    in: (linkId) => ({ to_id: linkId }),
    parents: (linkId) => ({ out: { type_id: deep.idLocal('@deep-foundation/core', 'Contain'), to_id: linkId } }),
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
      search: search || undefined,
      local: search ? true : undefined,
      linkId: query ? linkId || undefined : linkId,
      position: 'contains',
      index: -1,
      ...where,
    },
  ]);

  const [focus, setFocus] = useState<PathI>([
    { position: 'contains', index: -1, linkId }
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

    const search = item.search;
    const local = item.local;
    const where = item.where;

    if (typeof(item.loading) === 'boolean' || item.error)  {
      setPath(pp = [
        ...p.slice(0, fi),
        { ...p[fi], loading: item.loading, error: item.error, mode: item.mode || p[fi].mode },
        ...p.slice(fi+1),
      ]);
    }

    if (item.position) {
      if (['close', 'current', 'delete', 'edit-from', 'from', 'type', 'to', 'edit-to', 'out', 'typed', 'in', 'up', 'down', 'value', 'parents', 'contains', 'insert', 'promises', 'rejects', 'selectors', 'selected'].includes(item.position)) {
        if (!item.active) {
          if (!p[fi].linkId && p[fi].position === 'close') item.position = 'results';
          if (!p[fi].linkId && p[fi].position === 'results') item.position = 'close';
        }
        if (item.position === 'from' && !deep.minilinks.byId[p[fi]?.linkId]?.[`from_id`]) {
          go({ ...item, position: f[fi].position === 'type' ? 'prev' : 'type' });
        } else if (item.position === 'to' && !deep.minilinks.byId[p[fi]?.linkId]?.[`to_id`]) {
          go({ ...item, position: f[fi].position === 'type' ? 'next' : 'type' });
        } else {
          setPath(pp = [
            ...p.slice(0, fi),
            { linkId: item.linkId, ...p[fi], position: item.position, index: -1, search, local, mode: item.mode || p[fi].mode },
            ...p.slice(fi+1),
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
            { ...p[fi], position: item.position, index: item.index, search, local, mode: item.mode || p[fi].mode },
            ...p.slice(fi+1),
          ]);
          setFocus(ff = [
            ...f.slice(0, fi),
            { ...f[fi], position: item.position, index: item.index },
            ...f.slice(f.length),
          ]);
        } else if(item.query || item.linkId) {
          setPath(pp = [
            ...p.slice(0, fi),
            { ...p[fi], query: item.query || p[fi]?.query, position: item.position, index: 0, search, local, linkId: item.linkId, mode: item.mode },
            ...p.slice(fi+1),
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
        } else if (nextMode === 'search') {
          setPath(pp = [
            ...p.slice(0, fi),
            { ...p[fi], position: 'results', index: f[fi].index },
            { key: itemsCounter++, position: 'results', index: 0, query: item.query, mode: nextMode },
          ] as PathI);
          setFocus(ff = [
            ...f.slice(0, fi),
            { ...f[fi], position: 'results', index: f[fi].index },
            { position: 'results', index: 0 },
          ] as PathI);
        } else if (item.linkId) {
          setPath(pp = [
            ...p.slice(0, fi),
            { ...p[fi], position: 'results', index: item.index },
            { key: itemsCounter++, position: p[fi+1]?.position || 'contains', index: typeof(p[fi+1]?.index) === 'number' ? p[fi+1]?.index : 0, linkId: item.linkId, query: queries.contains(item.linkId), mode: item.mode || p[fi].mode },
          ] as PathI);
          setFocus(ff = [
            ...f.slice(0, fi),
            { ...f[fi], position: 'results', index: item.index, mode: item.mode || p[fi].mode }
          ] as PathI);
        } else {
          item.linkId = r?.[fi]?.results?.[f[fi]?.index]?.id;
          if (f[fi]?.position === 'results' && typeof(f[fi]?.index) === 'number' && item.linkId) {
            if (p?.[fi+1]?.linkId !== item.linkId) {
              setPath(pp = [
                ...p.slice(0, fi),
                { ...p[fi], position: f[fi].position, index: f[fi].index },
                { key: itemsCounter++, position: p[fi+1]?.position || 'contains', index: 0, linkId: item.linkId, query: queries.contains(item.linkId), mode: item.mode || p[fi].mode },
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
      if (f[fi]?.position === 'close') {
        setPath([
          ...p.slice(0, fi),
          ...p.slice(fi+1),
        ]);
        setFocus([
          ...f.slice(0, fi),
          ...f.slice(fi+1),
        ]);
      } else if (f[fi]?.position === 'value') {
        setPath([
          ...p.slice(0, fi),
          { ...p[fi], position: f[fi].position },
          { linkId: p[fi].linkId, position: 'value', key: itemsCounter++, mode: 'editor' },
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
        } else if (['out', 'typed', 'in', 'parents', 'contains', 'promises', 'rejects', 'selectors', 'selected'].includes(f[fi].position)) {
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
  }, { preventDefault: true, scopes: `orientation-${scope}` }, []);

  const config = useMemo(() => {
    return {
      scope,
      onescreen, autoFocus,
      onEnter,
      focus: refFocus,
      path: refPath,
      results: refResults,
      width, height,
      insert, delete: _delete,
    };
  }, [onescreen, autoFocus, width, height, insert]);

  return <Box ref={ref} left='0' top='0' right='0' bottom='0' position='absolute'>
    <ConfigContext.Provider value={config}>
      <GoContext.Provider value={go}>
        <PathContext.Provider value={path}>
          <FocusContext.Provider value={focus}>
            {children}
          </FocusContext.Provider>
        </PathContext.Provider>
      </GoContext.Provider>
    </ConfigContext.Provider>
  </Box>;
});