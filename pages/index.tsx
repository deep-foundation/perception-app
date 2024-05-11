import { useDeep } from '@deep-foundation/deeplinks/imports/client';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { i18nGetStaticProps } from '../src/i18n';
import {
  DeviceProvider
} from '@deep-foundation/deepmemo-imports/imports/device';
import Test from '@deep-foundation/deepmemo-imports/imports/index';

export default function Page() {
  const deep = useDeep();
  const { t } = useTranslation();
  const router = useRouter();

  // @ts-ignore
  if (typeof(window) === 'object') window.deep = deep;
  console.log('deep', deep);

  return (<>
    <DeviceProvider>
      <Test/>
    </DeviceProvider>
  </>);
}

export async function getStaticProps(arg) {
  return await i18nGetStaticProps(arg);
}