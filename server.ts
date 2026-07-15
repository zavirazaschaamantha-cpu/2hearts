import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API Key Validation Helper
function isValidGeminiApiKey(key: string | undefined): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  if (
    trimmed === "" ||
    trimmed === "MY_GEMINI_API_KEY" ||
    trimmed === "your_api_key_here" ||
    trimmed === "MOCK_KEY" ||
    trimmed.includes("PLACEHOLDER") ||
    trimmed.includes("YOUR_")
  ) {
    return false;
  }
  return trimmed.startsWith("AIzaSy") || trimmed.length >= 30;
}

// Request Timeout Wrapper Helper (default 5 seconds)
async function runWithTimeout<T>(promise: Promise<T>, ms: number = 5000): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("Request timeout"));
    }, ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId!);
  }
}

// Lazy-initialize Gemini AI client safely
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: isValidGeminiApiKey(apiKey) ? apiKey : "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// -------------------------------------------------------------
// API Endpoints using Gemini AI (With Safe Fallback Data)
// -------------------------------------------------------------

// 1. Generate Deep Talk Prompts
app.post("/api/gemini/generate-deeptalk", async (req, res) => {
  const { category, tone } = req.body;
  const targetCategory = category || "Masa Depan";
  const targetTone = tone || "Hangat & Intim";

  const prompt = `Hasilkan 5 pertanyaan "Deep Talk" yang sangat mendalam, bermakna, dan romantis untuk pasangan kekasih yang sedang menjalin hubungan jarak jauh (LDR).
Kategori: ${targetCategory}
Tone: ${targetTone}

Pastikan pertanyaannya relevan dengan tantangan hubungan LDR, menumbuhkan rasa percaya, kerinduan yang sehat, dan keintiman emosional.
Gunakan Bahasa Indonesia yang santai, manis, penuh empati, dan menyentuh hati.`;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!isValidGeminiApiKey(apiKey)) {
      throw new Error("Invalid or Missing API Key");
    }

    const ai = getGeminiClient();
    const response = await runWithTimeout(
      ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            description: "Daftar kartu pertanyaan deep talk untuk pasangan LDR",
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING, description: "Pertanyaan utama yang mendalam" },
                followUp: { type: Type.STRING, description: "Pertanyaan lanjutan atau tips untuk mendalami obrolan" },
                category: { type: Type.STRING, description: "Nama kategori" },
              },
              required: ["question", "followUp", "category"]
            }
          }
        }
      }),
      15000
    );

    if (response.text) {
      const data = JSON.parse(response.text.trim());
      return res.json({ success: true, data });
    }
    throw new Error("No response text from Gemini");

  } catch (error: any) {
    console.error("Gemini Deep Talk Error:", error?.message || error || "Unknown error");
    // Safe High-Quality Fallbacks in Indonesian
    const fallbackData = {
      "Masa Depan": [
        {
          question: "Bagaimana bayanganmu tentang hari pertama kita akhirnya tinggal bersama dalam satu atap? Apa hal kecil pertama yang ingin kamu lakukan?",
          followUp: "Misalnya, apakah kita akan memasak bersama atau sekadar malas-malasan di sofa?",
          category: "Masa Depan"
        },
        {
          question: "Apa satu mimpi terbesar kita berdua yang paling ingin kamu wujudkan dalam 3 tahun ke depan?",
          followUp: "Bagaimana cara kita bisa saling mendukung dari jarak jauh untuk mencapai itu?",
          category: "Masa Depan"
        },
        {
          question: "Saat kita nanti sudah tidak LDR lagi, apa kebiasaan LDR kita yang menurutmu akan paling kamu rindukan?",
          followUp: "Mengapa kebiasaan kecil itu berkesan buatmu?",
          category: "Masa Depan"
        },
        {
          question: "Menurutmu, kualitas diri apa yang paling berkembang dari kita berdua selama menjalani hubungan jarak jauh ini?",
          followUp: "Bagaimana kualitas itu akan membantu hubungan kita di masa depan?",
          category: "Masa Depan"
        },
        {
          question: "Jika kita bisa membeli rumah impian kita besok, di kota mana itu dan bagaimana suasana pagi hari yang kamu inginkan?",
          followUp: "Ceritakan detailnya mulai dari warna cat sampai tanaman di halaman.",
          category: "Masa Depan"
        }
      ],
      "Kenangan": [
        {
          question: "Ingatkah kamu momen pertama kali kita merasa benar-benar 'klik' satu sama lain meskipun berjauhan?",
          followUp: "Apa kalimat atau tindakan dariku saat itu yang membuatmu yakin?",
          category: "Kenangan"
        },
        {
          question: "Jika kamu bisa memutar kembali waktu ke salah satu pertemuan fisik kita, hari keberapa yang paling ingin kamu jalani lagi?",
          followUp: "Detail kecil apa dari hari itu yang masih terekam jelas di ingatanmu?",
          category: "Kenangan"
        },
        {
          question: "Apa lagu atau aroma tertentu yang kalau kamu dengar atau cium langsung membuatmu teringat aku secara instan?",
          followUp: "Ada kenangan spesifik apa di balik lagu/aroma tersebut?",
          category: "Kenangan"
        },
        {
          question: "Apa hadiah kecil atau pesan teks dariku yang paling berharga bagi kamu dan masih sering kamu simpan atau baca ulang?",
          followUp: "Kenapa hal itu memiliki arti yang sangat mendalam untukmu?",
          category: "Kenangan"
        },
        {
          question: "Momen lucu apa saat kita bertemu atau video call yang selalu berhasil membuatmu tersenyum sendiri ketika mengingatnya?",
          followUp: "Ayo kita tertawakan momen itu bersama-sama lagi sekarang!",
          category: "Kenangan"
        }
      ],
      "Emosi & Rasa Nyaman": [
        {
          question: "Saat kamu sedang merasa lelah atau sedih karena pekerjaan atau keseharianmu, bagaimana cara terbaikku untuk menenangkanmu dari jauh?",
          followUp: "Apakah dengan mendengarkan ceritamu, mengirimkan makanan kesukaan, atau sekadar video call sunyi?",
          category: "Emosi & Rasa Nyaman"
        },
        {
          question: "Adakah ketakutan atau kecemasan kecil tentang hubungan kita yang belakangan ini sering muncul tapi belum sempat kamu ceritakan?",
          followUp: "Mari kita bicarakan sekarang secara terbuka, aku ada di sini sepenuhnya untuk mendengar.",
          category: "Emosi & Rasa Nyaman"
        },
        {
          question: "Apa hal romantis non-fisik dariku yang paling membuatmu merasa dicintai dan dihargai?",
          followUp: "Bagaimana perasaan itu memengaruhi harimu yang melelahkan?",
          category: "Emosi & Rasa Nyaman"
        },
        {
          question: "Bagaimana kamu mendefinisikan rasa 'aman' dan 'rumah' ketika kamu sedang berada jauh dariku?",
          followUp: "Apakah aku sudah berhasil memberikan rasa aman itu untukmu?",
          category: "Emosi & Rasa Nyaman"
        },
        {
          question: "Kapan terakhir kali kamu merasa sangat bangga memilikiku sebagai pasanganmu?",
          followUp: "Hal apa yang aku lakukan atau katakan saat itu?",
          category: "Emosi & Rasa Nyaman"
        }
      ],
      "Keintiman & Kejujuran": [
        {
          question: "Apa hal baru tentang diriku yang baru-baru ini kamu sadari, yang sebelumnya tidak kamu ketahui saat awal pacaran?",
          followUp: "Apakah itu kebiasaan aneh, cara bicara, atau sifat tertentu?",
          category: "Keintiman & Kejujuran"
        },
        {
          question: "Adakah kebiasaan kecilku yang kadang membuatmu sedikit kesal, tapi sebenarnya kamu anggap menggemaskan?",
          followUp: "Jujur saja, aku berjanji tidak akan marah!",
          category: "Keintiman & Kejujuran"
        },
        {
          question: "Bagian mana dari dirimu yang paling ingin kamu bagikan denganku, tetapi kamu masih merasa sedikit malu atau ragu?",
          followUp: "Aku siap menerimamu seutuhnya tanpa penghakiman sama sekali.",
          category: "Keintiman & Kejujuran"
        },
        {
          question: "Apa pujian dariku yang paling ingin sering kamu dengar akhir-akhir ini?",
          followUp: "Katakan padaku, biar aku bisa membisikkannya kepadamu setiap hari.",
          category: "Keintiman & Kejujuran"
        },
        {
          question: "Jika cinta kita adalah sebuah buku, bab apa yang sedang kita jalani saat ini menurut pandanganmu?",
          followUp: "Apa judul bab tersebut dan bagaimana petualangan selanjutnya?",
          category: "Keintiman & Kejujuran"
        }
      ]
    };

    const selectedCategory = fallbackData[targetCategory as keyof typeof fallbackData] || fallbackData["Emosi & Rasa Nyaman"];
    return res.json({ success: true, data: selectedCategory, isFallback: true });
  }
});

