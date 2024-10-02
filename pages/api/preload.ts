import { preloadApi } from '@deep-foundation/perception-imports';
let initial = false;
const preloadHandler = await preloadApi(process.env.GQL);
export default async function(req, res) {
    return await preloadHandler(req, res);
}