export const CANCELLATION_URLS: Record<string, string> = {
  'netflix': 'https://www.netflix.com/youraccount',
  'spotify': 'https://www.spotify.com/account/overview/',
  'apple_tv': 'https://support.apple.com/en-us/HT202039',
  'apple_music': 'https://support.apple.com/en-us/HT202039',
  'icloud': 'https://support.apple.com/en-us/HT202039',
  'youtube_premium': 'https://www.youtube.com/paid_memberships',
  'disney_plus': 'https://www.disneyplus.com/account/subscription',
  'hulu': 'https://secure.hulu.com/account',
  'hbo_max': 'https://help.hbomax.com/us/Answer/Detail/000001191',
  'prime_video': 'https://www.amazon.com/gp/video/settings',
  'amazon_prime': 'https://www.amazon.com/mc/pipeline/cancellation',
  'playstation_plus': 'https://www.playstation.com/acct/management',
  'xbox_game_pass': 'https://account.microsoft.com/services',
  'adobe': 'https://account.adobe.com/plans',
  'canva': 'https://www.canva.com/settings/billing',
  'dropbox': 'https://www.dropbox.com/account/plan',
  'google_one': 'https://one.google.com/settings',
  'chatgpt': 'https://chat.openai.com/#settings/Subscription',
  'midjourney': 'https://www.midjourney.com/account/',
  'notion': 'https://www.notion.so/settings/billing',
  'slack': 'https://my.slack.com/admin/billing',
  'zoom': 'https://zoom.us/billing',
  'duolingo': 'https://www.duolingo.com/settings/plus',
};

export const getCancellationUrl = (serviceName: string): string | null => {
  const normalized = serviceName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  
  // Direct match
  if (CANCELLATION_URLS[normalized]) return CANCELLATION_URLS[normalized];

  // Fuzzy match
  const key = Object.keys(CANCELLATION_URLS).find(k => normalized.includes(k));
  if (key) return CANCELLATION_URLS[key];

  // Generic store links if no specific URL found
  return null;
};
