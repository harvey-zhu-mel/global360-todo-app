import { InjectionToken } from '@angular/core';

/**
 * Base URL of the TODO API, e.g. "http://localhost:5000".
 * Provided in app.config.ts so production builds can swap it via configuration.
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');
