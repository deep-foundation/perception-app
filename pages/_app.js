import { appWithTranslation } from 'next-i18next';
import { Provider } from '../src/provider';
import c from 'crypto';
import { v4 as uuidv4 } from 'uuid';

if (typeof(crypto) === 'object') {
  crypto.__proto__randomUUID = uuidv4;
}

function App({ Component, pageProps }) {
  return (
    <>
      <Provider>
        <Component {...pageProps} />
      </Provider>
    </>
  );
}

export default appWithTranslation(App);
