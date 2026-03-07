/**
 * Central Schema Export
 * Main entry point for all schema utilities
 */

// Type exports
export * from './types';

// Schema generators
export * from './software-app';
export * from './organization';
export * from './medical-service';
export * from './faq';
export * from './agents';
export * from './how-to';
export * from './webpage';
export * from './speakable';

// Utility functions
import { getBondhuAppSchema } from './software-app';
import { getBondhuOrganizationSchema } from './organization';
import { getMentalHealthServiceSchema } from './medical-service';
import { getBondhuFAQSchema } from './faq';
import { getMultiAgentSystemSchema } from './agents';
import { getBondhuWebSiteSchema } from './webpage';
import { getSpeakableSchema, getDetailedSpeakableSchema } from './speakable';

/**
 * Get all global schemas that should be on every page
 */
export function getGlobalSchemas() {
  return [
    getBondhuAppSchema(),
    getBondhuOrganizationSchema(),
    getBondhuWebSiteSchema(),
  ];
}

/**
 * Get homepage-specific schemas (includes GEO-optimized speakable schema)
 */
export function getHomepageSchemas() {
  return [
    ...getGlobalSchemas(),
    getMentalHealthServiceSchema(),
    getBondhuFAQSchema(),
    getMultiAgentSystemSchema(),
    getDetailedSpeakableSchema(), // GEO: Speakable schema for voice assistants and AI
  ];
}

/**
 * Utility to convert schema object to JSON-LD script tag props
 */
export function schemaToJsonLd(schema: any) {
  return {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: { __html: JSON.stringify(schema) },
  };
}

/**
 * Generate multiple schema tags
 */
export function generateSchemaScripts(schemas: any[]) {
  return schemas.map((schema, index) => ({
    key: `schema-${index}`,
    ...schemaToJsonLd(schema),
  }));
}
