import {
  Box,
  useBreakpointValue
} from '@chakra-ui/react';
import { useDeep } from "@deep-foundation/deeplinks/imports/client";
import { Id, Link } from '@deep-foundation/deeplinks/imports/minilinks';
import { createContext, memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useHotkeys, useHotkeysContext } from 'react-hotkeys-hook';
import { useResizeDetector } from 'react-resize-detector';
import { ReactHandler } from '@deep-foundation/perception-imports/imports/react-handler';

const dpl = '@deep-foundation/perception-links';
const dc = '@deep-foundation/core';

export type onEnterI = (link: Link<Id>) => void;
export type onChangeI = (link: Link<Id>) => void;

const hpref = 'concentration-hotkeys-';

export interface HistoryI {
  key?: string; // current child key in parent
  selectedKey?: string; // selected children

  historyId?: Id; // optional
  // history.to
  linkId?: Id; // optional
  // history.value position on mapping
  // history.out Layer.to Handler as Tree or Graph
  layerId?: Id;
  // history.out View.to Handler as TreeLinkView in GraphLinkView
  viewId?: Id;
  
  data?: any; // props to client handler

  children?: {
    [key: string]: HistoryI;
  };
}

export interface GoI extends HistoryI {
  (history: HistoryI | HistoryI[]): Promise<HistoryI[]>;
  Navigation?: typeof Navigation;
  ReactHandler?: typeof ReactHandler;
  useFocus?: typeof useFocus;
  useMemory?: typeof useMemory;
  useConfig?: typeof useConfig;
  GoProvider?: typeof GoProvider;
  history?: HistoryI;
}

export type FocusValueI = [] | [number] | [number, string];
export type FocusI = [
  FocusValueI,
  (focus: FocusValueI) => any,
];

export interface ConfigI {
  fullscreen?: boolean;
  autoFocus?: boolean;
  operations?: boolean;
}

export const GoContext = createContext<GoI>(undefined);
export function useGo() { return useContext(GoContext); }
export const FocusContext = createContext<FocusValueI>(undefined);
export function useFocus() { return useContext(FocusContext); }
export const FocusRefContext = createContext<{ current: FocusValueI }>(undefined);
export function useFocusRef() { return useContext(FocusRefContext); }
export const MemoryContext = createContext<HistoryI[]>(undefined);
export function useMemory() { return useContext(MemoryContext); }
export const MemoryRefContext = createContext<{ current: HistoryI[] }>(undefined);
export function useMemoryRef() { return useContext(MemoryRefContext); }
export const ConfigContext = createContext<ConfigI>(undefined);
export function useConfig() { return useContext(ConfigContext); }
export const BindingRefContext = createContext<{ current: BindingI }>(undefined);
export function useBindingRef() { return useContext(BindingRefContext); }

export function useHistoricalGo(outerHistory: HistoryI, go: GoI): GoI {
  return useMemo(() => {
    return wrapGo(function(goHistory) {
      // console.log('wrapGo', 'hook', outerHistory, 'go', goHistory, 'result', [...(Array.isArray(goHistory) ? goHistory.map(oh => ({ ...outerHistory, historyId: oh.historyId, ...oh })) : { ...goHistory })]);
      const input = (Array.isArray(goHistory) ? goHistory : [goHistory]).map(({ historyId, linkId, value, layerId, viewId, data, active, focus }) => {
        const o = { ...outerHistory, historyId, linkId, value, layerId, viewId, data, active, focus };
        delete o.key;
      });
      return go([...(Array.isArray(goHistory) ? goHistory.map(oh => ({ ...outerHistory, ...oh, historyId: oh?.historyId || outerHistory?.historyId })) : { ...goHistory })]);
    }, outerHistory || go.history);
  }, [go, outerHistory]);
}

export function GoProvider({ go, h, children }: { go?: GoI; h?: HistoryI; children?: any; }) {
  const _go = useGo();
  const newGo = useHistoricalGo(h, go || _go);
  return <GoContext.Provider value={newGo}>{children}</GoContext.Provider>
}

export const wrapGo = (go, h?: HistoryI) => {
  go.Navigation = Navigation;
  go.ReactHandler = ReactHandler;
  go.useFocus = useFocus;
  go.useMemory = useMemory;
  go.useGo = useGo;
  go.useConfig = useConfig;
  go.useHistoricalGo = useHistoricalGo;
  go.GoProvider = GoProvider;
  go.history = h;
  return go;
};

export const parseHistory = (h: Link<Id>): HistoryI => {
  const history: HistoryI = { key: `${momeryCounter++}` };

  history.historyId = h.id;
  history.linkId = h.to_id;

  history.value = h?.value?.value;
  history.layerId = h.outByType[h.ml.id(dpl, 'Layer')]?.[0]?.id;
  history.viewId = h.outByType[h.ml.id(dpl, 'View')]?.[0]?.id;

  return history;
};

const createPath = (mi, _h) => {
  const path = [];
  if (!!~mi) {
    path.push(mi);
    if (_h.value) path.push(_h.value);
  }
  const _path0 = `${path.length ? path[0] : ''}`;
  const _path1 = path.join('.');
  return { _path0, _path1, path };
};

