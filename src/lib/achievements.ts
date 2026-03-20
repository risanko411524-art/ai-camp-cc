import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "achievements.json");

export type Reaction = {
  emoji: string;
  name: string;
  createdAt: string;
};

export type Comment = {
  id: string;
  name: string;
  text: string;
  createdAt: string;
};

export type Achievement = {
  id: string;
  name: string;
  job: string;
  revenueBefore: number;
  revenueAfter: number;
  strategy: string;
  message: string;
  reactions: Reaction[];
  comments: Comment[];
  createdAt: string;
};

type AchievementsData = {
  achievements: Achievement[];
};

function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readData(): AchievementsData {
  ensureDataDir();
  if (!fs.existsSync(DATA_FILE)) {
    return { achievements: [] };
  }
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw);
}

function writeData(data: AchievementsData) {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export function getAllAchievements(): Achievement[] {
  return readData().achievements.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function addAchievement(input: {
  name: string;
  job: string;
  revenueBefore: number;
  revenueAfter: number;
  strategy: string;
  message: string;
}): Achievement {
  const data = readData();
  const achievement: Achievement = {
    id: `ach_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    ...input,
    reactions: [],
    comments: [],
    createdAt: new Date().toISOString(),
  };
  data.achievements.push(achievement);
  writeData(data);
  return achievement;
}

export function addReaction(achievementId: string, emoji: string, name: string): Achievement | null {
  const data = readData();
  const ach = data.achievements.find((a) => a.id === achievementId);
  if (!ach) return null;
  // Remove existing reaction from same user with same emoji, or add new one
  const existing = ach.reactions.findIndex((r) => r.name === name && r.emoji === emoji);
  if (existing >= 0) {
    ach.reactions.splice(existing, 1);
  } else {
    ach.reactions.push({ emoji, name, createdAt: new Date().toISOString() });
  }
  writeData(data);
  return ach;
}

export function addComment(achievementId: string, name: string, text: string): Achievement | null {
  const data = readData();
  const ach = data.achievements.find((a) => a.id === achievementId);
  if (!ach) return null;
  ach.comments.push({
    id: `cmt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    text,
    createdAt: new Date().toISOString(),
  });
  writeData(data);
  return ach;
}
