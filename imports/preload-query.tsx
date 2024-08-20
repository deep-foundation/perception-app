const preloadQuery = async (deep) => ({
    type_id: { _nin: [
        deep.idLocal('@deep-foundation/core', 'Promise'),
        deep.idLocal('@deep-foundation/core', 'Then'),
        deep.idLocal('@deep-foundation/core', 'Rejected'),
        deep.idLocal('@deep-foundation/core', 'Resolved'),
        deep.idLocal('@deep-foundation/core', 'PromiseResult'),
    ] },
    up: {
        tree_id: { _eq: deep.idLocal('@deep-foundation/core', 'containTree') },
        parent_id: { _eq: await deep.id('deep', 'users', 'packages') },
    },
});

export default preloadQuery;