// 2. Generate Romantic LDR Trivia Quizzes
app.post("/api/gemini/generate-quiz", async (req, res) => {
  const { topic } = req.body;
  const quizTopic = topic || "Kebiasaan & Kesukaan Pasangan";

  const prompt = `Hasilkan 5 pertanyaan trivia interaktif, seru, dan romantis tentang pasangan untuk game kuis "Seberapa Kenal Kamu dengan Pasanganmu?".
Tema Kuis: ${quizTopic}

Tujuannya adalah agar pasangan saling menebak jawaban satu sama lain untuk menguji keintiman dan ingatan mereka.
Pertanyaan harus kreatif, santai, lucu, dan tidak kaku. Gunakan bahasa Indonesia kekinian yang ramah dan hangat.
Berikan 4 pilihan jawaban yang lucu dan relevan, sertakan indeks jawaban yang benar (0-3), dan penjelasan manis atau tips romantis tentang pertanyaan tersebut.`;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!isValidGeminiApiKey(apiKey)) {
      throw new Error("Invalid or Missing API Key");
    }

    const ai = getGeminiClient();
    const response = await runWithTimeout(
      ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            description: "Daftar pertanyaan kuis cinta trivia",
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING, description: "Pertanyaan kuis" },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "4 pilihan jawaban (opsi)"
                },
                answerIndex: { type: Type.INTEGER, description: "Indeks jawaban yang benar (0-3)" },
                explanation: { type: Type.STRING, description: "Catatan manis atau tips romantis" }
              },
              required: ["question", "options", "answerIndex", "explanation"]
            }
          }
        }
      }),
      15000
    );

    if (response.text) {
      const data = JSON.parse(response.text.trim());
      return res.json({ success: true, data });
    }
    throw new Error("No response text from Gemini");

  } catch (error: any) {
    console.error("Gemini Quiz Error:", error?.message || error || "Unknown error");
    // Custom romantic fallbacks
    const fallbackQuizzes = {
      "Kebiasaan & Kesukaan": [
        {
          question: "Jika pasanganmu sedang bad mood di sore hari saat LDR, apa cara paling instan untuk mengembalikan senyumnya?",
          options: [
            "Mengirimkan boba atau camilan manis lewat ojek online",
            "Mengirimkan spam foto selfie konyol berturut-turut",
            "Meneleponnya dan menyanyikan lagu favoritnya dengan suara sumbang",
            "Membiarkannya istirahat sambil mengirimkan chat penyemangat"
          ],
          answerIndex: 0,
          explanation: "Makanan manis atau perhatian kecil di kala lelah adalah booster suasana hati terbaik ketika terpisah jarak!"
        },
        {
          question: "Apa kebiasaan unik pasanganmu saat kalian sedang melakukan video call di malam hari?",
          options: [
            "Ketiduran sambil tetap menyalakan kamera",
            "Mencoret-coret layar seolah mencolek hidungmu",
            "Mengunyah camilan tanpa henti sambil bercerita",
            "Melakukan deep talk sampai tidak sadar sudah jam 2 pagi"
          ],
          answerIndex: 0,
          explanation: "Ketiduran saat video call adalah tanda bahwa pasanganmu merasa sangat nyaman dan aman bersamamu."
        },
        {
          question: "Genre film/serial apa yang paling sering kalian tonton bersama lewat fitur 'watch party'?",
          options: [
            "Horor biar bisa pura-pura takut dan minta ditemani lewat telepon",
            "Drama Korea romantis biar bisa baper berjamaah",
            "Action/Sci-fi yang seru buat bahan diskusi panjang",
            "Komedi santai biar bisa tertawa lepas bareng di penghujung hari"
          ],
          answerIndex: 1,
          explanation: "Menonton bersama memperkecil jarak fisik karena kalian merasakan emosi yang sama di waktu yang sama."
        },
        {
          question: "Apa bahasa cinta (Love Language) utama yang paling dibutuhkan pasanganmu saat LDR?",
          options: [
            "Words of Affirmation (Kalimat pujian & penenang)",
            "Quality Time (Video call berkualitas tanpa gangguan)",
            "Receiving Gifts (Paket kejutan tak terduga)",
            "Acts of Service (Dukungan emosional & pemecahan masalah)"
          ],
          answerIndex: 0,
          explanation: "Memahami Love Language pasangan saat LDR sangat penting karena kita tidak bisa memberikan sentuhan fisik langsung."
        },
        {
          question: "Kapan biasanya pasanganmu merasa paling merindukanmu dalam seharian penuh?",
          options: [
            "Saat bangun tidur di pagi hari melihat HP kosong",
            "Saat jam makan siang melihat meja makan sendirian",
            "Saat di perjalanan pulang melihat banyak pasangan lain bersama",
            "Sebelum memejamkan mata di malam hari yang sunyi"
          ],
          answerIndex: 3,
          explanation: "Malam hari adalah waktu di mana memori dan kerinduan menjadi paling hangat. Jangan lupa ucapkan 'goodnight' ya!"
        }
      ],
      "Kenangan Indah": [
        {
          question: "Di mana lokasi atau momen kencan virtual pertama kalian yang paling berkesan?",
          options: [
            "Menonton konser online bersama di kamar masing-masing",
            "Makan malam romantis via video call dengan lilin virtual",
            "Main game online bareng sambil teriak-teriak seru",
            "Keliling kota masing-masing sambil video call menceritakan jalanan"
          ],
          answerIndex: 1,
          explanation: "Kencan virtual kreatif membuktikan bahwa cinta tidak terbatas oleh jarak fisik!"
        },
        {
          question: "Apa kesan pertama pasanganmu saat pertama kali kalian memulai hubungan jarak jauh (LDR) ini?",
          options: [
            "Takut dan cemas apakah akan berhasil",
            "Sangat optimis karena yakin dengan komitmen bersama",
            "Sedih tapi bersemangat menabung untuk masa depan",
            "Campur aduk tapi berjanji untuk saling terbuka"
          ],
          answerIndex: 3,
          explanation: "Keterbukaan emosi di awal LDR adalah pondasi terkuat yang membuat hubungan kalian bertahan sejauh ini."
        }
      ]
    };

    const selectedQuiz = fallbackQuizzes[topic as keyof typeof fallbackQuizzes] || fallbackQuizzes["Kebiasaan & Kesukaan"];
    return res.json({ success: true, data: selectedQuiz, isFallback: true });
  }
});

