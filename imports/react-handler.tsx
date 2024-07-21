import { memo, useEffect, useRef, useState } from 'react';
import { Id, Link } from '@deep-foundation/deeplinks/imports/minilinks';
import { DeepClient, useDeep } from '@deep-foundation/deeplinks/imports/client';
import { gql } from '@apollo/client/index';

import React from 'react';
