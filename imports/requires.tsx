import * as chakra from '@chakra-ui/react';
import * as icons from '@chakra-ui/icons';
import dynamic from 'next/dynamic';
import { DeepClient, useDeep, useDeepSubscription } from "@deep-foundation/deeplinks/imports/client";
import { evalClientHandler as deepclientEvalClientHandler } from '@deep-foundation/deeplinks/imports/client-handler';
import { Id, useMinilinksFilter, useMinilinksSubscription } from "@deep-foundation/deeplinks/imports/minilinks";
import axios from 'axios';
import * as axiosHooks from 'axios-hooks';
import * as classnames from 'classnames';
import React, { useCallback, useEffect, useRef, PropsWithChildren, useState } from 'react';
// import * as reacticons from 'react-icons';
import * as motion from 'framer-motion';
import Linkify from 'react-linkify';
import * as reactHotkeysHook from 'react-hotkeys-hook';
import * as debounce from '@react-hook/debounce';
import * as json5 from 'json5';
import * as bs from 'react-icons/bs';
import * as pi from 'react-icons/pi';
import * as fi from 'react-icons/fi';
import * as tb from 'react-icons/tb';
import * as io from 'react-icons/io';
import * as gr from 'react-icons/gr';
import * as ci from 'react-icons/ci';
import * as md from 'react-icons/md';
import * as fa from 'react-icons/fa';
import * as ai from 'react-icons/ai';
import * as si from 'react-icons/si';
import * as lu from 'react-icons/lu';
import * as gi from 'react-icons/gi';
import * as io5 from 'react-icons/io5';
import * as vsc from 'react-icons/vsc';
import { IconContext } from 'react-icons';
import $ from 'jquery';
import * as editor from 'slate';
import * as slate from 'slate-react';
import SoftBreak from 'slate-soft-break';
import { slateToHtml, htmlToSlate } from 'slate-serializers';
import isHotkey from 'is-hotkey';
import * as Resizable from 're-resizable';
import * as rjsfCore from '@rjsf/core';
import * as rjsfChakra from '@rjsf/chakra-ui';
import * as rjsfValidator from '@rjsf/validator-ajv8';
// @ts-ignore
// import * as aframeReact from '@belivvr/aframe-react';
// import { Entity, Scene } from 'aframe-react';
import { CatchErrors } from './react-errors';
import _ from 'lodash';
import md5 from "md5";
import { v4 as uuidv4 } from 'uuid';
import * as d3d from 'd3-force-3d';
import * as D3 from 'd3';
import WordCloud from 'react-d3-cloud';
import * as ReactResizeDetector from 'react-resize-detector';
import queryStore from '@deep-foundation/store/query';
import localStore from '@deep-foundation/store/local';
import cookiesStore from '@deep-foundation/store/cookies';
import * as themeTools from '@chakra-ui/theme-tools';
import * as recharts from 'recharts';
import * as i18n from "i18next";
import * as LanguageDetector from 'i18next-browser-languagedetector';
import * as reacti18next from "react-i18next";
import * as reactYandexMaps from '@pbe/react-yandex-maps'
// import ReactCalendarTimeline from 'react-calendar-timeline'
import moment from 'moment'
import * as reactHookForm from 'react-hook-form';

import { TypedIcon } from './icons/typed';
import { DownIcon } from './icons/down';
import { UpIcon } from './icons/up';
import { TypeIcon } from './icons/type';
import { InIcon } from './icons/in';
import { OutIcon } from './icons/out';
import { FromIcon } from './icons/from';
import { ToIcon } from './icons/to';
import * as ApolloSandbox from '@apollo/sandbox/react';
import * as InfiniteScroll from 'react-infinite-scroller';
import * as matchSorter from 'match-sorter';
import * as useAsyncMemo from "use-async-memo";
import * as planet from "react-planet";
import * as ni from "next/image";
import EmojiPicker from 'emoji-picker-react';

