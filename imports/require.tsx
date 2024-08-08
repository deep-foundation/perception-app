
export function generateRequire() {
  const n = './node_modules/';
  const list = {};
  const cache = (require.cache || []);
  console.log('require:')
  console.dir(require)
  for (let key in (require.cache || [])) {
    const v = cache[key];
    const name = v.id.slice(0, n.length) === n ? v.id.slice(n.length) : v.id;
    list[name] = v;
    if (name.slice(-3) === '.tsx' || name.slice(-3) === '.mjs' || name.slice(-3) === '.cjs') list[name.slice(0, -3)] = v;
    if (name.slice(-2) === '.js' || name.slice(-2) === '.ts') list[name.slice(0, -4)] = v;
    if (!!~name.indexOf('index')) {
      const splitted = name.split('/');
      const short = splitted[0]+(name[0] === '@' ? `/${splitted[1]}` : '');
      if (!list[short]?.id || list[short]?.id > v.id) list[short] = v;
    }
  }
  function _require(name: string) {
    return list[name]?.exports;
  }
  _require.list = list;
  console.dir(_require)
  return _require;
};
