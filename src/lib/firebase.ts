/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ====================================================================
// SUPABASE BACKEND ADAPTER FOR D'FORIA KITCHEN
// ====================================================================
// To guarantee 100% backward compatibility and prevent broken imports,
// this file acts as a seamless bridge that re-exports all dbService actions
// and configuration from /src/lib/supabase.ts.
// ====================================================================

export { 
  dbService,
  addQuotaListener,
  setQuotaExceeded,
  isQuotaExceeded,
  type QuotaListener
} from './supabase.ts';
