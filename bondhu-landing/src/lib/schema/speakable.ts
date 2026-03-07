/**
 * Speakable Schema for Voice Assistants and AI
 * 
 * This schema helps voice assistants (Google Assistant, Alexa) and AI systems
 * identify which parts of the page are most suitable for text-to-speech and AI extraction.
 * 
 * @see https://schema.org/SpeakableSpecification
 */

// Constants
const BASE_URL = 'https://www.bondhu.tech';
const ORGANIZATION_NAME = 'Bondhu';

export interface SpeakableSection {
  name: string;
  cssSelector: string;
}

// Define the sections that are suitable for text-to-speech
const SPEAKABLE_SECTIONS: SpeakableSection[] = [
  { name: "Hero Introduction", cssSelector: "[data-ai-summary='true']" },
  { name: "Key Facts", cssSelector: "[data-ai-facts='true']" },
  { name: "FAQ Answers", cssSelector: "[data-ai-faq='true']" },
  { name: "How-To Steps", cssSelector: "[data-ai-howto='true']" },
  { name: "Statistics", cssSelector: "[data-ai-statistics='true']" },
  { name: "Features List", cssSelector: "[data-ai-features='true']" },
  { name: "Summary", cssSelector: "[data-ai-conclusion='true']" },
  { name: "AI Readable Content", cssSelector: ".ai-readable" },
];

/**
 * Generate the Speakable schema for a webpage
 */
export function getSpeakableSchema(pageUrl: string = BASE_URL) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": `${ORGANIZATION_NAME} - AI Mental Health Companion`,
    "url": pageUrl,
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": SPEAKABLE_SECTIONS.map(s => s.cssSelector),
    },
    "dateModified": new Date().toISOString(),
    "inLanguage": "en-IN",
  };
}

/**
 * Generate a complete Speakable schema with section metadata
 */
export function getDetailedSpeakableSchema(pageUrl: string = BASE_URL) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": `${ORGANIZATION_NAME} - AI Mental Health Companion for Gen Z India`,
    "url": pageUrl,
    "description": "Bondhu is an AI-powered mental health companion designed for Gen Z in India. It uses personality-based AI adaptation through the OCEAN Big 5 model.",
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": SPEAKABLE_SECTIONS.map(s => s.cssSelector),
    },
    "mainEntity": {
      "@type": "SoftwareApplication",
      "name": "Bondhu",
      "applicationCategory": "HealthApplication",
      "operatingSystem": "Web, iOS, Android",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "INR",
        "description": "Free beta access"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "150",
        "bestRating": "5",
        "worstRating": "1"
      }
    },
    "publisher": {
      "@type": "Organization",
      "name": ORGANIZATION_NAME,
      "url": BASE_URL,
      "logo": {
        "@type": "ImageObject",
        "url": `${BASE_URL}/logo.png`
      }
    },
    "datePublished": "2025-10-10",
    "dateModified": new Date().toISOString(),
    "inLanguage": ["en-IN", "hi-IN", "bn-IN"],
  };
}

/**
 * Generate AI-specific metadata hints
 * These help AI systems like Perplexity, ChatGPT, and Gemini understand the content
 */
export function getAIMetadata() {
  return {
    aiContentDeclaration: "human-written, factually-accurate, mental-health-focused",
    citationSource: BASE_URL,
    contentLanguage: "en-IN",
    lastUpdated: new Date().toISOString(),
    contentType: "mental-health-application-info",
    primaryAudience: "Gen Z India (ages 16-25)",
    keyTopics: [
      "AI mental health companion",
      "personality-based AI chatbot",
      "Gen Z mental health India",
      "OCEAN Big 5 personality test",
      "proactive mental health support",
      "end-to-end encrypted therapy chat"
    ],
    factualClaims: [
      { 
        claim: "43% of young Indians report feeling lonely", 
        source: "National Mental Health Survey 2015-16",
        sourceUrl: "https://www.mohfw.gov.in/sites/default/files/National%20Mental%20Health%20Survey%2C%202015-16%20-%20Prevalence%2C%20Pattern%20%26%20Outcomes_0.pdf"
      },
      { 
        claim: "24.8% of students have social anxiety", 
        source: "NIMHANS Study 2024",
        sourceUrl: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11572450/"
      },
      { 
        claim: "13.5% mental health disorder prevalence in urban metros", 
        source: "National Mental Health Survey 2015-16",
        sourceUrl: "https://www.mohfw.gov.in/sites/default/files/National%20Mental%20Health%20Survey%2C%202015-16%20-%20Prevalence%2C%20Pattern%20%26%20Outcomes_0.pdf"
      }
    ]
  };
}

export default getSpeakableSchema;
