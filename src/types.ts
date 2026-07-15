export interface CoupleConfig {
  partnerAName: string;
  partnerBName: string;
  partnerALocation: string;
  partnerBLocation: string;
  partnerATimezone: string; // e.g. "Asia/Jakarta"
  partnerBTimezone: string; // e.g. "Asia/Tokyo"
  nextMeetupDate: string; // YYYY-MM-DD
}

export interface PartnerMood {
  partnerA: {
    status: string; // "Rindu", "Sibuk", "Santai", "Butuh Pelukan"
    updatedAt: string;
  };
  partnerB: {
    status: string;
    updatedAt: string;
  };
}

export interface TriviaQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface DeepTalkCard {
  question: string;
  followUp: string;
  category: string;
}

export interface VirtualDate {
  title: string;
  activity: string;
  preparation: string;
  duration: string;
  cost: string;
}

export interface LoveCapsuleMessage {
  id: string;
  sender: string;
  recipient: string;
  message: string;
  unlockDate: string; // ISO date string
  isUnlocked: boolean;
  theme: 'classic' | 'sunset' | 'starry' | 'letter';
}

export interface StickyNote {
  id: string;
  author: string;
  content: string;
  color: 'yellow' | 'pink' | 'blue' | 'green';
  createdAt: string;
}
