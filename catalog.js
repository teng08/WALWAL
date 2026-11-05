/* Videos remain hosted by their respective YouTube creators. */
export const songs = [
  {
    "id": "dOrmvYNzJNc",
    "title": "Pantropiko",
    "artist": "BINI",
    "category": "OPM",
    "mood": "Party starters",
    "color": "#efb5c5",
    "source": "Atomic Karaoke"
  },
  {
    "id": "-pXQTGMJ8IU",
    "title": "Love Story",
    "artist": "Taylor Swift",
    "category": "English",
    "mood": "Love songs",
    "color": "#e3ab89",
    "source": "Atomic Karaoke"
  },
  {
    "id": "dhWoHWRsQpE",
    "title": "Porque",
    "artist": "Maldita",
    "category": "OPM",
    "mood": "Hugot",
    "color": "#b4b0ee",
    "source": "Atomic Karaoke"
  },
  {
    "id": "E4nJcsxhCkg",
    "title": "Ikaw Ang Iibigin Ko",
    "artist": "Regine Velasquez",
    "category": "OPM",
    "mood": "Love songs",
    "color": "#b7c69c",
    "source": "Atomic Karaoke"
  },
  {
    "id": "N9rJxn7OpIg",
    "title": "Maybe This Time",
    "artist": "Sarah Geronimo",
    "category": "OPM",
    "mood": "Hugot",
    "color": "#94b8c9",
    "source": "Atomic Karaoke"
  },
  {
    "id": "Rd39nTWnNmI",
    "title": "Sabihin",
    "artist": "Zelle",
    "category": "OPM",
    "mood": "Hugot",
    "color": "#c4afbe",
    "source": "Atomic Karaoke"
  },
  {
    "id": "b9Z5KDDlQkE",
    "title": "Di Lang Ikaw",
    "artist": "Juris",
    "category": "OPM",
    "mood": "Hugot",
    "color": "#e3ab89",
    "source": "Atomic Karaoke"
  },
  {
    "id": "CJhy0Vv45gw",
    "title": "Mahal Pa Rin Kita",
    "artist": "Rockstar",
    "category": "OPM",
    "mood": "Hugot",
    "color": "#9ebec5",
    "source": "Atomic Karaoke"
  },
  {
    "id": "gbRId8ADKsA",
    "title": "On the Wings of Love",
    "artist": "Regine Velasquez",
    "category": "OPM",
    "mood": "Love songs",
    "color": "#b8c9bd",
    "source": "Atomic Karaoke"
  },
  {
    "id": "cdCu6l2ixek",
    "title": "Kiss Me, Kiss Me",
    "artist": "Sarah Geronimo",
    "category": "OPM",
    "mood": "Party starters",
    "color": "#efb5c5",
    "source": "Atomic Karaoke"
  },
  {
    "id": "I3_FaKKyKPg",
    "title": "You Belong With Me",
    "artist": "Taylor Swift",
    "category": "English",
    "mood": "Party starters",
    "color": "#caa887",
    "source": "Atomic Karaoke"
  },
  {
    "id": "fV0d0CLFj9Q",
    "title": "Salamat",
    "artist": "Yeng Constantino",
    "category": "OPM",
    "mood": "Party starters",
    "color": "#b7c69c",
    "source": "Atomic Karaoke"
  },
  {
    "id": "AQS6avY3HtI",
    "title": "Love Me Like You Do",
    "artist": "Ellie Goulding",
    "category": "English",
    "mood": "Love songs",
    "color": "#b4b0ee",
    "source": "Atomic Karaoke"
  }
];
export function videoId(input) {
 try {const u=new URL(input); if(!['https:','http:'].includes(u.protocol))return null;
 const host=u.hostname.toLowerCase(); let id;
 if(host==='youtu.be')id=u.pathname.split('/')[1];
 else if(['youtube.com','www.youtube.com','m.youtube.com','www.youtube-nocookie.com'].includes(host))id=u.pathname==='/watch'?u.searchParams.get('v'):(/^\/(embed|shorts|live)\//.test(u.pathname)?u.pathname.split('/')[2]:null);
 return /^[A-Za-z0-9_-]{11}$/.test(id||'')?id:null;
 }catch{return null;}
}
export function matches(song,query,category) {return (category==='All songs'||song.category===category)&&`${song.title} ${song.artist} ${song.mood}`.toLowerCase().includes(query.trim().toLowerCase());}
export function moveItem(items,index,direction) {const target=index+direction; if(index<0||index>=items.length||target<0||target>=items.length)return [...items]; const copy=[...items]; [copy[index],copy[target]]=[copy[target],copy[index]];return copy;}
export function formatTime(seconds) {const t=Math.max(0,Math.floor(Number.isFinite(Number(seconds))?Number(seconds):0)); return `${Math.floor(t/60)}:${String(t%60).padStart(2,'0')}`;}

