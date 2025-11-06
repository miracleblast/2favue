export const platformIcons = {
  'twitter': 'streamline-logos:x-twitter-logo',
  'x': 'streamline-logos:x-twitter-logo',
  'facebook': 'logos:facebook',
  'instagram': 'streamline-logos:instagram-logo-2-solid',
  'linkedin': 'logos:linkedin-icon',
  'reddit': 'logos:reddit-icon',
  'telegram': 'logos:telegram',
  'tiktok': 'logos:tiktok-icon',
  'discord': 'logos:discord-icon',
  'google': 'logos:google-icon',
  'github': 'logos:github-icon',
  'gitlab': 'logos:gitlab',
  'microsoft': 'logos:microsoft-icon',
  'apple': 'logos:apple',
  'whatsapp': 'logos:whatsapp-icon',
  'amazon': 'logos:aws',
  'npm': 'logos:npm-icon',
  'docker': 'logos:docker-icon',
  'kubernetes': 'logos:kubernetes',
  'aws': 'logos:aws',
  'azure': 'logos:microsoft-azure',
  'gcp': 'logos:google-cloud',
  'digitalocean': 'logos:digital-ocean',
  'slack': 'logos:slack-icon',
  'teams': 'logos:microsoft-teams',
  'zoom': 'logos:zoom',
  'paypal': 'logos:paypal',
  'stripe': 'logos:stripe',
  'coinbase': 'logos:coinbase',
  'default': 'mdi:account-key'
}

export const getPlatformIcon = (platform: string): string => {
  return platformIcons[platform?.toLowerCase() as keyof typeof platformIcons] || platformIcons.default
}

export const getPlatformColor = (platform: string): string => {
  const colors: Record<string, string> = {
    'twitter': '#1DA1F2',
    'facebook': '#1877F2',
    'instagram': '#E4405F',
    'linkedin': '#0A66C2',
    'reddit': '#FF4500',
    'google': '#4285F4',
    'github': '#181717',
    'microsoft': '#5E5E5E',
    'apple': '#000000',
    'aws': '#FF9900'
  }
  return colors[platform?.toLowerCase()] || 'currentColor'
}
