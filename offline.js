const DB_NAME='walwal-offline', DB_VERSION=1;
let opened;
export function openLibrary(){
 if(opened)return opened;
 opened=new Promise((resolve,reject)=>{const r=indexedDB.open(DB_NAME,DB_VERSION);r.onupgradeneeded=()=>{const db=r.result;db.createObjectStore('songs',{keyPath:'id'});db.createObjectStore('media',{keyPath:'id'});};r.onsuccess=()=>{r.result.onversionchange=()=>{r.result.close();opened=null;};resolve(r.result);};r.onerror=()=>reject(r.error);r.onblocked=()=>reject(new Error('Close other WALWAL tabs and try again.'));}).catch(e=>{opened=null;throw e;});return opened;
}
function completed(tx){return new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error||new Error('Storage operation cancelled'));tx.onerror=()=>{};});}
export async function listOffline(){const db=await openLibrary();return new Promise((resolve,reject)=>{const r=db.transaction('songs').objectStore('songs').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
export async function readMedia(id){const db=await openLibrary();return new Promise((resolve,reject)=>{const r=db.transaction('media').objectStore('media').get(id);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
export async function saveOffline(song,blob,lrc=''){const db=await openLibrary();const tx=db.transaction(['songs','media'],'readwrite');const done=completed(tx);tx.objectStore('songs').put(song);tx.objectStore('media').put({id:song.id,blob,lrc});await done;}
export async function deleteOffline(id){const db=await openLibrary();const tx=db.transaction(['songs','media'],'readwrite');const done=completed(tx);tx.objectStore('songs').delete(id);tx.objectStore('media').delete(id);await done;}
export function fileStem(name){return name.replace(/\.[^.]+$/,'').trim().toLowerCase();}
export function metadata(name){const stem=name.replace(/\.[^.]+$/,'').replace(/_/g,' ').trim();const split=stem.indexOf(' - ');return split>0?{artist:stem.slice(0,split).trim(),title:stem.slice(split+3).trim()}:{artist:'Local library',title:stem||'Untitled'};}
export function parseLrc(text){const lines=[];let offset=0;const off=text.match(/\[offset:\s*(-?\d+)\s*\]/i);if(off)offset=Number(off[1])/1000;for(const row of text.split(/\r?\n/)){const stamps=[...row.matchAll(/\[(\d+):(\d{1,2}(?:\.\d{1,3})?)\]/g)];const value=row.replace(/\[[^\]]*\]/g,'').trim();for(const s of stamps)lines.push({time:Math.max(0,Number(s[1])*60+Number(s[2])+offset),text:value});}return lines.sort((a,b)=>a.time-b.time);}
export function activeLine(lines,time){let low=0,high=lines.length-1,result=-1;while(low<=high){const mid=(low+high)>>1;if(lines[mid].time<=time){result=mid;low=mid+1;}else high=mid-1;}return result;}
export function supportedFile(file){return /\.(mp3|mp4|m4a|webm|wav|ogg|flac)$/i.test(file.name);}
export async function fileIdentity(file){const stamp=new TextEncoder().encode(`${file.name}:${file.size}:`);const bytes=new Uint8Array(await new Blob([stamp,file.slice(0,65536),file.slice(Math.max(65536,file.size-65536))]).arrayBuffer());if(globalThis.crypto?.subtle){const hash=await crypto.subtle.digest('SHA-256',bytes);return 'local-'+Array.from(new Uint8Array(hash),n=>n.toString(16).padStart(2,'0')).join('');}let hash=14695981039346656037n;for(const n of bytes)hash=BigInt.asUintN(64,(hash^BigInt(n))*1099511628211n);return 'local-'+hash.toString(16);}
export async function importFiles(files,category,onProgress=()=>{}){
 const all=Array.from(files),media=all.filter(supportedFile),lyrics=new Map(all.filter(f=>/\.lrc$/i.test(f.name)).map(f=>[(f.webkitRelativePath||f.name).replace(/\.[^.]+$/,'').toLowerCase(),f]));
 if(!media.length)throw new Error('Choose MP3, MP4, M4A, WebM, WAV, OGG, or FLAC files. LRC lyrics can accompany them.');
 let added=0,skipped=0;const failures=[];const known=new Set((await listOffline()).map(s=>s.id));
 for(let i=0;i<media.length;i++){const file=media[i];onProgress(i+1,media.length,file.name);try{if(file.size>256*1024*1024)throw new Error('File exceeds the 256 MB per-song limit');if(!file.size)throw new Error('File is empty');const id=await fileIdentity(file);if(known.has(id)){skipped++;continue;}const meta=metadata(file.name);const lrcFile=lyrics.get((file.webkitRelativePath||file.name).replace(/\.[^.]+$/,'').toLowerCase());const lrc=lrcFile?await lrcFile.text():'';if(lrc.length>2e6)throw new Error('LRC file is too large');const song={id,...meta,category,mood:'Your picks',source:'Saved on this device',color:'#b5c69c',local:true,bytes:file.size,filename:file.name,addedAt:Date.now()};await saveOffline(song,file,lrc);known.add(id);added++;}catch(e){failures.push(`${file.name}: ${e.name==='QuotaExceededError'?'Device storage is full':e.message}`);}}
 return {added,skipped,failures};
}
