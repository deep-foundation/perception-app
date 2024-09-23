import { Box, Button, Portal, useColorMode, useDisclosure, VStack } from "@chakra-ui/react";
import cytoscape from 'cytoscape';
import edgeConnections from 'cytoscape-edge-connections';
import { createContext, forwardRef, memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
// import CytoscapeComponent from 'react-cytoscapejs';
// import klay from 'cytoscape-klay';
import dagre from 'cytoscape-dagre';
// import elk from 'cytoscape-elk';
import { Id, useDeep } from '@deep-foundation/deeplinks';
// import COSEBilkent from 'cytoscape-cose-bilkent';
// import d3Force from 'cytoscape-d3-force';
// import deepd3Force from 'cytoscape-deep-d3-force';
import cola from 'cytoscape-cola';
import fcose from 'cytoscape-fcose';
// import euler from 'cytoscape-euler';
// import elk from 'cytoscape-elk';
// import cxtmenu from 'cytoscape-cxtmenu';
// import cxtmenu from '@lsvih/cytoscape-cxtmenu/src/index';
import edgehandles from 'cytoscape-edgehandles';
// @ts-ignore
import nodeHtmlLabel from 'cytoscape-node-html-label/dist/cytoscape-node-html-label';
import dynamic from 'next/dynamic';

import { useChakraColor } from "@deep-foundation/perception-imports";
import { useDebounceCallback } from '@react-hook/debounce';

import { MdDraw, MdOutlineCenterFocusWeak, MdOutlineDraw } from "react-icons/md";
import { useResizeDetector } from "react-resize-detector";

import { CatchErrors, ReactHandlersContext, useChakraVar, useGoCore, useHandlersGo } from "@deep-foundation/perception-imports";
import cloneDeep from 'lodash/cloneDeep';
import difference from 'lodash/difference';
import flatten from 'lodash/flatten';
import isEqual from 'lodash/isEqual';

const dpl = '@deep-foundation/perception-links';

const CytoscapeComponent = dynamic<any>(
  // @ts-ignore
  () => import('react-cytoscapejs').then((m) => m.default),
  { ssr: false }
);

cytoscape.use(dagre);
// cytoscape.use(COSEBilkent);
// cytoscape.use(klay);
// cytoscape.use(elk);
// cytoscape.use(euler);
// cytoscape.use(d3Force);
// cytoscape.use(deepd3Force);
cytoscape.use(fcose);
cytoscape.use(cola);

cytoscape.use(edgeConnections);
cytoscape.use(edgehandles);

let cytoscapeLasso;
let cytoscapeTidyTree;
if (typeof(window) === 'object') {
  import('cytoscape-lasso/dist/cytoscape-lasso').then((m) => {
    cytoscapeLasso = m.default;
    cytoscape.use(cytoscapeLasso);
  });
  import('cytoscape-tidytree').then((m) => {
    cytoscapeTidyTree = m.default;
    cytoscape.use(cytoscapeTidyTree);
  });
}

nodeHtmlLabel(cytoscape);

export const Graph = memo(function Graph({
  onLoaded: _onLoaded,
  onInsert,

  spaceId = 0,
  onSpaceId,
  containerId = 0,
  onContainerId,

  buttons = true,
  buttonsChildren = null,
  layout: _layout,

  children = null,
}: {
  onLoaded?: (cy) => void;
  onInsert?: (inserted, insertQuery) => void;

  spaceId?: Id;
  onSpaceId?: (id) => void;
  containerId?: Id;
  onContainerId?: (id) => void;

  buttons?: boolean;
  buttonsChildren?: any,
  layout?: any;

  children?: any;
}){
  // console.log('https://github.com/deep-foundation/deepcase-app/issues/236', 'CytoGraph', 'links', links);
  const deep = useDeep();
  const go = useGoCore();

  const [_cy, setCy] = useState<any>();
  const cyRef = useRef<any>(); cyRef.current = _cy;
  const ceRef = useRef<any>();
  const layoutRef = useRef<any>();
  const overlayRef = useRef<any>();
  const bgRef = useRef<any>();
  const rootRef = useRef<any>();
  const { width, height } = useResizeDetector({ targetRef: rootRef });
  const [viewport, setViewport] = useState<{ zoom: number; pan: { x: number; y: number; }}>({ zoom: 1, pan: { x: width / 2, y: height / 2 } });
  const { colorMode, toggleColorMode } = useColorMode();

  const getChakraVar = useChakraVar();

  const line = useChakraColor('deepLine');

  const [space, setSpace] = useState<any>();
  useEffect(() => {
    spaceId && setSpace(deep.get(spaceId));
  }, [spaceId]);
  useEffect(() => {
    if (space && onSpaceId) onSpaceId(space?.id);
  }, [space]);
  const [container, setContainer] = useState<any>();
  useEffect(() => {
    containerId && setContainer(deep.get(containerId));
  }, [containerId]);
  useEffect(() => {
    if (container && onContainerId) onContainerId(container?.id);
  }, [container]);
  const containerRef = useRef(container); containerRef.current = container;

  const spaceDisclosure = useDisclosure();
  const containerDisclosure = useDisclosure();

  const onLoaded = useCallback((cy) => {
    console.log('Graph onLoaded', cy);
    if (_cy) return;
    setCy(cy); cyRef.current = cy;
    if (go?.data) go.data.cy = cy;

    const viewport = (event) => {
      const pan = cy.pan();
      const zoom = cy.zoom();
      // setViewport({ pan, zoom });
      bgRef.current.style['background-size'] = `${zoom * 3}em ${zoom * 3}em`;
      bgRef.current.style['background-position'] = `${pan.x}px ${pan.y}px`;
      if (pan) overlayRef.current.style['transform'] = `translate(${pan.x}px,${pan.y}px) scale(${zoom})`;
    };

    const mouseover = (event) => {
      const linkId = +(event?.target?.id ? event?.target.id() : 0);
    };

    const mouseout = (event) => {
      const linkId = +(event?.target?.id ? event?.target.id() : 0);
    };

    const ehpreviewoff = (event, source, target, preview) => {
      // console.log('ehpreviewoff', preview, preview?.json());
    };
    const ehcomplete = (event, source, target, added) => {
      const s = source.data();
      const t = target.data();
      added.remove();
      console.log('ehcomplete', s, t);
      if (s.linkId && t?.linkId) {
        setInsert({ from: s.linkId, to: t.linkId, containerId: containerRef?.current?.id });
      }
    };

    const bgtap = (event) => {
      console.log(event);
      if (event.target === cy && !event?.originalEvent?.shiftKey && ehRef.current) {
        setInsert({ from: 0, to: 0, containerId: containerRef?.current?.id });
      }
    };

    cy.on('ehpreviewoff', ehpreviewoff);
    cy.on('ehcomplete', ehcomplete);
    cy.on('tap', bgtap);

    cy.on('viewport', viewport);
    cy.on('mouseover', mouseover);
    cy.on('mouseout', mouseout);

    const nodes = cy.nodes();
    const edges = cy.edges();

    relayout();

    _onLoaded && _onLoaded(cy);

    return () => {
      cy.removeListener('viewport', viewport);
      cy.removeListener('mouseover', mouseover);
      cy.removeListener('mouseout', mouseout);

      cy.removeListener('ehpreviewoff', ehpreviewoff);
      cy.removeListener('ehcomplete', ehcomplete);
      cy.removeListener('tap', bgtap);
    };
  }, [_cy]);

  const [styles, setStyles] = useState({});
  const stylesRef = useRef<any>(styles);
  stylesRef.current = styles;
  const style = useCallback((i: number, style?: any) => {
    const styles = { ...stylesRef.current };

    if (!style) delete styles[i];
    else {
      styles[i] = style;
    }
    setStyles(styles);
  }, []);

  const newStylesheets = useCallback(() => {
    const e = bgRef.current;
    const stylesheets = [
      ...(flatten(Object.values(styles)))
    ];
    const _stylesheets: any = cloneDeep(stylesheets);
    for (let s in _stylesheets) {
      const st = _stylesheets[s].style;
      if (st['color']) st['color'] = getChakraVar(st['color']);
      if (st['background-color']) st['background-color'] = getChakraVar(st['background-color']);
      if (st['border-color']) st['border-color'] = getChakraVar(st['border-color']);
      if (st['line-color']) st['line-color'] = getChakraVar(st['line-color']);
      if (st['text-background-color']) st['text-background-color'] = getChakraVar(st['text-background-color']);
      if (st['text-border-color']) st['text-border-color'] = getChakraVar(st['text-border-color']);
      if (st['overlay-color']) st['overlay-color'] = getChakraVar(st['overlay-color']);
      if (st['underlay-color']) st['underlay-color'] = getChakraVar(st['underlay-color']);
      if (st['active-bg-color']) st['active-bg-color'] = getChakraVar(st['active-bg-color']);
      if (st['selection-box-color']) st['selection-box-color'] = getChakraVar(st['selection-box-color']);
      if (st['selection-box-border-color']) st['selection-box-border-color'] = getChakraVar(st['selection-box-border-color']);
      if (st['outside-texture-bg-color']) st['outside-texture-bg-color'] = getChakraVar(st['outside-texture-bg-color']);
    }
    return _stylesheets;
  }, [styles, colorMode]);

  const elements = useMemo(() => [], []);

  const layout = useMemo(() => (typeof(_layout) === 'object' ? _layout : typeof(_layout) === 'function' ? _layout(_cy) : {
    name: 'cola',
    // animate: false, // whether to show the layout as it's running
    refresh: 10, // number of ticks per frame; higher is faster but more jerky
    maxSimulationTime: 100, // max length in ms to run the layout
    // ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
    fit: false, // on every layout reposition of nodes, fit the viewport
    // // padding: 30, // padding around the simulation
    // boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
    nodeDimensionsIncludeLabels: true, // whether labels should be included in determining the space used by a node
  
    // // layout event callbacks
    // ready: function(){}, // on layoutready
    // stop: function(){}, // on layoutstop
  
    // // positioning options
    // randomize: false, // use random node positions at beginning of layout
    // avoidOverlap: false, // if true, prevents overlap of node bounding boxes
    // handleDisconnected: false, // if true, avoids disconnected components from overlapping
    // convergenceThreshold: 0.01, // when the alpha value (system energy) falls below this value, the layout stops
    // nodeSpacing: function( node ){ return 10; }, // extra spacing around nodes
    // flow: undefined, // use DAG/tree flow layout if specified, e.g. { axis: 'y', minSeparation: 30 }
    // alignment: undefined, // relative alignment constraints on nodes, e.g. {vertical: [[{node: node1, offset: 0}, {node: node2, offset: 5}]], horizontal: [[{node: node3}, {node: node4}], [{node: node5}, {node: node6}]]}
    // gapInequalities: undefined, // list of inequality constraints for the gap between the nodes, e.g. [{"axis":"y", "left":node1, "right":node2, "gap":25}]
    // centerGraph: true, // adjusts the node positions initially to center the graph (pass false if you want to start the layout from the current position)
  
    // // different methods of specifying edge length
    // // each can be a constant numerical value or a function like `function( edge ){ return 2; }`
    edgeLength: function( edge ) {
      const baseLength = 100; // base edge length
      const extraLength = 10; // additional length of the edge to take into account the density of connections
      const sourceNode = edge.source();
      const targetNode = edge.target();
  
      // Calculate the number of connected edges for source nodes and target nodes
      const sourceConnectedEdges = sourceNode.connectedEdges().length;
      const targetConnectedEdges = targetNode.connectedEdges().length;
  
      // Increase edge length based on the number of connected edges
      return baseLength + (sourceConnectedEdges + targetConnectedEdges) * extraLength;
    },
    // edgeSymDiffLength: undefined, // symmetric diff edge length in simulation
    // edgeJaccardLength: undefined, // jaccard edge length in simulation
  
    // // iterations of cola algorithm; uses default values on undefined
    // unconstrIter: undefined, // unconstrained initial layout iterations
    // userConstIter: undefined, // initial layout iterations with user-specified constraints
    // allConstIter: undefined, // initial layout iterations with all constraints including non-overlap
    
    // deep: () => deep,
    // name: 'deep-d3-force',
    // animate: true, // whether to show the layout as it's running; special 'end' value makes the layout animate like a discrete layout
    // maxIterations: 0, // max iterations before the layout will bail out
    // maxSimulationTime: 0, // max length in ms to run the layout
    // ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
    // fixedAfterDragging: false, // fixed node after dragging
    // fit: false, // on every layout reposition of nodes, fit the viewport
    // padding: 30, // padding around the simulation
    // boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
    // /**d3-force API**/
    // alpha: 0.8, // sets the current alpha to the specified number in the range [0,1]
    // alphaMin: 0.001, // sets the minimum alpha to the specified number in the range [0,1]
    // alphaDecay: 0.5, // sets the alpha decay rate to the specified number in the range [0,1]
    // alphaTarget: 0.1, // sets the current target alpha to the specified number in the range [0,1]
    // velocityDecay: 0.6, // sets the velocity decay factor to the specified number in the range [0,1]
    // // collideRadius: 1, // sets the radius accessor to the specified number or function
    // // collideStrength: 0.7, // sets the force strength to the specified number in the range [0,1]
    // // collideIterations: 1, // sets the number of iterations per application to the specified number
    // linkId: function id(d) {
    //   return d.id;
    // }, // sets the node id accessor to the specified function
    // linkDistance: 100, // sets the distance accessor to the specified number or function
    // // linkStrength: function strength(link) {
    // //   const sourceNode = cy.getElementById(link.source.id);
    // //   const targetNode = cy.getElementById(link.target.id);
    // //   return 1 / Math.min(sourceNode.degree(), targetNode.degree());
    // // }, // sets the strength accessor to the specified number or function
    // // linkIterations: 1, // sets the number of iterations per application to the specified number
    // manyBodyStrength: -2000, // sets the strength accessor to the specified number or function
    // // manyBodyTheta: 0.9, // sets the Barnes–Hut approximation criterion to the specified number
    // // manyBodyDistanceMin: 1, // sets the minimum distance between nodes over which this force is considered
    // // manyBodyDistanceMax: Infinity, // sets the maximum distance between nodes over which this force is considered
    // xStrength: 0.09, // sets the strength accessor to the specified number or function
    // xX: 0, // sets the x-coordinate accessor to the specified number or function
    // yStrength: 0.09, // sets the strength accessor to the specified number or function
    // yY: 0, // sets the y-coordinate accessor to the specified number or function
    // // radialStrength: 0.05, // sets the strength accessor to the specified number or function
    // // radialRadius: [40],// sets the circle radius to the specified number or function
    // // radialX: 0, // sets the x-coordinate of the circle center to the specified number
    // // radialY: 0, // sets the y-coordinate of the circle center to the specified number
    // // layout event callbacks
    // ready: function(){}, // on layoutready
    // stop: function(){}, // on layoutstop
    // tick: function(progress) {}, // on every iteration
    // // positioning options
    // randomize: false, // use random node positions at beginning of layout
    // // infinite layout options
    // infinite: true // overrides all other options for a forces-all-the-time mode
  }), [_layout]);

  const relayout = useDebounceCallback((callback?: () => any) => {
    if (!cyRef.current) return;
    let lay = layoutRef.current;
    if (lay) {
      lay.stop && lay.stop();
      lay.destroy && lay.destroy();
    }
    layoutRef.current = lay = cyRef.current.elements().layout(layout);
    lay.run();
    cyRef.current.once('layoutready', () => setTimeout(() => { console.log('RELAYOUT'); }, 300));
    callback && callback();
  }, 300);

  const [cytoscape, setCytoscape] = useState<any>(null);
  useEffect(() => {
    if (!!rootRef.current) setCytoscape(<CatchErrors
      errorRenderer={(error, reset, catcher) => {
        if (!catcher.tries) {
          catcher.tries = 1;
          reset();
        }
        return <></>;
      }}
    >
        <CytoscapeComponent
        cy={onLoaded}
        elements={elements}
        layout={layout}
        stylesheet={newStylesheets()}
        panningEnabled={true}
        pan={viewport?.pan}
        zoom={viewport?.zoom}
        style={{ width: '100%', height: '100%' }}
      />
    </CatchErrors>);
  }, [onLoaded, newStylesheets]);

  const center = useCallback(() => {
    if (!_cy) return;
    // _cy.pan({ x: width / 2, y: height / 2 });
    _cy.pan({ x: 0, y: 0 });
    _cy.zoom(1);
    relayout();
  }, [_cy, width, height]);
  const centeredRef = useRef(false);
  useEffect(() => {
    if (!!_cy && !centeredRef.current) {
      center();
      centeredRef.current = true;
    }
  }, [_cy]);

  const [insert, setInsert] = useState<{ from?: Id; to?: Id; containerId?: Id; }>(null);
  const insertDisclosure = useDisclosure();
  useEffect(() => {
    if (!insertDisclosure.isOpen) setInsert(null);
  }, [insertDisclosure.isOpen]);
  useEffect(() => {
    if (insert) insertDisclosure.onOpen();
  }, [insert]);

  const [eh, setEh] = useState<any>(null);
  const ehRef = useRef(eh); ehRef.current = eh;
  const toggleDrawMode = useCallback(() => {
    if (!_cy) return;
    if (eh) {
      eh.disableDrawMode();
      eh.destroy();
      setEh(null);
    } else {
      const eh = _cy.edgehandles({
        canLink: (source, target) => {
          const s = source.data();
          const t = target.data();
          const sCan = typeof(s.canLink) === 'function' ? s.canLink(source, target) : !!s.canLink;
          const tCan = typeof(t.canLink) === 'function' ? t.canLink(source, target) : !!t.canLink;
          // whether an edge can be created between source and target
          return (sCan && tCan);
        },
        edgeParams: (source, target) => {
          const s = source.data();
          const t = target.data();
          console.log('edgeParams', source, s, target, t);
          if (s.linkId && t?.linkId) {
            // setInsert({ from: s.linkId, to: t.linkId });
            // insertDisclosure.onOpen();
          }
          return {};
        },
      });
      eh.enableDrawMode();
      setEh(eh);
    }
  }, [_cy, eh]);

  const returning = (<>
    <go.Component path={[dpl, 'Finder']}
      disclosure={spaceDisclosure} initialId={space?.id || deep?.linkId}
      onSubmit={(id) => {
        go.do('containerId', { id });
        go.do('spaceId', { id });
        spaceDisclosure.onClose();
      }}
    />
    <go.Component path={[dpl, 'Finder']}
      disclosure={containerDisclosure} initialId={container?.id || deep?.linkId}
      onSubmit={(id) => {
        go.do('containerId', { id });
        containerDisclosure.onClose();
      }}
    />
    <Box position='absolute' left='0' top='0' right='0' bottom='0' ref={rootRef}>
      {!!insertDisclosure.isOpen && !!insert && <go.Component path={[dpl, 'LinkInsertModal']}
        disclosure={insertDisclosure}
        defaultFromId={insert.from}
        defaultToId={insert.to}
        defaultContainerId={insert.containerId}
        onInsert={(inserted, insertQuery) => {
          onInsert && onInsert(inserted, insertQuery);
        }}
      />}
      <Box ref={bgRef}
        position='absolute' left='0' top='0' right='0' bottom='0'
        backgroundImage={`linear-gradient(${line} .1em, transparent .1em), linear-gradient(90deg, ${line} .1em, transparent .1em)`}
        backgroundSize={`3em 3em`}
        backgroundPosition={`0px 0px`}
      ></Box>
      {cytoscape}
      <VStack
        alignItems='end'
        position='absolute' right='1em' top='1em'
        pointerEvents='none'
        sx={{
          '& > *': {
            'pointer-events': 'all',
          },
        }}
      >
        {!!buttons && <>
          <Button onClick={containerDisclosure.onOpen}
          >🗃️: {container ? `${container.symbol} ${container.name}` : `no containerId`}</Button>
          <Button onClick={spaceDisclosure.onOpen}
          >🔮: {space ? `${space.symbol} ${space.name}` : `no spaceId`}</Button>
          <Button
            w='3em' h='3em' onClick={() => relayout()}
            >🩼</Button>
          <Button
            w='3em' h='3em' onClick={center}
            ><MdOutlineCenterFocusWeak/></Button>
          <Button
            w='3em' h='3em' onClick={toggleDrawMode}
            variant={!!eh ? 'active' : undefined}
            >{!!eh ? <MdDraw/> : <MdOutlineDraw/>}</Button>
        </>}
        {buttonsChildren}
      </VStack>
    </Box>
  </>);

  const classesRef = useRef<{ [id: string]: { [className: string]: number } }>({});

  return <GraphContext.Provider value={{ cyRef, layout, layoutRef, relayout, style, cy: _cy, classesRef, overlayRef }}>
    {returning}
    {!!_cy && <Box
      ref={overlayRef}
      position='absolute' left='0' top='0'
      transformOrigin='top left'
      pointerEvents='none'
    >{children}</Box>}
  </GraphContext.Provider>
});

export const GraphContext = createContext<any>(null);
export function useGraph() {
  return useContext(GraphContext);
}

export const GraphElementsContext = createContext(undefined);
GraphElementsContext.displayName = 'GraphElementsContext';

// Node
let nodesIterator = 1;
export const GraphNode = memo(forwardRef(function GraphNode({
  element,
  ghost = false,
  children = null,
  onAdded,
  ...props
}: {
  element?: {
    id: string;
    data: {
      id?: string;
      parent?: string;
      [key: string]: any
    };
    position?: { x?: number; y?: number; };
    classes?: string[];
    locked?: boolean;
    grabbable?: boolean;
  };
  ghost?: boolean;
  children?: any;
  onAdded?: (el, cy) => void;
  [key: string]: any
}, _ref: any = {}) {
  const ref = _ref || {};
  const { cy, layout, layoutRef, relayout, classesRef, overlayRef } = useContext(GraphContext);
  const go = useGoCore();
  const hgo = useHandlersGo();
  const focused = useContext(ReactHandlersContext);
  const i = useMemo(() => nodesIterator++, []);
  const cls = useMemo(() => `ni-${i}${ghost ? '-ghost' : ''}`, []);
  const parent = useContext(GraphElementsContext);
  const boxRef = useRef<any>();
  
  const id = `${element?.id || element?.data?.id}`;
  if (!id) throw new Error(`GraphNode !props.element.id && !props.element.data.id`);

  // onMount onUnmount
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
    props?.onMount && props?.onMount(element);
    return () => props?.onUnmount && props?.onUnmount(element);
  }, []);

  // define
  const el = useMemo(() => {
    const el = cy.$id(id);
    if (!el.length) {
      const el = cy.add({ group: 'nodes', data: { linkId: go.linkId, id, label: id, parent: (parent && parent.id()) || undefined }, id, classes: [cls] });
      if (ghost) el.emit('ghost');
      relayout(() => {
        ref.current = cy.$id(id);
      });
      console.log('GraphNode define new', i, id, { ghost, el });

      const onClick = (e) => {
        console.log('GraphNode onClick', i, id, { e, el, props });
        props.onClick && props.onClick(e);
      };
      el.on('click', onClick);

      const onGhost = (e) => {
        console.log('GraphNode onGhost', i, id, { e, el });
        if (e.shiftKey) {
          focused.current.focus(hgo.linkId, hgo, go);
        } else props.onGhost && props.onGhost(e);
      };
      el.on('ghost', onGhost);

      const onUnghost = (e) => {
        console.log('GraphNode onUnghost', i, id, { e, el });
        props.onUnghost && props.onUnghost(e);
      };
      el.on('unghost', onUnghost);

      const onPosition = (e) => {
        const d = e.target.data();
        if (boxRef.current) {
          // go().do('position', { id: d.linkId, cytoscapeEvent: e });
          const p = e.target.position();
          if (p) boxRef.current.style['transform'] = `translate(${p.x}px,${p.y}px)`;
        }
      };
      el.on('position', onPosition);
      el.on('data', onPosition);

      onAdded && onAdded(el, cy);
      return el;
    }
    else {
      el.addClass(cls);
      if (!ghost) {
        const classes = el.classes();
        const hasGhost = classes.find(c => c.slice(0, 3) === 'ni-' && c.slice(-5) === 'ghost');
        if (hasGhost) el.emit('unghost');
        console.log('GraphNode define old', i, id, { ghost, hasGhost, el });
      }
      return el;
    }
  }, []);
  
  useEffect(() => {
    const el = cy.$id(id);
    const p = el.position();
    if (p) boxRef.current.style['transform'] = `translate(${p.x}px,${p.y}px)`;
  });

  // undefine
  useEffect(() => {
    return () => {
      try {
        const el = cy.$id(id);
        if (el.length) {
          el.removeClass(cls);
          const classes = el.classes();
          if (!classes.find(c => !!~c.indexOf('ni-'))) {
            el.remove();
            relayout();
            console.log('GraphNode undefine', i, id, { el });
          } else {
            // ghost if not last real
            if (!ghost) {
              const hasGhost = classes.find(c => c.slice(0, 3) === 'ni-' && c.slice(-5) === 'ghost');
              if (hasGhost) {
                el.emit('ghost');
                console.log('GraphNode undefine ghost', i, id, { el, ghost, hasGhost });
              }
            }
          }
        }
      } catch(e) {}
    };
  }, []);
  
  // parents
  useEffect(() => {
    if (parent) {
      const el = cy.$id(id);
      el.addClass(`p-${parent.id()}`);
      if (!el.data().parent) el.data({ ...el.data(), parent: parent.id() })
    }
    return () => {
      if (parent) {
        const el = cy.$id(id);
        if (el.length) {
          el.removeClass(`p-${parent.id()}`);
          if (el.data().parent === parent.id()) {
            const other = el.classes().find(c => c.slice(0, 2) === 'p-')
            if (other) el.move(other.slice(2));
          }
        }
      }
    };
  }, []);

  // classes
  const prevClassesRef = useRef([]);
  useEffect(() => {
    const el = cy.$id(id);
    const classes = classesRef.current;
    const prev = prevClassesRef.current;
    const next = element.classes;
    if (el.length) {
      const hasNotGhost = el.classes().find(c => c.slice(0, 3) === 'ni-' && c.slice(-5) !== 'ghost');
      if ((!ghost || (ghost && !hasNotGhost)) && !isEqual(prev, next)) {
        const removed = difference(prev, next);
        const added = difference(next, prev);
        classes[id] = classes[id] || {};
        const toRemove = [];
        const toAdd = [];
        for (let r in removed) {
          classes[id][removed[r]] = (classes[id]?.[removed[r]] || 1) - 1
          if (!classes[id][removed[r]]) toRemove.push(removed[r]);
        }
        for (let a in added) {
          classes[id][added[a]] = (classes[id]?.[added[a]] || 0) + 1;
          if (classes[id][added[a]] === 1) toAdd.push(added[a]);
        }
        // console.log('GraphNode classes', i, id, {classes, prev, next, added, removed, toAdd, toRemove});
        if (toRemove.length) el.removeClass(toRemove);
        if (toAdd.length) el.addClass(toAdd);
        prevClassesRef.current = element.classes || [];
      }
    }
  }, [element.classes]);

  useEffect(() => {
    return () => {
      const classes = classesRef.current;
      const prev = prevClassesRef.current;
      for (let c in prev) {
        classes[id][prev[c]] = (classes[id][prev[c]] || 1) - 1;
        if (!classes[id][prev[c]]) delete classes[id][prev[c]];
      }
      // console.log('GraphNode unclasses', i, id, {classes, prev});
    };
  }, []);

  // position
  useEffect(() => {
    const el = cy.$id(id);
    const prev = el.position();
    if (!!element.position && !isEqual(prev, element.position)) {
      el.position(element.position);
      relayout();
      console.log('GraphNode position', i, id, { prev, next: element.position });
    }
  }, [element.position]);

  // locked
  useEffect(() => {
    if (typeof(element.locked) === 'boolean') {
      const el = cy.$id(id);
      const locked = el.locked();
      if (locked != element.locked) el[element.locked ? 'lock' : 'unlock']();
    }
  }, [element.locked]);

  // grabbable
  useEffect(() => {
    if (typeof(element.grabbable) === 'boolean') {
      const el = cy.$id(id);
      const grabbable = el.grabbable();
      if (grabbable != element.grabbable) el[element.grabbable ? 'grabify' : 'ungrabify']();
    }
  }, [element.grabbable]);

  // data
  const prevDataRef = useRef<any>();
  useEffect(() => {
    const prev = prevDataRef.current;
    const next = element.data;
    if (!isEqual(prev, next)) {
      const el = cy.$id(id);
      if (!el) return;
      const hasNotGhost = el.classes().find(c => c.slice(0, 3) === 'ni-' && c.slice(-5) !== 'ghost');
      if (!ghost || (ghost && !hasNotGhost)) {
        console.log('GraphNode data', i, id, { prev, next, now: el.data(), ghost, hasNotGhost });
        el.data(next);
      }
    }
    prevDataRef.current = element.data
  }, [element.data]);

  return <>
    <GraphElementsContext.Provider value={el}>
      {<Portal containerRef={overlayRef}><Box w='0' h='0' position={'absolute'} top={0} left={0} pointerEvents='all' ref={boxRef}>{<>
        {!!isMounted && children}
      </>}</Box></Portal>}
    </GraphElementsContext.Provider>
  </>;
}), (p, n) => isEqual(p, n));


