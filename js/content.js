const CONTENT_URL = './data/content.json';
const QURAN_URL = './data/quran.json';
const HADITH_DIR = './data/hadith/';
const EMPTY = Object.freeze({ version:'unavailable', surahs:[], athkar:[], hadith:[] });
const HADITH_BOOKS = Object.freeze(['bukhari','muslim','abudawud','tirmidhi','nasai','ibnmajah','malik','ahmad','darimi']);
let contentPromise; let quranPromise; const hadithPromises = new Map();
const list=v=>Array.isArray(v)?v:[];
function normalizeItem(item,type){if(!item||typeof item!=='object')return null;return {...item,id:String(item.id??'').trim(),type,title:String(item.title??item.name??'').trim(),text:String(item.text??item.arabic??'').trim(),source:String(item.source??'').trim(),reference:String(item.reference??'').trim(),review_status:String(item.review_status??'draft').trim()};}
function normalizeContent(raw){const x=raw&&typeof raw==='object'?raw:{};return{version:String(x.version??x.updatedAt??'unknown'),schema_version:String(x.schema_version??x.schemaVersion??'1'),surahs:list(x.surahs).map(v=>normalizeItem(v,'quran')).filter(Boolean),athkar:list(x.athkar).map(v=>normalizeItem(v,'dhikr')).filter(Boolean),hadith:list(x.hadith).map(v=>normalizeItem(v,'hadith')).filter(Boolean)};}
export async function getContent(){if(!contentPromise)contentPromise=fetch(CONTENT_URL,{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error(`content:${r.status}`);return r.json()}).then(normalizeContent).catch(()=>EMPTY);return contentPromise;}
function normalizeQuran(raw){
  const source=raw&&typeof raw==='object'?raw:{};
  const chapters=list(source.chapters||source.surahs);
  const globalVerses=list(source.verses||source.ayahs);
  const byChapter=new Map();
  for(const a of globalVerses){const n=Number(a.chapter??a.surah??a.surah_number??a.chapter_number);if(!n)continue;const row={number:Number(a.number??a.verse_number??a.ayah??a.verse??0),text:String(a.text??a.text_ar??a.ar??'').trim(),global_id:a.global_id??a.id};if(row.number&&row.text){if(!byChapter.has(n))byChapter.set(n,[]);byChapter.get(n).push(row);}}
  const surahs=chapters.map((c,i)=>{const number=Number(c.number??c.id??c.chapter_number??i+1);let verses=list(c.verses||c.ayahs).map((a,j)=>({number:Number(a.number??a.verse_number??a.ayah??a.verse??j+1),text:String(a.text??a.text_ar??a.ar??'').trim(),global_id:a.global_id??a.id})).filter(a=>a.text);if(!verses.length)verses=byChapter.get(number)||[];verses.sort((a,b)=>a.number-b.number);return{number,name:String(c.name_arabic??c.name??c.name_ar??c.chapter?.name??'').trim(),type:String(c.revelation_place??c.type??c.revelation??'').trim(),ayahs:verses,verses:verses.length};}).filter(s=>s.number>=1&&s.number<=114);
  return {surahs};
}
export async function getQuran(surahNumber=null){
  if(!quranPromise)quranPromise=fetch(QURAN_URL,{cache:'force-cache'}).then(r=>{if(!r.ok)throw Error(`quran:${r.status}`);return r.json()}).then(normalizeQuran).catch(async()=>{const c=await getContent();return{surahs:c.surahs.map(s=>({number:Number(s.id),name:s.title,type:s.type,verses:s.verses,ayahs:[]}))}});
  const all=await quranPromise; if(!surahNumber)return all; const found=all.surahs.find(s=>s.number===Number(surahNumber)); if(found?.ayahs?.length)return found;
  try{const r=await fetch(`./data/quran/s${String(surahNumber).padStart(3,'0')}.json`,{cache:'force-cache'});if(r.ok){const raw=await r.json();const normalized=normalizeQuran({chapters:[raw.chapter||raw],verses:raw.verses||raw.ayahs||[]});return normalized.surahs[0]||found;}}catch{}
  return found;
}
export async function getHadithBook(book){if(!HADITH_BOOKS.includes(book))throw Error('unknown-book');if(!hadithPromises.has(book)){hadithPromises.set(book,fetch(`${HADITH_DIR}${book}.json`,{cache:'force-cache'}).then(r=>{if(!r.ok)throw Error(`hadith:${book}:${r.status}`);return r.json()}).then(raw=>{const rows=list(raw.hadiths||raw.data||raw);return rows.map(h=>({id:h.id??h.number??h.idInBook,arabic:String(h.arabic??h.arab??h.text??'').trim(),text:String(h.text??h.arabic??h.arab??'').trim(),reference:h.reference??raw.metadata?.arabic?.title??raw.metadata?.title??book,grade:h.grade??h.grading??''})).filter(h=>h.arabic||h.text)}));}return hadithPromises.get(book);}
export async function searchHadithBooks(query,books=HADITH_BOOKS,limit=100){const q=String(query??'').trim().toLocaleLowerCase('ar');if(!q)return[];const out=[];for(const b of books){try{const rows=await getHadithBook(b);for(const h of rows){if(`${h.arabic} ${h.text} ${h.reference}`.toLocaleLowerCase('ar').includes(q)){out.push({...h,book:b});if(out.length>=limit)return out;}}}catch{}}return out;}
export function getContentStats(content,quran){return{surahs:quran?.surahs?.length||content?.surahs?.length||0,ayahs:quran?.surahs?.reduce((n,s)=>n+(s.ayahs?.length||0),0)||0,athkar:content?.athkar?.length||0,hadith:content?.hadith?.length||0};}
export function contentStats(content){return{quran:content?.surahs?.length??0,athkar:content?.athkar?.length??0,hadith:content?.hadith?.length??0};}
export { HADITH_BOOKS };