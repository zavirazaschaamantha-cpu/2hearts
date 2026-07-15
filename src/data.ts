import { TriviaQuestion, DeepTalkCard, LoveCapsuleMessage, StickyNote } from "./types";

export const DEFAULT_MOODS = [
  { status: "Rindu Berat", icon: "💖", label: "Rindu Berat", desc: "Kangen setengah mati, butuh disapa!", color: "bg-rose-100 text-rose-700 border-rose-200" },
  { status: "Sibuk Kerja/Kuliah", icon: "📚", label: "Sibuk", desc: "Lagi fokus belajar/kerja, slow respon.", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { status: "Butuh Pelukan", icon: "🥺", label: "Butuh Pelukan", desc: "Hari ini agak lelah, kirimi pelukan hangat.", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { status: "Siap Video Call!", icon: "🎥", label: "Siap VC", desc: "Kamera aktif, ayo bertatap muka!", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { status: "Sedang Manja", icon: "🐱", label: "Manja", desc: "Butuh dibujuk dan dikirimi meme lucu.", color: "bg-purple-100 text-purple-700 border-purple-200" },
];

export const LDR_QUOTES = [
  "\"Jarak hanyalah angka. Komitmen dan rasa percaya kita adalah yang melipatgandakan arti kebersamaan.\"",
  "\"Ketika malam tiba, ingatlah bahwa kita menatap bulan yang sama, di bawah langit yang sama.\"",
  "\"Menunggumu adalah hal terindah yang pernah kurasakan, karena setiap detik penantian membawaku lebih dekat kepadamu.\"",
  "\"Jarak mengajarkan kita bagaimana menghargai setiap detik suara, setiap helai pesan, dan setiap senyuman saat bertemu.\"",
  "\"Meskipun tangan kita tidak saling menggenggam hari ini, hati kita berpelukan lebih erat dari siapapun.\"",
  "\"Terima kasih sudah bertahan sejauh ini bersamaku. Jarak ini sementara, tapi kita berdua selamanya.\""
];

export const DEFAULT_TRIVIA: TriviaQuestion[] = [
  {
    question: "Kapan terakhir kali kita makan makanan yang sama secara bersamaan lewat kencan video call?",
    options: [
      "Baru kemarin sore",
      "Minggu lalu pas malam Minggu",
      "Waduh, sudah lama sekali tidak kencan kuliner!",
      "Lupa, tapi ayo agendakan malam ini!"
    ],
    answerIndex: 1,
    explanation: "Makan bersama lewat video call adalah cara paling sederhana untuk menyamakan suasana hati."
  },
  {
    question: "Apa emoji yang paling sering dikirim pasanganmu saat dia sedang merayumu?",
    options: [
      "Emoji cium dengan hati (😘)",
      "Emoji pelukan hangat (🤗)",
      "Emoji mata hati berkilau (😍)",
      "Emoji kucing manja melas (🥺)"
    ],
    answerIndex: 0,
    explanation: "Setiap pasangan punya signature emoji unik yang melambangkan keintiman digital mereka."
  },
  {
    question: "Jika diberi kesempatan bertemu langsung besok pagi secara ajaib selama 1 jam, apa hal pertama yang kalian lakukan?",
    options: [
      "Pelukan erat tanpa melepaskannya selama 10 menit",
      "Langsung pergi ke tempat makan favorit berdua",
      "Saling menatap langsung dan menangis terharu",
      "Mengambil banyak foto dan video kenangan bersama"
    ],
    answerIndex: 0,
    explanation: "Pelukan fisik melepaskan hormon oksitosin yang meredakan stres akibat terpisah jarak!"
  }
];

export const DEFAULT_DEEPTALK: DeepTalkCard[] = [
  {
    question: "Apa hal kecil yang aku lakukan dari jauh yang paling berhasil membuat hatimu hangat seharian?",
    followUp: "Apakah pesan 'semangat ya' di pagi hari, atau telepon tiba-tiba saat istirahat?",
    category: "Rasa Nyaman"
  },
  {
    question: "Jika nanti tiba hari di mana kita akhirnya tinggal bersama selamanya, apa kebiasaan pagi hari yang ingin kamu rutinkan berdua?",
    followUp: "Misalnya membuatkan kopi hangat, berolahraga bareng, atau berebut kamar mandi?",
    category: "Masa Depan"
  },
  {
    question: "Bagaimana cara terbaik kita mengelola rindu atau cemburu ketika salah satu dari kita sedang sangat sibuk?",
    followUp: "Adakah kesepakatan kecil baru yang ingin kita buat agar kita berdua merasa tenang?",
    category: "Komitmen"
  }
];

export const ROULETTE_CHALLENGES = [
  { text: "Kirim pesan suara (Voice Note) bernyanyi 15 detik lagu romantis!", color: "from-rose-400 to-rose-500" },
  { text: "Kirim selfie terlucu dengan pose double chin sekarang juga!", color: "from-amber-400 to-amber-500" },
  { text: "Pesan satu boba/camilan kejutan untuk pasangan lewat ojek online!", color: "from-purple-400 to-purple-500" },
  { text: "Tulis 3 hal yang paling kamu sukai dari sifat pasanganmu di chat!", color: "from-emerald-400 to-emerald-500" },
  { text: "Lakukan video call 5 menit dan pandangi mata pasangan tanpa bicara!", color: "from-indigo-400 to-indigo-500" },
  { text: "Kirim foto tangkapan layar (screenshot) wallpaper HP kamu saat ini!", color: "from-sky-400 to-sky-500" },
  { text: "Beri 1 pujian tulus tentang penampilan atau kebaikan pasangan hari ini!", color: "from-pink-400 to-pink-500" },
  { text: "Kirim screenshot lagu Spotify/YouTube yang paling mewakili perasaanmu padanya!", color: "from-teal-400 to-teal-500" }
];

export const DEFAULT_STICKY_NOTES: StickyNote[] = [
  {
    id: "note-1",
    author: "Kamu",
    content: "Jangan lupa minum air putih hari ini ya sayang! Cuaca di luar sedang panas sekali ☀️",
    color: "pink",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: "note-2",
    author: "Pasangan",
    content: "Semangat buat ujian/kerjanya hari ini! I believe in you, always. Peluk dari jauh! 🤗💖",
    color: "yellow",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  }
];

export const DEFAULT_CAPSULES: LoveCapsuleMessage[] = [
  {
    id: "capsule-1",
    sender: "Pasangan",
    recipient: "Kamu",
    message: "Hai sayang! Kalau kamu membuka surat ini, tandanya kamu sudah berhasil melewati minggu yang berat ini. Aku bangga sekali sama kamu. Tetap semangat, sebentar lagi kita ketemu ya! Aku sayang kamu lahir batin.",
    unlockDate: new Date(Date.now() - 1000).toISOString(), // already unlocked
    isUnlocked: true,
    theme: "sunset"
  },
  {
    id: "capsule-2",
    sender: "Kamu",
    recipient: "Pasangan",
    message: "Surat rahasia ini baru boleh kamu buka pas malam Minggu besok! Aku mau bilang makasih karena kamu selalu jadi sandaran ternyaman buat aku meskipun kita dipisahkan jarak ribuan kilometer.",
    unlockDate: new Date(Date.now() + 3600000 * 48).toISOString(), // locked for 2 days
    isUnlocked: false,
    theme: "starry"
  }
];