let momeryCounter = 1;
export const Concentration = memo(function Concentration({
  scope,

  linkId, value, layerId, viewId,

  onEnter, onChange,
  autoFocus = false, fullscreen: _fullscreen = false,
  operations = true,

  children
}: {
  // system
  scope: string;

  // input
  linkId?: Id; value?: string; layerId?: Id; viewId?: Id;
  query?: any; search?: string;

  // react
  onEnter?: onEnterI; onChange?: onChangeI;
  autoFocus?: boolean; fullscreen?: boolean;
  operations?: boolean;
  children?: any;
}) {
  const deep = useDeep();

  const History = deep.idLocal(dpl, 'History');
  const containTree = deep.idLocal(dc, 'containTree');
  const SyncTextFile = deep.idLocal(dc, 'SyncTextFile');
  const Query = deep.idLocal(dc, 'Query');
  const Layer = deep.idLocal(dpl, 'Layer');
  const View = deep.idLocal(dpl, 'View');
  const TreeLayer = deep.idLocal(dpl, 'TreeLayer');
  const TreeLinkView = deep.idLocal(dpl, 'TreeLinkView');
  const isSearch = deep.idLocal(dpl, 'isSearch');
  const isQuery = deep.idLocal(dpl, 'isQuery');

  const [fullscreen, setFullscreen] = useState(_fullscreen);

  const { width, height, ref } = useResizeDetector();
  const dinamicFullscreen = useBreakpointValue(
    { base: true, md: false, },
    { fallback: 'md' },
  );
  useEffect(() => setFullscreen(dinamicFullscreen), [dinamicFullscreen]);

  const config = useMemo((): ConfigI => ({
    fullscreen,
    autoFocus,
    operations,
  }), [fullscreen, autoFocus]);

  // short memory
  const [memory, _setMemory] = useState<HistoryI[]>([]);
  const memoryRef = useRef(memory); memoryRef.current = memory;
  const setMemory = useCallback((v) => {
    const cleared = v.map(({ key, historyId, linkId, value, layerId, viewId, data, active, focus }) => ({
      key, historyId, linkId, value, layerId, viewId, data
    }));
    _setMemory(cleared);
    memoryRef.current = cleared;
  }, [_setMemory]);
  // focus
  const focus = useState<FocusValueI>([]);
  const focusRef = useRef(focus[0]); focusRef.current = focus[0];
  const f = focus[0];
  const setFocus = useCallback((v) => {
    focus[1](v);
    focusRef.current = v;
  }, [focus[1]]);

  const bindingRef = useRef<BindingI>({});

  // console.log('concentration', memory, focus, memory, config);

  // sync with long memory
  const concentrated = deep.useSubscription({
    type_id: History,
    // up: {
    //   parent: {
    //     type_id: History,
    //   },
    //   tree_id: containTree,
    // },
    order_by: { id: 'desc' },
    limit: 30
  });
  deep.useSubscription({
    up: {
      parent_id: { _in: concentrated?.data?.length ? (concentrated.data || []).map(l => l.id) : [0] },
      tree_id: containTree,
    },
  });

  const hs = deep.useMinilinksSubscription({
    type_id: History,
    from_id: deep.linkId,
    order_by: { id: 'desc' },
    limit: 30,
  });

  const histories = useMemo(() => {
    return hs.map(h => parseHistory(h));
  }, [hs]);

  const go: GoI = useCallback(async (__h: HistoryI | HistoryI[], ...args): Promise<HistoryI[]> => {
    console.log('go', __h);
    const innerGo = async (_h) => {
      console.log('innerGo', _h);
      const focus = focusRef.current;
      const mem = memoryRef.current;
      const binding = bindingRef.current;
      let historyId, h, nh, p; // prepare root link

      const response = (name: string, __h?: HistoryI) => {
        console.log('go response', name, _h, h);
        return __h || h;
      };

      let mi = mem.findIndex(m => m.historyId === _h.historyId);
      p = createPath(mi, _h);

      if (_h.active && _h.value) {
        response('binding');
        console.log(binding?.[p._path0], go, go.history, memory, focus, ...args);
        binding?.[p._path0]?.[_h.value] && binding?.[p._path0]?.[_h.value]?.(go, go.history, memory, focus, ...args);
        binding?.[p._path1]?.[_h.value] && binding?.[p._path1]?.[_h.value]?.(go, go.history, memory, focus, ...args);
      }

      if (_h?.historyId === 0) {
        const m = mem?.[0] || {};
        nh = { key: `${momeryCounter++}`, ...m, ..._h }
        setMemory([
          nh,
          ...mem.slice(1),
        ]);
        if (_h.focus) response('menu 0');
        else return response('menu 0')
      }

      if (_h.hasOwnProperty('value') && _h.focus) {
        p = createPath(!!~mi ? mi : 0, nh || _h);
        setFocus(p.path);
        console.log(p, _h, mem);
        return response('focus');
      }

      if (_h?.historyId !== 0) {
        if (_h?.historyId) {
          historyId = _h.historyId;
          h = deep.minilinks.byId[historyId];
          // update exists history
        } else {
          // insert new history next
          h = { ..._h, ...(await deep.insert({
            type_id: History,
            containerId: deep.linkId,
            name: 'contains',
            from_id: deep.linkId,
            to_id: deep.linkId,
          }))?.data?.[0] };
          if (!h) return response('insert failed');
          historyId = h.id;
        }

        mi = mem.findIndex(m => m.historyId === _h.historyId);
        p = createPath(mi, _h);

        if (_h.historyId && _h.value === 'close' && _h.active) {
          setMemory(mem.filter(m => m.historyId !== _h.historyId));
          await deep.delete({
            up: { tree_id: { _eq: containTree }, parent_id: { _eq: _h.historyId } },
          });
          return response('close and delete');
        }

        // already exists history?
        const m: HistoryI = !!~mi ? mem[mi] : undefined;

        if (!m) {
          // permomentally add
          setMemory([
            ...mem,
            { key: `${momeryCounter++}`, historyId: historyId, ..._h, active: false, focus: false },
          ]);
        } else {
          // update
          setMemory([
            ...mem.slice(0, mi),
            { ...m, ..._h, active: false, focus: false },
            ...mem.slice(0, mi+1),
          ]);
        }

        if (historyId) {
          // clear old description
          if (_h.historyId) await deep.delete({
            id: { _neq: historyId },
            up: { tree_id: { _eq: containTree }, parent_id: { _eq: historyId } },
          });

          const currentLink = h?.to;
          const newLink = deep.minilinks.byId[_h.linkId];
          let _linkId = _h.linkId || h.to_id;
          let __link: Link<Id> = _linkId ? deep.minilinks.byId[_linkId] : undefined;

          // value changed
          if (_h.linkId !== h.to_id) await deep.update(historyId, { to_id: _h.linkId });
          if (m?.value != _h.value) await deep.value(historyId, `${_h.value}`);

          await deep.insert([
            {
              containerId: historyId,
              from_id: historyId,
              type_id: Layer,
              to_id: _h.layerId || TreeLayer,
            },
            {
              containerId: historyId,
              from_id: historyId,
              type_id: View,
              to_id: _h.viewId || TreeLinkView,
            },
          ]);
        }
      }

      return response('end', h);
    };
    const ___h = Array.isArray(__h) ? __h : [__h]
    const rs = [];
    for (let u in ___h) {
      rs.push(await innerGo(___h[u]));
    }
    return rs;
  }, []);

  wrapGo(go);

  useHotkeys('up,down,right,left,Layer,enter', async (e, h) => {
    const memory = memoryRef.current;
    const focus = focusRef.current;
    const binding = bindingRef.current;
    
    const m = memory.find(m => m.historyId === focus[0]);
    console.log('go hotkey', binding, m, focus);

    binding?.[focus[0]]?.[h.keys[0] || '']?.(go, m, memory, focus, e, h);
    binding?.[focus.join('.')]?.[h.keys[0] || '']?.(go, m, memory, focus, e, h);

  }, { preventDefault: true }, []);

  return <GoContext.Provider value={go}>
    <MemoryRefContext.Provider value={memoryRef}>
      <MemoryContext.Provider value={memory}>
        <FocusContext.Provider value={f}>
          <FocusRefContext.Provider value={focusRef}>
            <ConfigContext.Provider value={config}>
              <BindingRefContext.Provider value={bindingRef}>
                {children}
              </BindingRefContext.Provider>
            </ConfigContext.Provider>
          </FocusRefContext.Provider>
        </FocusContext.Provider>
      </MemoryContext.Provider>
    </MemoryRefContext.Provider>
  </GoContext.Provider>;
}, () => false);

