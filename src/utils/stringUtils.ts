/**
 * String Utility Functions
 * 
 * Reusable string manipulation functions
 */

/**
 * Capitalize each word in a string
 * 
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalizeWords(str: string | undefined): string {
  if (!str) return "";
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Add target="_blank" to all links in HTML string
 * 
 * @param html - HTML string containing links
 * @returns HTML string with target="_blank" added to links
 */
export function addTargetBlankToLinks(html: string | undefined): string {
  if (!html) return "";
  return html.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ');
}

/**
 * Extract all links from HTML string
 * 
 * @param html - HTML string containing links
 * @returns Array of link objects with href and text
 */
export interface ExtractedLink {
  href: string;
  text: string;
  isMainRecipe?: boolean; // True if this is the main recipe source link
}

export function extractLinksFromHTML(html: string | undefined): ExtractedLink[] {
  if (!html) return [];
  
  const links: ExtractedLink[] = [];
  const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi;
  let match;
  
  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    const text = match[2].trim();
    
    // Skip empty links
    if (href && text) {
      links.push({
        href: href.startsWith('http') ? href : `https://${href}`,
        text: text,
      });
    }
  }
  
  return links;
}

/**
 * Extract the main recipe source link from HTML
 * Usually the first link that's not a similar recipe link
 * The main recipe link typically appears before "similar recipes" text
 * 
 * @param html - HTML string containing links
 * @param recipeTitle - Recipe title to help identify main link
 * @returns Main recipe source link or null
 */
/**
 * Check if a link text looks like a recipe title
 * Recipe titles are typically long, contain food-related words, and don't contain domain indicators
 */
function isRecipeTitle(linkText: string, href: string): boolean {
  const lowerText = linkText.toLowerCase();
  const lowerHref = href.toLowerCase();
  
  // Recipe title indicators:
  // 1. Long text (>30 chars) with food-related words
  // 2. Contains common recipe title patterns
  // 3. No domain indicators in text or href
  
  const foodWords = [
    'fried', 'rice', 'quinoa', 'chicken', 'breast', 'pulao', 'vegetable',
    'brown rice', 'cauliflower', 'stir fried', 'fried rice'
  ];
  
  const hasMultipleFoodWords = foodWords.filter(word => lowerText.includes(word)).length >= 2;
  
  // If it's a long text with multiple food words, it's likely a recipe title
  if (linkText.length > 30 && hasMultipleFoodWords) {
    return true;
  }
  
  // Specific recipe title patterns
  const recipePatterns = [
    /fried.*rice/i,
    /chicken.*breast/i,
    /brown rice.*vegetable/i,
    /vegetable pulao/i,
    /stir fried.*quinoa/i,
    /cauliflower.*brown rice/i,
  ];
  
  if (recipePatterns.some(pattern => pattern.test(linkText))) {
    return true;
  }
  
  // If it's very long (>50 chars) and doesn't have domain indicators, likely a recipe title
  if (linkText.length > 50 && !lowerHref.includes('.com') && !lowerHref.includes('.org') && 
      !lowerHref.includes('.blog') && !lowerHref.includes('.net')) {
    return true;
  }
  
  return false;
}

export function extractMainRecipeLink(
  html: string | undefined,
  _recipeTitle?: string
): ExtractedLink | null {
  if (!html) return null;
  
  const links = extractLinksFromHTML(html);
  if (links.length === 0) return null;
  
  const lowerHtml = html.toLowerCase();
  
  // Find the index where "similar recipes" text appears
  const similarRecipeIndex = Math.min(
    lowerHtml.indexOf('similar recipe') > -1 ? lowerHtml.indexOf('similar recipe') : Infinity,
    lowerHtml.indexOf('take a look at') > -1 ? lowerHtml.indexOf('take a look at') : Infinity,
    lowerHtml.indexOf('if you like') > -1 ? lowerHtml.indexOf('if you like') : Infinity,
    lowerHtml.indexOf('users who liked') > -1 ? lowerHtml.indexOf('users who liked') : Infinity
  );
  
  // Find links that appear BEFORE the "similar recipes" text
  const mainLinks = links.filter(link => {
    const linkIndex = html.toLowerCase().indexOf(`href="${link.href.toLowerCase()}"`);
    return linkIndex < similarRecipeIndex && linkIndex > -1;
  });
  
  if (mainLinks.length === 0) return null;
  
  // Strategy 1: Look for links near source phrases (highest priority)
  // These phrases indicate the actual recipe source
  const sourcePhrases = [
    { phrase: 'brought to you by', maxDistance: 150 },
    { phrase: 'it is brought to you by', maxDistance: 150 },
    { phrase: 'recipe from', maxDistance: 100 },
    { phrase: 'this recipe from', maxDistance: 100 },
    { phrase: 'from', maxDistance: 80 },
    { phrase: 'source', maxDistance: 100 },
  ];
  
  for (const { phrase, maxDistance } of sourcePhrases) {
    const phraseIndex = lowerHtml.indexOf(phrase);
    if (phraseIndex > -1) {
      // Find the first link after this phrase (within reasonable distance)
      const nearbyLink = mainLinks.find(link => {
        const linkIndex = html.toLowerCase().indexOf(`href="${link.href.toLowerCase()}"`);
        return linkIndex > phraseIndex && linkIndex < phraseIndex + maxDistance;
      });
      
      if (nearbyLink && !isRecipeTitle(nearbyLink.text, nearbyLink.href)) {
        return nearbyLink;
      }
    }
  }
  
  // Strategy 2: Filter out ALL recipe title links first
  // Only consider links that are clearly NOT recipe titles
  const nonRecipeLinks = mainLinks.filter(link => !isRecipeTitle(link.text, link.href));
  
  if (nonRecipeLinks.length > 0) {
    // Among non-recipe links, prioritize domain links
    const domainLink = nonRecipeLinks.find(link => {
      const href = link.href.toLowerCase();
      return href.includes('.com') || href.includes('.org') || 
             href.includes('.blog') || href.includes('.net') || 
             href.includes('.io') || href.includes('.co.uk');
    });
    
    if (domainLink) return domainLink;
    
    // Return first non-recipe link
    return nonRecipeLinks[0];
  }
  
  // Strategy 3: If all links look like recipe titles, try to find domain links anyway
  // Sometimes recipe titles are linked to domains, but we want the domain, not the title
  const domainLinks = mainLinks.filter(link => {
    const href = link.href.toLowerCase();
    return (href.includes('.com') || href.includes('.org') || 
            href.includes('.blog') || href.includes('.net') || 
            href.includes('.io') || href.includes('.co.uk')) &&
           link.text.length < 60; // Domain names are usually shorter
  });
  
  if (domainLinks.length > 0) {
    return domainLinks[0];
  }
  
  // Strategy 4: If we still can't find a good link, return null
  // It's better to show nothing than to show the wrong recipe
  return null;
}