// @ts-ignore
const GraphQL = dynamic(() => import('./graphql').then(m => m.GraphQL), { ssr: false })

export const requires: any = {
  'lodash': _,
  'jquery': $,
  '@chakra-ui/react': chakra,
  'react': React,
  'axios': axios,
  'axios-hooks': axiosHooks,
  'classnames': classnames,
  'slate-soft-break': SoftBreak,
  'slate-serializers': { slateToHtml, htmlToSlate },
  'react-hotkeys-hook': reactHotkeysHook,
  '@react-hook/debounce': debounce,
  'json5': json5,
  'framer-motion': motion,
  'slate': editor,
  'slate-react': slate,
  'is-hotkey': isHotkey,
  're-resizable': Resizable,
  // '@monaco-editor/react': MonacoEditor, DEPRICATED
  '@chakra-ui/icons': icons,
  // '@deep-foundation/deepcase': {
  //   useContainer,
  //   useSpaceId,
  //   useFocusMethods,
  //   useBreadcrumbs,
  //   useShowExtra,
  //   useTraveler,
  //   CytoEditorPreview,
  //   CustomizableIcon,
  //   Resize,
  //   EditorTextArea,
  //   ClientHandler,
  //   BubbleArrowLeft,
  //   CytoReactLinkAvatar,
  //   DeepWysiwyg,
  //   useStringSaver,
  //   BlockButton,
  //   MarkButton,
  //   useRefAutofill,
  //   useChackraColor,
  //   useChackraGlobal,
  //   CytoGraph,
  //   useEditorTabs,
  //   useCytoEditor,
  // },
  '@deep-foundation/deeplinks': {
    useMinilinksFilter
  },
  '@deep-foundation/perception-app': {
    TypedIcon,
    DownIcon,
    UpIcon,
    TypeIcon,
    InIcon,
    OutIcon,
    FromIcon,
    ToIcon,
    GraphQL,
  },
  'react-icons/pi': pi,
  'react-icons/bs': bs,
  'react-icons/fi': fi,
  'react-icons/ci': ci,
  'react-icons/tb': tb,
  'react-icons/gr': gr,
  'react-icons/io': io,
  'react-icons/md': md,
  'react-icons/fa': fa,
  'react-icons/ai': ai,
  'react-icons/si': si,
  'react-icons/lu': lu,
  'react-icons/gi': gi,
  'react-icons/io5': io5,
  'react-icons/vsc': vsc,
  'react-icons' : IconContext,
  'react-linkify': Linkify,
  '@rjsf/core': rjsfCore,
  '@rjsf/chakra-ui': rjsfChakra,
  '@rjsf/validator-ajv8': rjsfValidator,
  // '@belivvr/aframe-react': aframeReact,
  // 'aframe-react': { Entity, Scene },
  'md5': md5,
  'uuid': uuidv4,
  'd3-force-3d': d3d,
  'd3': D3,
  'react-d3-cloud': WordCloud,
  'react-resize-detector': ReactResizeDetector,
  '@deep-foundation/store/query': queryStore,
  '@deep-foundation/store/local': localStore,
  '@deep-foundation/store/cookies': cookiesStore,
  'recharts': recharts,
  '@chakra-ui/theme-tools': themeTools,
  "i18next": i18n,
  'i18next-browser-languagedetector': LanguageDetector,
  "react-i18next": reacti18next,
  "@pbe/react-yandex-maps": reactYandexMaps,
  // "react-calendar-timeline": ReactCalendarTimeline,
  "moment": moment,
  "react-hook-form": reactHookForm,
  '@apollo/sandbox/react': ApolloSandbox,
  'react-infinite-scroller': InfiniteScroll,
  'match-sorter': matchSorter,
  'use-async-memo': useAsyncMemo,
  'react-planet': planet,
  'next/image': ni,
  'emoji-picker-react': EmojiPicker,
};

