import { Provider } from 'react-redux';
import { Playground, store } from 'graphql-playground-react';
import { memo, useEffect, useRef } from 'react';
import ReactDOM from "react-dom";

export const GraphQL = memo(function GraphQL({ deep }: { deep }) {
  const ref = useRef();
  useEffect(() => {
    ReactDOM.render(
      <Provider store={store}>
        <Playground
          endpoint={`http${deep.client.ssl ? 's' : ''}://${deep.client.path}`}
          settings={{
            'request.globalHeaders': {
              Authorization: `Bearer ${deep.token}`,
            }
          }}
        />
      </Provider>,
      ref.current,
    );
  }, []);
  return <div ref={ref}/>
  return <>
    <Playground
      endpoint={`http${deep.client.ssl ? 's' : ''}://${deep.client.path}`}
      settings={{
        'request.globalHeaders': {
          Authorization: `Bearer ${deep.token}`,
        }
      }}
    />
  </>;
}, () => true)