/**
 * Extract similar recipe links from HTML
 * These usually appear after phrases like "similar recipes" or "take a look at"
 * 
 * @param html - HTML string containing links
 * @returns Array of similar recipe links
 */
export function extractSimilarRecipeLinks(html: string | undefined): ExtractedLink[] {
  if (!html) return [];
  
  const links = extractLinksFromHTML(html);
  if (links.length === 0) return [];
  
  const lowerHtml = html.toLowerCase();
  
  // Find the index where "similar recipes" text appears
  const similarRecipeIndex = Math.min(
    lowerHtml.indexOf('similar recipe') > -1 ? lowerHtml.indexOf('similar recipe') : Infinity,
    lowerHtml.indexOf('take a look at') > -1 ? lowerHtml.indexOf('take a look at') : Infinity,
    lowerHtml.indexOf('if you like') > -1 ? lowerHtml.indexOf('if you like') : Infinity
  );
  
  // If we find "similar recipe" text, return links after that
  if (similarRecipeIndex < Infinity) {
    return links.filter(link => {
      const linkIndex = html.toLowerCase().indexOf(`href="${link.href.toLowerCase()}"`);
      return linkIndex > similarRecipeIndex && linkIndex > -1;
    });
  }
  
  // If we can't determine, return all links except the first one (which is likely the main recipe)
  return links.slice(1);
}

/**
 * Remove similar recipes text and links from HTML summary
 * Since we display similar recipes separately, we should remove them from the summary text
 * 
 * @param html - HTML string containing summary
 * @returns HTML string with similar recipes text removed
 */
export function removeSimilarRecipesFromSummary(html: string | undefined): string {
  if (!html) return "";
  
  let cleanedHtml = html;
  
  // Find the index where "similar recipes" text appears
  const lowerHtml = cleanedHtml.toLowerCase();
  const similarRecipeIndex = Math.min(
    lowerHtml.indexOf('similar recipe') > -1 ? lowerHtml.indexOf('similar recipe') : Infinity,
    lowerHtml.indexOf('take a look at') > -1 ? lowerHtml.indexOf('take a look at') : Infinity,
    lowerHtml.indexOf('if you like') > -1 ? lowerHtml.indexOf('if you like') : Infinity
  );
  
  if (similarRecipeIndex < Infinity) {
    // Find the position after the last link tag in the similar recipes section
    const afterMatch = cleanedHtml.substring(similarRecipeIndex);
    const lastLinkIndex = afterMatch.lastIndexOf('</a>');
    
    if (lastLinkIndex > -1) {
      // Remove from "similar recipes" text to after the last link
      cleanedHtml = cleanedHtml.substring(0, similarRecipeIndex) + 
                   cleanedHtml.substring(similarRecipeIndex + lastLinkIndex + 4);
    } else {
      // No links found, try to find the end of the sentence
      const sentenceEnd = cleanedHtml.indexOf('.', similarRecipeIndex);
      if (sentenceEnd > -1) {
        cleanedHtml = cleanedHtml.substring(0, similarRecipeIndex) + 
                     cleanedHtml.substring(sentenceEnd + 1);
      } else {
        // Remove from match to end
        cleanedHtml = cleanedHtml.substring(0, similarRecipeIndex);
      }
    }
  }
  
  return cleanedHtml.trim();
}

