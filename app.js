import {songs as starterSongs, videoId, matches, moveItem, formatTime} from './catalog.js';
const $=id=>document.getElementById(id);
const STORAGE='walwal:v1';
let saved={};try{saved=JSON.parse(localStorage.getItem(STORAGE)||'{}')||{};}catch{}
const validSong=s=>s&&typeof s.id==='string'&&/^[\w-]{11}$/.test(s.id)&&typeof s.title==='string'&&typeof s.artist==='string'&&['OPM','English'].includes(s.category);
let custom=(Array.isArray(saved.custom)?saved.custom:[]).filter(validSong).slice(0,200).map(s=>({...s,color:'#b5c69c',source:'Added by you',mood:s.mood||'Your picks'}));
let catalog=[...starterSongs,...custom.filter(s=>!starterSongs.some(x=>x.id===s.id))];
const known=id=>catalog.some(s=>s.id===id);
let favorites=new Set((Array.isArray(saved.favorites)?saved.favorites:[]).filter(known));
let recent=(Array.isArray(saved.recent)?saved.recent:[]).filter(known).slice(0,50);
let queue=(Array.isArray(saved.queue)?saved.queue:[]).filter(known).slice(0,100);
let view='library',category='All songs',current=null,player=null,ready=false,playing=false,loading=false,playTimer;
let musicVolume=Number.isFinite(saved.volume)?Math.min(100,Math.max(0,saved.volume)):80;
$('volume').value=musicVolume;$('auto-next').checked=saved.autoNext!==false;
function persist(){try{localStorage.setItem(STORAGE,JSON.stringify({custom,favorites:[...favorites],recent,queue,volume:musicVolume,autoNext:$('auto-next').checked}));}catch{toast('Browser storage is unavailable. Changes last for this visit.');}}
let toastTimer;
function toast(message){$('toast').textContent=message;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),3200);}
function element(tag,className,text){const e=document.createElement(tag);if(className)e.className=className;if(text!==undefined)e.textContent=text;return e;}
function button(text,label,fn,className='icon-button'){const b=element('button',className,text);b.type='button';b.setAttribute('aria-label',label);b.addEventListener('click',fn);return b;}
function renderSongs(){
 $('favorite-count').textContent=favorites.size;
 $('library-heading').firstChild.textContent=view==='favorites'?'Your favorites':view==='recent'?'Recently sung':'The songbook';
 const base=view==='recent'?recent.map(id=>catalog.find(s=>s.id===id)).filter(Boolean):catalog;
 const filtered=base.filter(s=>(view!=='favorites'||favorites.has(s.id))&&matches(s,$('search').value,category)&&(!$('mood').value||s.mood===$('mood').value));
 $('song-count').textContent=`${filtered.length} song${filtered.length===1?'':'s'}`;
 $('songs').replaceChildren();
 for(const s of filtered){const card=element('article','song-card'+(current?.id===s.id?' current':''));const art=element('div','song-art');art.style.setProperty('--color',s.color);art.append(element('span','art-category',s.category.toUpperCase()));const fav=button(favorites.has(s.id)?'♥':'♡',`${favorites.has(s.id)?'Unfavorite':'Favorite'} ${s.title}`,()=>{favorites.has(s.id)?favorites.delete(s.id):favorites.add(s.id);persist();renderSongs();},'favorite-button'+(favorites.has(s.id)?' saved':''));fav.setAttribute('aria-pressed',String(favorites.has(s.id)));art.append(fav);card.append(art,element('h3','song-title',s.title),element('div','song-artist',s.artist));const actions=element('div','song-actions');actions.append(button('▶ Sing',`Sing ${s.title}`,()=>playSong(s),'sing-button'),button('+',`Add ${s.title} to queue`,()=>addQueue(s),'queue-button'));card.append(actions);$('songs').append(card);}
 $('library-empty').hidden=filtered.length>0;
 $('empty-message').textContent=view==='favorites'&&!favorites.size?'Tap the heart on a song to save it here.':view==='recent'&&!recent.length?'Songs appear here after playback starts.':'Try another song, artist, or mood.';
}
function addQueue(song){if(queue.length>=100)return toast('The queue is full. Sing a few first!');queue.push(song.id);persist();renderQueue();toast(`${song.title} added to the queue`);}
function renderQueue(){
 $('queue-count').textContent=queue.length;$('queue-empty').hidden=queue.length>0;$('clear-queue').disabled=!queue.length;$('next').disabled=!queue.length;
 $('queue-list').replaceChildren();queue.forEach((id,i)=>{const s=catalog.find(x=>x.id===id);const row=element('div','queue-item');row.append(element('span','queue-number',String(i+1).padStart(2,'0')));const info=element('div','queue-info');info.append(element('strong','',s.title),element('small','',s.artist));const tools=element('div','queue-tools');tools.append(button('Sing now',`Play queued ${s.title}`,()=>{queue.splice(i,1);persist();renderQueue();playSong(s);},''));const up=button('↑',`Move ${s.title} up`,()=>{queue=moveItem(queue,i,-1);persist();renderQueue();},'');up.disabled=i===0;const down=button('↓',`Move ${s.title} down`,()=>{queue=moveItem(queue,i,1);persist();renderQueue();},'');down.disabled=i===queue.length-1;tools.append(up,down);info.append(tools);row.append(info,button('×',`Remove ${s.title} from queue`,()=>{queue.splice(i,1);persist();renderQueue();},'icon-button queue-remove'));$('queue-list').append(row);});
}
function nextSong(){if(!queue.length){toast('Queue is empty. Pick your next song.');return;}const id=queue.shift();persist();renderQueue();playSong(catalog.find(s=>s.id===id));}
let apiPromise;
function loadApi(){
 if(window.YT?.Player)return Promise.resolve();if(apiPromise)return apiPromise;
 apiPromise=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('YouTube took too long to connect. Check your connection, then try again.')),18000);window.onYouTubeIframeAPIReady=()=>{clearTimeout(timer);resolve();};const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.id='youtube-api';script.onerror=()=>{clearTimeout(timer);reject(new Error('Could not connect to YouTube. Check your connection or content blocker.'));};document.head.append(script);}).catch(err=>{apiPromise=null;$('youtube-api')?.remove();throw err;});return apiPromise;
}
function showError(message){clearTimeout(playTimer);$('player-error').hidden=false;$('error-message').textContent=message;$('stage-status').textContent='Playback needs attention';playing=false;updatePlay();}
function updatePlay(){ $('play').textContent=playing?'Ⅱ':'▶';$('play').setAttribute('aria-label',playing?'Pause song':'Play song'); }
async function playSong(song){
 if(!song)return;current=song;loading=true;playing=false;ready=!!player&&ready;
 $('placeholder').hidden=true;$('player-error').hidden=true;$('now-title').textContent=song.title;$('now-artist').textContent=`${song.artist} · Karaoke by ${song.source}`;$('now-art').style.background=song.color;$('stage-status').textContent='Connecting to YouTube…';$('play').disabled=true;$('restart').disabled=true;$('seek').disabled=true;$('seek').value=0;$('elapsed').textContent='0:00';$('duration').textContent='0:00';$('youtube-fallback').href=`https://www.youtube.com/watch?v=${song.id}`;renderSongs();updatePlay();
 clearTimeout(playTimer);playTimer=setTimeout(()=>{if(loading)showError('Playback has not started. Press play in the video, or open this song on YouTube.');},20000);
 try{await loadApi();if(current.id!==song.id)return;
 if(player&&ready){player.loadVideoById(song.id);$('play').disabled=false;$('restart').disabled=false;return;}
 if(player){player.destroy();player=null;}
 $('player-host').replaceChildren(element('div','',''));$('player-host').firstChild.id='youtube-player';
 player=new YT.Player('youtube-player',{host:'https://www.youtube-nocookie.com',videoId:song.id,width:'100%',height:'100%',playerVars:{autoplay:1,playsinline:1,origin:location.origin,controls:1,rel:0},events:{onReady:e=>{ready=true;e.target.setVolume(musicVolume);$('play').disabled=false;$('restart').disabled=false;e.target.loadVideoById(current.id);$('stage-status').textContent='Press play in the video if needed';},onStateChange:e=>{
 playing=e.data===YT.PlayerState.PLAYING;updatePlay();
 if(playing){loading=false;clearTimeout(playTimer);$('player-error').hidden=true;$('stage-status').textContent='The mic is yours';$('seek').disabled=false;recent=[current.id,...recent.filter(x=>x!==current.id)].slice(0,50);persist();if(view==='recent')renderSongs();}
 else if(e.data===YT.PlayerState.PAUSED){loading=false;clearTimeout(playTimer);$('stage-status').textContent='Taking a breath';}
 else if(e.data===YT.PlayerState.ENDED){loading=false;clearTimeout(playTimer);$('stage-status').textContent='Nicely sung!';if($('auto-next').checked&&queue.length)nextSong();else toast('Nicely sung! Pick another song.');}
 else if(e.data===YT.PlayerState.BUFFERING)$('stage-status').textContent='Buffering…';
 },onAutoplayBlocked:()=>{loading=false;clearTimeout(playTimer);$('stage-status').textContent='Press play in the video';toast('Press play in the video to start singing.');},onError:e=>{loading=false;const messages={2:'This video link is invalid.',5:'Your browser could not play this video.',100:'This video is unavailable or has been removed.',101:'The creator has disabled embedded playback.',150:'The creator has disabled embedded playback.',153:'YouTube could not verify this player. Open the hosted app over HTTPS.'};showError((messages[e.data]||'This video could not play.')+' Try another song or open it on YouTube.');}}});
 }catch(err){loading=false;showError(err.message);}
}
$('play').onclick=()=>{if(!ready)return;if(playing)player.pauseVideo();else player.playVideo();};$('restart').onclick=()=>{if(ready){player.seekTo(0,true);player.playVideo();}};$('next').onclick=nextSong;
$('volume').oninput=e=>{musicVolume=Number(e.target.value);if(ready)player.setVolume(musicVolume);persist();};
$('seek').oninput=e=>{if(ready){const duration=player.getDuration();if(duration>0)player.seekTo(duration*Number(e.target.value)/100,true);}};
setInterval(()=>{if(!ready||!player)return;try{const t=player.getCurrentTime()||0,d=player.getDuration()||0;$('elapsed').textContent=formatTime(t);$('duration').textContent=formatTime(d);if(document.activeElement!==$('seek'))$('seek').value=d?t/d*100:0;}catch{}},500);
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if($('stage').requestFullscreen)await $('stage').requestFullscreen();else toast('Use the video player’s fullscreen button.');}catch{toast('Use the video player’s fullscreen button.');}};
$('retry').onclick=()=>playSong(current);$('start-featured').onclick=()=>playSong(starterSongs[0]);$('surprise').onclick=()=>{const pool=catalog.filter(s=>s.id!==current?.id);playSong(pool[Math.floor(Math.random()*pool.length)]||catalog[0]);$('stage').scrollIntoView({behavior:'smooth',block:'center'});};
$('clear-queue').onclick=()=>{queue=[];persist();renderQueue();toast('Queue cleared');};$('auto-next').onchange=persist;
$('search').oninput=renderSongs;$('mood').onchange=renderSongs;
for(const b of document.querySelectorAll('[data-category]'))b.onclick=()=>{category=b.dataset.category;document.querySelectorAll('[data-category]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});renderSongs();};
for(const b of document.querySelectorAll('[data-view]'))b.onclick=()=>{view=b.dataset.view;document.querySelectorAll('[data-view]').forEach(x=>x.classList.toggle('active',x===b));renderSongs();$('library-heading').scrollIntoView({behavior:'smooth',block:'center'});};
$('reset-filters').onclick=()=>{view='library';category='All songs';$('search').value='';$('mood').value='';document.querySelectorAll('[data-category]').forEach(b=>{b.classList.toggle('active',b.dataset.category===category);b.setAttribute('aria-pressed',String(b.dataset.category===category));});document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view));renderSongs();};
for(const id of ['add-video','more-songs'])$(id).onclick=()=>{$('form-error').textContent='';$('add-dialog').showModal();};
for(const id of ['about','help','credits'])$(id).onclick=()=>$('info-dialog').showModal();
for(const b of document.querySelectorAll('.close-dialog'))b.onclick=()=>b.closest('dialog').close();
$('add-form').onsubmit=e=>{e.preventDefault();const data=new FormData(e.target),id=videoId(String(data.get('url')));if(!id){$('form-error').textContent='Enter a valid YouTube video link, such as https://youtu.be/VIDEO_ID.';return;}if(known(id)){$('form-error').textContent='This video is already in your songbook.';return;}if(custom.length>=200){$('form-error').textContent='You have reached the 200 custom song limit.';return;}const title=String(data.get('title')).trim(),artist=String(data.get('artist')).trim();if(!title||!artist){$('form-error').textContent='Enter a song title and artist.';return;}const song={id,title,artist,category:data.get('category'),mood:'Your picks',color:'#b5c69c',source:'Added by you'};custom.push(song);catalog.push(song);persist();$('reset-filters').click();$('add-dialog').close();e.target.reset();toast(`${title} added to your songbook`);};
$('erase-data').onclick=()=>{custom=[];catalog=[...starterSongs];favorites.clear();recent=[];queue=[];musicVolume=80;$('volume').value=80;if(ready)player.setVolume(80);$('auto-next').checked=true;persist();renderSongs();renderQueue();toast('Saved browser data reset');};
document.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName)&&!document.querySelector('dialog[open]')){e.preventDefault();$('search').focus();}});
let stream,context,source,analyser,gain,meterFrame,requestMic=0;
function stopMic(){requestMic++;cancelAnimationFrame(meterFrame);stream?.getTracks().forEach(t=>t.stop());stream=null;if(context){context.close().catch(()=>{});context=null;}source=analyser=gain=null;$('mic-dot').classList.remove('on');$('mic-status').textContent='Your voice. Your moment.';$('mic-toggle').textContent='♩ Enable microphone';$('mic-settings').hidden=true;$('monitor').checked=false;$('mic-level').style.width='0';}
$('mic-toggle').onclick=async()=>{if(stream){stopMic();return;}if(!navigator.mediaDevices?.getUserMedia){$('mic-status').textContent='Microphone needs HTTPS or localhost in a supported browser.';return;}const attempt=++requestMic;$('mic-toggle').disabled=true;$('mic-status').textContent='Allow microphone access in your browser…';try{const incoming=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:false}});if(attempt!==requestMic){incoming.getTracks().forEach(t=>t.stop());return;}stream=incoming;const AudioCtx=window.AudioContext||window.webkitAudioContext;context=new AudioCtx();await context.resume();source=context.createMediaStreamSource(stream);analyser=context.createAnalyser();analyser.fftSize=256;gain=context.createGain();gain.gain.value=Number($('mic-gain').value);source.connect(gain);gain.connect(analyser);$('mic-dot').classList.add('on');$('mic-status').textContent='Mic is on · listening locally';$('mic-toggle').textContent='■ Disable microphone';$('mic-settings').hidden=false;const data=new Uint8Array(analyser.fftSize);const update=()=>{if(!analyser)return;analyser.getByteTimeDomainData(data);let sum=0;for(const x of data)sum+=((x-128)/128)**2;$('mic-level').style.width=`${Math.min(100,Math.sqrt(sum/data.length)*250)}%`;meterFrame=requestAnimationFrame(update);};update();stream.getAudioTracks()[0].onended=stopMic;}catch(err){stopMic();$('mic-status').textContent=err.name==='NotAllowedError'?'Microphone access denied. Allow it in browser settings to try again.':err.name==='NotFoundError'?'No microphone found. Connect one and try again.':'Could not start the microphone. Check your device and browser permissions.';}finally{$('mic-toggle').disabled=false;}};
$('monitor').onchange=async e=>{if(!analyser||!context)return;try{if(e.target.checked){await context.resume();analyser.connect(context.destination);}else analyser.disconnect(context.destination);}catch{e.target.checked=false;toast('Microphone monitoring is unavailable.');}};
$('mic-gain').oninput=e=>{if(gain)gain.gain.value=Number(e.target.value);};
function network(){ $('connection').textContent=navigator.onLine?'Online karaoke':'Offline · internet needed';}addEventListener('online',network);addEventListener('offline',network);addEventListener('pagehide',stopMic);network();renderSongs();renderQueue();
