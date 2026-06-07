export interface AppSettings {
  appName: string;
  menuTitle1: string;
  menuTitle2: string;
  menuTitle3: string;
  menuTitle4: string;
  instapayLink: string;
  walletNumber: string;
  bannerImageUrl: string;
  whatsappNumber: string;
}

export interface Prompt {
  id: string;
  categoryId: string; // '1', '2', '3', '4'
  title: string;
  promptText: string;
  imageUrls: string[];
  isPremium: boolean;
  isMarquee: boolean;
  createdAt: number;
}

export interface CustomUser {
  id: string;
  username: string;
  password?: string;
  isPremium: boolean;
  isAdmin: boolean;
  createdAt: number;
}

export interface Notification {
  id: string;
  userId: string;
  username: string;
  action: string;
  createdAt: number;
}
