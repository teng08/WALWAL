// App assets only. YouTube, accounts, microphone audio, and local songs are never cached here.
const CACHE='walwal-shell-v2';
const ASSETS=['./','./index.html','./style.css','./app.js','./catalog.js','./offline.js','./demo.js','./logo.svg','./manifest.webmanifest'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('walwal-shell-')&&key!==CACHE)await caches.delete(key);await self.clients.claim();})());});
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin)return;const root=new URL('./',self.location.href);const allowed=ASSETS.map(path=>new URL(path,root).href);if(!allowed.includes(url.href))return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE);const cached=await cache.match(event.request);return cached||fetch(event.request);})());
});