// Edge
let edgesIterator = 1;
export const GraphEdge = memo(function GraphEdge({
  element,
  children = null,
  ...props
}: {
  element?: any;
  children?: any;
  [key: string]: any
}) {
  const { cy, layout, layoutRef, relayout, classesRef } = useContext(GraphContext);
  const go = useGoCore();
  const i = useMemo(() => edgesIterator++, []);
  const cls = useMemo(() => `ei-${i}`, []);
  
  const id = `${element?.id || element?.data?.id}`;
  if (!id) throw new Error(`GraphEdge !props.element.id && !props.element.data.id`);

  // onMount onUnmount
  const [isMounted, setIsMounted] = useState(false);
  const mount = useCallback(() => {
    setIsMounted(true);
  }, []);

  const add = useCallback(() => {
    if (!isMounted) return;
    const elements = [];
    const sourceId = element.data.source;
    const targetId = element.data.target;
    const exists = cy.$(`[source="${sourceId}"][target="${targetId}"]`);
    if (!exists.length) {
      const source = cy.$id(`${sourceId}`);
      const target = cy.$id(`${targetId}`);
      const toAdd = [...elements, { group: 'edges', data: {
        id, linkId: go.linkId, source: `${sourceId}`, target: `${targetId}`,
      }, classes: [cls, ...(element.classes || [])] }];
      const el = cy.add(toAdd);

      const onClick = (e) => {
        console.log('GraphEdge onClick', i, id, { e, el, props });
        props.onClick && props.onClick(e);
      };
      el.on('click', onClick);
    }
  }, [element, isMounted]);

  // undefine
  useEffect(() => () => {
    try {
      const el = cy.$id(`${element.data.id}`);
      console.log('GraphEdge remove', i, id, { element, el });
      cy.remove(`#${element.data.id}`);
    } catch(e) {}
  }, []);

  // define redefine
  useEffect(() => {
    const el = cy.$id(`${element.data.id}`);
    const eld = el ? el.data() : undefined;
    if (!!isMounted && (!el.length || (eld?.source != element?.data?.source || eld?.target != element?.data?.target))) {
      if (el.length) {
        cy.remove(`#${element.data.id}`);
        console.log('GraphEdge update', i, id, { el, element });
      } else {
        console.log('GraphEdge add', i, id, { el, element });
      }
      add();
      relayout();
    }
  }, [element, isMounted]);

  // classes
  const prevClassesRef = useRef([]);
  useEffect(() => {
    if (!!isMounted) {
      const el = cy.$id(id);
      const classes = classesRef.current;
      const prev = prevClassesRef.current;
      const next = element.classes;
      if (!isEqual(prev, next)) {
        const removed = difference(prev, next);
        const added = difference(next, prev);
        classes[id] = classes[id] || {};
        const toRemove = [];
        const toAdd = [];
        for (let r in removed) {
          classes[id][removed[r]] = (classes[id]?.[removed[r]] || 1) - 1
          if (!classes[id][removed[r]]) toRemove.push(removed[r]);
        }
        for (let a in added) {
          classes[id][added[a]] = (classes[id]?.[added[a]] || 0) + 1;
          if (classes[id][added[a]] === 1) toAdd.push(added[a]);
        }
        // console.log('GraphEdge classes', i, id, { el, classes, prev, next, added, removed, toAdd, toRemove});
        if (toRemove.length) el.removeClass(...toRemove);
        if (toAdd.length) el.addClass(...toAdd);
        prevClassesRef.current = element.classes || [];
      }
    }
  }, [element.classes]);

  useEffect(() => {
    return () => {
      const classes = classesRef.current;
      const prev = prevClassesRef.current;
      for (let c in prev) {
        classes[id][prev[c]] = (classes[id][prev[c]] || 1) - 1;
        if (!classes[id][prev[c]]) delete classes[id][prev[c]];
      }
      // console.log('GraphEdge unclasses', i, id, { classes, prev });
    };
  }, []);

  const ghostsRef = useRef(0);
  const ghostMounted = useCallback(() => {
    ghostsRef.current++;
    if (ghostsRef.current == 2) mount();
  }, []);

  const mountedRef = useRef(false);
  useEffect(() => {
    if (isMounted && !mountedRef.current) {
      props?.onMount && props?.onMount(element);
    }
    return () => props?.onUnmount && props?.onUnmount(element);
  }, [isMounted]);


  return <>
    <go.Component path={[dpl, 'GraphLinkGhost']} id={element.data.source} onMount={ghostMounted}/>
    <go.Component path={[dpl, 'GraphLinkGhost']} id={element.data.target} onMount={ghostMounted}/>
  </>;
}, (p, n) => isEqual(p, n));

let stylesIterator = 1;
export const GraphStyle = memo(function GraphStyle({
  stylesheet,
}: {
  stylesheet?: any;
}) {
  const i = useMemo(() => stylesIterator++, []);
  const { cyRef, layout, layoutRef, relayout, style } = useContext(GraphContext);

  useMemo(() => {
    style(i, stylesheet);
  }, []);
  useEffect(() => () => {
    style(i);
  }, []);
  useEffect(() => {
    style(i, stylesheet);
  }, [stylesheet]);
  return null;
}, (p, n) => isEqual(p, n));