export interface BindingItemI {
  [key: string]: (go, history: HistoryI, memory: HistoryI[], focus: FocusValueI, ...args: any[]) => any;
}

export interface BindingI {
  [focus: string]: BindingItemI;
}

export const Navigation = memo(function Navigation({
  go: _go, path, history,
  binding,

  children = null,
}: {
  go: GoI; path: string; history?: HistoryI;
  binding: BindingItemI;

  children?: any;
}) {
  const deep = useDeep();
  const memoryRef = useMemoryRef();
  const focusRef = useFocusRef();
  const __go = useGo();
  const go = _go || __go;
  const bindingRef = useBindingRef();
  bindingRef.current[path] = binding;
  const { enabledScopes, disableScope, enableScope } = useHotkeysContext();

  // reactivator hotkeys in navigation area
  // useEffect(() => {
  //   prevScopesRef.current = enabledScopes.filter(s => s.includes(`${hpref}`));
  //   const scopes = enabledScopes.filter(s => s.includes(hpref));
  //   for (let i = 0; i < scopes.length; i++) disableScope(scopes[i]);
  //   enableScope(`${hpref}${go.scope}`);
  //   return () => {
  //     disableScope(`${hpref}${go.scope}`);
  //     for (let i = 0; i < prevScopesRef.current.length; i++) enableScope(prevScopesRef.current[i]);
  //   };
  // }, []);

  return !!history ? <go.GoProvider go={go} h={history}>{children}</go.GoProvider> : children;
}, () => false);

