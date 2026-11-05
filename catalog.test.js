import test from 'node:test';
import assert from 'node:assert/strict';
import {songs,videoId,matches,moveItem,formatTime} from './catalog.js';
test('catalog has unique valid video IDs and both song categories',()=>{assert.equal(new Set(songs.map(s=>s.id)).size,songs.length);for(const s of songs)assert.match(s.id,/^[\w-]{11}$/);assert.deepEqual(new Set(songs.map(s=>s.category)),new Set(['OPM','English']));});
test('YouTube URL parser accepts supported URLs and rejects untrusted hosts',()=>{for(const url of ['https://youtube.com/watch?v=ZveLAvHwevs&t=2','https://youtu.be/ZveLAvHwevs?si=abc','https://www.youtube.com/embed/ZveLAvHwevs','https://m.youtube.com/shorts/ZveLAvHwevs'])assert.equal(videoId(url),'ZveLAvHwevs');for(const url of ['javascript:alert(1)','https://youtube.com.evil.test/watch?v=ZveLAvHwevs','https://evil.test/ZveLAvHwevs','https://youtube.com/watch?v=no','ZveLAvHwevs','https://youtube.com/playlist?list=123'])assert.equal(videoId(url),null);});
test('search filters titles and artists case insensitively, respecting categories',()=>{assert.ok(matches(songs[0],' BINI ','OPM'));assert.ok(matches(songs[0],'pantropiko','All songs'));assert.equal(matches(songs[0],'pantropiko','English'),false);assert.equal(matches(songs[0],'Adele','All songs'),false);});
test('queue reordering handles duplicates and boundaries without mutation',()=>{const a=['a','b','a'];assert.deepEqual(moveItem(a,1,-1),['b','a','a']);assert.deepEqual(a,['a','b','a']);assert.deepEqual(moveItem(a,0,-1),a);assert.deepEqual(moveItem(a,3,-1),a);assert.deepEqual(moveItem(a,1,1),['a','a','b']);});
test('time formatting handles non-finite and negative inputs',()=>{assert.equal(formatTime(125.5),'2:05');assert.equal(formatTime(-10),'0:00');assert.equal(formatTime(NaN),'0:00');});

