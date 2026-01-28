// Content filtering utility for objectionable content
// This implements a method for filtering objectionable material as required by Apple Guideline 1.2

const PROFANITY_WORDS = [
  // Common profanity (censored for documentation)
  'f***', 's***', 'a**', 'b****', 'd***', 'h***', 'c***', 'p***', 'n***',
  // Variations
  'f*ck', 'sh*t', 'a**hole', 'b*tch', 'd*ck', 'h*ll', 'c*ck', 'p*ssy', 'n*gga',
  // Common offensive terms
  'retard', 'retarded', 'idiot', 'stupid', 'moron',
  // Hate speech indicators
  'kill yourself', 'kys', 'die', 'hate you',
  // Spam indicators
  'click here', 'free money', 'bit.ly', 'tinyurl', 'earn money fast',
];

const SUSPICIOUS_PATTERNS = [
  /(http|https|www\.)/gi, // URLs
  /\d{10,}/g, // Long number sequences (phone numbers)
  /[A-Z]{5,}/g, // All caps words
  /(.)\1{4,}/g, // Repeated characters (aaaaa)
];

export function filterContent(content: string): { 
  filtered: string; 
  isBlocked: boolean; 
  reason?: string 
} {
  const lowerContent = content.toLowerCase();
  
  // Check for profanity
  for (const word of PROFANITY_WORDS) {
    const regex = new RegExp(`\\b${word.replace(/\*/g, '\\w')}\\b`, 'gi');
    if (regex.test(lowerContent)) {
      return {
        filtered: content,
        isBlocked: true,
        reason: 'Contains inappropriate language'
      };
    }
  }
  
  // Check for suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(content)) {
      // Allow URLs if they're part of normal conversation (not spam)
      if (pattern.source.includes('http')) {
        // Check if it looks like spam
        const urlPattern = /(http|https|www\.)/gi;
        const matches = content.match(urlPattern);
        if (matches && matches.length > 1) {
          return {
            filtered: content,
            isBlocked: true,
            reason: 'Contains suspicious links'
          };
        }
      } else {
        return {
          filtered: content,
          isBlocked: true,
          reason: 'Contains suspicious content'
        };
      }
    }
  }
  
  // Replace profanity with asterisks (soft filter)
  let filtered = content;
  for (const word of PROFANITY_WORDS) {
    const regex = new RegExp(`\\b${word.replace(/\*/g, '\\w')}\\b`, 'gi');
    filtered = filtered.replace(regex, (match) => '*'.repeat(match.length));
  }
  
  return {
    filtered,
    isBlocked: false
  };
}

export function shouldBlockMessage(content: string): boolean {
  const result = filterContent(content);
  return result.isBlocked;
}

