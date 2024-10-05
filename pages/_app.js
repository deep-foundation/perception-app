import { appWithTranslation } from 'next-i18next';
import { Noto_Color_Emoji, Jost } from 'next/font/google';
import { v4 as uuidv4 } from 'uuid';
import '../imports/style.css';
import { Provider } from '../src/provider';
import { Global } from '@emotion/react';

if (typeof(crypto) === 'object') {
  crypto.__proto__randomUUID = uuidv4;
}

// const interEmoji = Noto_Color_Emoji({ weight: '400', subsets: ['emoji'] })
const interJost = Jost({ weight: '400', subset: ['cyrillic', 'latin'], preload: false })

// console.log(interJost);
function App({ Component, pageProps }) {
  return (
    <>
      <main class={interJost.className}>
        {/* <style jsx global>{`
          html {
            font-family: ${inter.style.fontFamily} 'Arial';
          }
        `}</style> */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"></link>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"></link>
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"></link>
        <link rel="icon" type="image/x-icon" href="/favicon.ico"></link>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"/>
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
        <Provider {...pageProps}>
          <Component {...pageProps} />
        </Provider>
      </main>
    </>
  );
}

export default appWithTranslation(App);
// export default App;
