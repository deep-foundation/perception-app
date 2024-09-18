import { preloadApi } from '@deep-foundation/perception-imports';
let initial = false;
export default async function(req, res) {
    return await (preloadApi()(req, res));
}