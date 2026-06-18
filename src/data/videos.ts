export type CategoryId =
  | 'metal'
  | 'english'
  | 'baila'
  | 'sinhala-modern'
  | 'sinhala-classics'
  | 'hindi'

export type Video = {
  id: string      // TikTok video ID — embed: https://www.tiktok.com/embed/v2/{id}
  title: string
  artist: string
  category: CategoryId
}

export const CATEGORY_META: Record<CategoryId, { label: string; accent: string }> = {
  metal:              { label: 'Metal',                  accent: '#dc2626' },
  english:            { label: 'English Pop & Rock',     accent: '#7c3aed' },
  baila:              { label: 'Sri Lankan Baila',        accent: '#d97706' },
  'sinhala-modern':   { label: 'Sri Lankan Modern Pop',  accent: '#0891b2' },
  'sinhala-classics': { label: 'Sinhala Classics',       accent: '#6366f1' },
  hindi:              { label: 'Hindi Covers',            accent: '#ec4899' },
}

export const VIDEOS: Video[] = [
  // ── Metal ─────────────────────────────────────────────────────────────────
  { id: '7570747666116758804', title: 'Papercut',               artist: 'Linkin Park',               category: 'metal' },
  { id: '7530734782783819015', title: 'Memento Mori',           artist: 'Lamb of God',               category: 'metal' },
  { id: '7495022981023010056', title: 'Honor Thy Father',       artist: 'Dream Theater',             category: 'metal' },
  { id: '7492820190992928007', title: "What I've Done",         artist: 'Linkin Park',               category: 'metal' },
  { id: '7467217921454984456', title: "Tears Don't Fall",       artist: 'Bullet for My Valentine',  category: 'metal' },
  { id: '7457033409697746184', title: 'Battle Born',            artist: 'Five Finger Death Punch',  category: 'metal' },
  { id: '7427505980553940242', title: 'Natural Born Killer',    artist: 'Avenged Sevenfold',         category: 'metal' },
  { id: '7352113402946309377', title: 'Almost Easy',            artist: 'Avenged Sevenfold',         category: 'metal' },
  { id: '7321013057331744002', title: 'AOV',                    artist: 'Slipknot',                  category: 'metal' },
  { id: '7318983626996092161', title: 'Nightmare',              artist: 'Avenged Sevenfold',         category: 'metal' },
  { id: '7249021011117477127', title: 'Laid to Rest',           artist: 'Lamb of God',               category: 'metal' },

  // ── English Pop & Rock ────────────────────────────────────────────────────
  { id: '7566276917624622356', title: 'Hello',                  artist: 'Adele',                     category: 'english' },
  { id: '7563683113688206613', title: 'Animals',                artist: 'Maroon 5',                  category: 'english' },
  { id: '7473153264314305799', title: 'Just Like Johnny',       artist: 'Redferrin',                 category: 'english' },
  { id: '7462006805720206610', title: 'Die With A Smile',       artist: 'Lady Gaga & Bruno Mars',   category: 'english' },
  { id: '7418568909575441682', title: 'Perfect',                artist: 'One Direction',             category: 'english' },
  { id: '7339413890888912129', title: 'Umbrella',               artist: 'Rihanna',                   category: 'english' },
  { id: '7284244951443983618', title: 'Sultans of Swing',       artist: 'Dire Straits',              category: 'english' },

  // ── Sri Lankan Baila ──────────────────────────────────────────────────────
  { id: '7530312411660799240', title: 'Mango Kalu Nande',       artist: 'Annesley Malewana',        category: 'baila' },
  { id: '7456256986657623304', title: 'Piti Kotapan None',      artist: 'The Gypsies',               category: 'baila' },
  { id: '7356486220127505680', title: 'Senda Walawan',          artist: 'Clarence Wijewardena',     category: 'baila' },
  { id: '7324163920107703554', title: 'Daasa Piyagath Kala',    artist: 'Clarence Wijewardena',     category: 'baila' },

  // ── Sri Lankan Modern Pop ─────────────────────────────────────────────────
  { id: '7640548423103499540', title: 'Heena Maka',             artist: 'Harshadewa ft. Ravi Jay',  category: 'sinhala-modern' },
  { id: '7562987077927849236', title: 'Himi Nathi Adareka',     artist: 'Raveen Tharuka',           category: 'sinhala-modern' },
  { id: '7489799108522265864', title: 'Prathihari',             artist: 'Supun Perera',              category: 'sinhala-modern' },
  { id: '7422117948220853511', title: 'Aley',                   artist: 'Daddy',                     category: 'sinhala-modern' },
  { id: '7420635758098173192', title: 'Mandaram Eli',           artist: 'Bhashi Devanga',            category: 'sinhala-modern' },
  { id: '7416930152011074824', title: 'Chakithaya',             artist: 'Nemesis',                   category: 'sinhala-modern' },
  { id: '7413014284608883975', title: 'Sakura',                 artist: 'Charitha Attalage',         category: 'sinhala-modern' },
  { id: '7357531636470238465', title: 'Sellakkaraya',           artist: 'Lil Neo ft. Kaizer Kaiz',  category: 'sinhala-modern' },
  { id: '7336774384595537154', title: 'Ninda Noyana Handawe',   artist: 'Ranindu',                   category: 'sinhala-modern' },
  { id: '7334168325632593154', title: 'Hangannada Aadare',      artist: 'Iman Fernando',             category: 'sinhala-modern' },
  { id: '7331192113184492801', title: 'Api Kauruda',            artist: 'Wayo',                      category: 'sinhala-modern' },
  { id: '7326010874571836673', title: 'Mathakayan Obe',         artist: 'Chamara Weerasinghe',      category: 'sinhala-modern' },
  { id: '7247547115390422279', title: 'Mal Athura',             artist: 'Pyramids',                  category: 'sinhala-modern' },

  // ── Sinhala Classics ──────────────────────────────────────────────────────
  { id: '7459204803227340050', title: 'Hadannepa Den',          artist: 'Milton Mallawarachchi',    category: 'sinhala-classics' },
  { id: '7455321099774004487', title: 'Asurin Mideela',         artist: 'Priya Sooriyasena',        category: 'sinhala-classics' },
  { id: '7362753605725687041', title: 'Atha Ran Wiman',         artist: 'Priya Suriyasena',         category: 'sinhala-classics' },
  { id: '7329384625401269505', title: 'Anganawo',               artist: 'Rookantha Goonatilake',    category: 'sinhala-classics' },

  // ── Hindi Covers ──────────────────────────────────────────────────────────
  { id: '7561355663553596690', title: 'Dhun',                   artist: 'Mithoon & Arijit Singh',   category: 'hindi' },
  { id: '7543673931681631495', title: 'Saiyaara',               artist: 'Faheem Abdullah',           category: 'hindi' },
  { id: '7497088560072346898', title: 'Aadat',                  artist: 'Atif Aslam',                category: 'hindi' },
  { id: '7323626836116770050', title: 'Sanam Re',               artist: 'Arijit Singh',              category: 'hindi' },
]
