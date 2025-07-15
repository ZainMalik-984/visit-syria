module.exports = {

"[project]/messages/en.json (json, async loader)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/ssr/messages_en_json_042442e0._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/messages/en.json (json)");
    });
});
}}),
"[project]/messages/fr.json (json, async loader)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/ssr/messages_fr_json_6ccc9c4a._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/messages/fr.json (json)");
    });
});
}}),

};