// 3. Generate Custom Daily Challenges / Date Ideas using Gemini
app.post("/api/gemini/generate-date-idea", async (req, res) => {
  const { vibes, timeDifference } = req.body;
  const currentVibes = vibes || "Santai & Lucu";
  const diffText = timeDifference ? `dengan perbedaan waktu ${timeDifference}` : "di zona waktu yang mirip";

  const prompt = `Berikan 3 ide kencan virtual (virtual date ideas) yang sangat kreatif, unik, murah meriah, dan menyenangkan untuk pasangan LDR.
Vibes kencan: ${currentVibes}
Kondisi waktu: ${diffText}

Setiap kencan harus memiliki instruksi persiapan yang jelas, perkiraan durasi, dan cara seru untuk berinteraksi meskipun terpisah jarak.
Gunakan Bahasa Indonesia yang kasual, hangat, penuh semangat, dan interaktif.`;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!isValidGeminiApiKey(apiKey)) {
      throw new Error("Invalid or Missing API Key");
    }

    const ai = getGeminiClient();
    const response = await runWithTimeout(
      ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            description: "Daftar ide kencan virtual romantis LDR",
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Judul kegiatan kencan" },
                activity: { type: Type.STRING, description: "Penjelasan lengkap aktivitas seru" },
                preparation: { type: Type.STRING, description: "Apa saja yang perlu disiapkan masing-masing" },
                duration: { type: Type.STRING, description: "Estimasi durasi (misalnya: 1 Jam)" },
                cost: { type: Type.STRING, description: "Perkiraan biaya (misal: Gratis / Murah)" }
              },
              required: ["title", "activity", "preparation", "duration", "cost"]
            }
          }
        }
      }),
      15000
    );

    if (response.text) {
      const data = JSON.parse(response.text.trim());
      return res.json({ success: true, data });
    }
    throw new Error("No response text from Gemini");

  } catch (error: any) {
    console.error("Gemini Date Idea Error:", error?.message || error || "Unknown error");
    const fallbackDates = [
      {
        title: "Kencan 'Mukbang' Misteri",
        activity: "Kalian saling memesankan makanan (GoFood/GrabFood/ShopeeFood) secara rahasia untuk pasangan ke alamatnya masing-masing. Batasi budget (misal Rp 50.000). Saat makanan sampai, kalian video call dan melakukan 'unboxing' bareng-bareng lalu menyantapnya bersama sambil menebak kenapa kalian memilihkan menu tersebut.",
        preparation: "Saling tahu alamat satu sama lain, sepakati jam makan malam, dan pesan makanan secara rahasia 30 menit sebelum acara.",
        duration: "1 - 1.5 Jam",
        cost: "Sesuai Budget Makanan"
      },
      {
        title: "Kilas Balik Google Maps 'Virtual Tour'",
        activity: "Buka Google Maps dan gunakan fitur 'Street View' untuk menjelajahi kota masa kecil masing-masing, sekolah lama, atau tempat favorit yang ingin kalian kunjungi bersama kelak. Share screen lewat Zoom/Discord/Google Meet dan bergantian menjadi 'tour guide' pribadi pasanganmu.",
        preparation: "Laptop atau handphone yang mendukung video call dengan fitur share screen.",
        duration: "1 Jam",
        cost: "Gratis (Hanya Kuota)"
      },
      {
        title: "Kuis Kreatif Menggambar Menggunakan Canvas Bersama",
        activity: "Kalian berdua menggunakan whiteboard online gratis (seperti Aggie.io, Scribbl, atau Miro) untuk menggambar potret wajah pasangan satu sama lain hanya dalam waktu 3 menit tanpa melihat kertas/layar (blind contour drawing) atau bermain tebak gambar gila-gilaan.",
        preparation: "Link whiteboard online yang bisa diakses berdua, siapkan jiwa humoris karena hasilnya pasti sangat lucu!",
        duration: "45 Menit",
        cost: "Gratis"
      }
    ];
    return res.json({ success: true, data: fallbackDates, isFallback: true });
  }
});

// -------------------------------------------------------------
// Vite and Static Assets Handler
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[DuaHati Server] running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
