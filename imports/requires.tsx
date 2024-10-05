// import * as icons from '@chakra-ui/icons';
import * as chakra from '@chakra-ui/react';
import * as deeplinks from '@deep-foundation/deeplinks';
import axios from 'axios';
import * as axiosHooks from 'axios-hooks';
import * as classnames from 'classnames';
import React from 'react';
import * as perception from '@deep-foundation/perception-imports';
import * as debounce from '@react-hook/debounce';
// import * as rjsfChakra from '@rjsf/chakra-ui';
// import * as rjsfCore from '@rjsf/core';
// import * as rjsfValidator from '@rjsf/validator-ajv8';
// import * as motion from 'framer-motion';
import isHotkey from 'is-hotkey';
import $ from 'jquery';
import * as json5 from 'json5';
import * as Resizable from 're-resizable';
import * as reactHotkeysHook from 'react-hotkeys-hook';
import Linkify from 'react-linkify';
import * as editor from 'slate';
import * as slate from 'slate-react';
import { htmlToSlate, slateToHtml } from 'slate-serializers';
import SoftBreak from 'slate-soft-break';
// @ts-ignore
// import * as aframeReact from '@belivvr/aframe-react';
// import { Entity, Scene } from 'aframe-react';
import * as themeTools from '@chakra-ui/theme-tools';
import cookiesStore from '@deep-foundation/store/cookies.js';
import localStore from '@deep-foundation/store/local.js';
import queryStore from '@deep-foundation/store/query.js';
// import * as reactYandexMaps from '@pbe/react-yandex-maps';
// import * as D3 from 'd3';
// import * as d3d from 'd3-force-3d';
import * as i18n from "i18next";
import * as LanguageDetector from 'i18next-browser-languagedetector';
import _ from 'lodash';
import md5 from "md5";
import * as reacti18next from "react-i18next";
import * as ReactResizeDetector from 'react-resize-detector';
import * as recharts from 'recharts';
import { v4 as uuidv4 } from 'uuid';
// import ReactCalendarTimeline from 'react-calendar-timeline'
import moment from 'moment';
import * as reactHookForm from 'react-hook-form';

// import EmojiPicker from 'emoji-picker-react';
import * as matchSorter from 'match-sorter';
import * as ni from "next/image.js";
import * as InfiniteScroll from 'react-infinite-scroller';
import * as planet from "react-planet";
import * as useAsyncMemo from "use-async-memo";

import * as semver from 'semver';

import { requires as piRequires } from '@deep-foundation/perception-imports/imports/requires';
import dynamic from 'next/dynamic';

// @ts-ignore
const GraphQL = dynamic(() => import('./graphql').then(m => m.GraphQL), { ssr: false })
const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false })

export const requires: any = {
  ...piRequires,
  '@deep-foundation/deeplinks': deeplinks,
  '@deep-foundation/perception-imports': perception,
  '@deep-foundation/perception-app': {
    ...perception,
    GraphQL,
  },

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
  'framer-motion': import('framer-motion'),
  'slate': editor,
  'slate-react': slate,
  'is-hotkey': isHotkey,
  're-resizable': Resizable,
  
  '@chakra-ui/icons': import('@chakra-ui/icons'),

  '@rjsf/chakra-ui': import('@rjsf/chakra-ui'),
  '@rjsf/core': import('@rjsf/core'),
  '@rjsf/validator-ajv8': import('@rjsf/validator-ajv8'),

  'react-icons/pi': import('react-icons/pi'),
  'react-icons/bs': import('react-icons/bs'),
  'react-icons/fi': import('react-icons/fi'),
  'react-icons/ci': import('react-icons/ci'),
  'react-icons/tb': import('react-icons/tb'),
  'react-icons/gr': import('react-icons/gr'),
  'react-icons/io': import('react-icons/io'),
  'react-icons/md': import('react-icons/md'),
  'react-icons/fa': import('react-icons/fa'),
  'react-icons/ai': import('react-icons/ai'),
  'react-icons/si': import('react-icons/si'),
  'react-icons/lu': import('react-icons/lu'),
  'react-icons/gi': import('react-icons/gi'),
  'react-icons/io5': import('react-icons/io5'),
  'react-icons/vsc': import('react-icons/vsc'),
  'react-linkify': import('react-linkify'),

  'md5': md5,
  'uuid': uuidv4,
  // 'd3-force-3d': d3d,
  // 'd3': D3,
  'react-resize-detector': ReactResizeDetector,
  '@deep-foundation/store/query': queryStore,
  '@deep-foundation/store/local': localStore,
  '@deep-foundation/store/cookies': cookiesStore,
  'recharts': recharts,
  '@chakra-ui/theme-tools': themeTools,
  "i18next": i18n,
  'i18next-browser-languagedetector': LanguageDetector,
  "react-i18next": reacti18next,
  // "@pbe/react-yandex-maps": reactYandexMaps,
  // "react-calendar-timeline": ReactCalendarTimeline,
  "moment": moment,
  "react-hook-form": reactHookForm,
  '@apollo/sandbox/react': import('@apollo/sandbox/react/index.cjs'),
  'react-infinite-scroller': InfiniteScroll,
  'match-sorter': matchSorter,
  'use-async-memo': useAsyncMemo,
  'react-planet': import('react-planet'),
  'next/image': ni,
  'emoji-picker-react': EmojiPicker,

  'semver': semver,
};

