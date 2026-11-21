/**
 * LIFE OS Python AI & Analytics Engine Client
 * Communicates with the FastAPI local intelligence service (http://localhost:8000).
 * Implements graceful offline fallback when the Python engine is not running.
 */

const API_BASE = 'http://localhost:8000/api';

export interface AIEngineStatus {
  isAvailable: boolean;
  version?: string;
  databaseConnected?: boolean;
}

export interface ParsedNLPTask {
  title: string;
  due_date: string | null;
  due_time: string | null;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  is_scheduled_today: boolean;
  tags: string[];
  confidence: number;
}

export interface DeepAnalyticsResult {
  composite_index: number;
  domain_scores: Array<{
    domain: string;
    score: number;
    status: 'optimal' | 'warning' | 'critical';
    detail: string;
  }>;
  financial_velocity: Record<string, any>;
  attendance_risk: Array<Record<string, any>>;
  habit_adherence: Array<Record<string, any>>;
  strategic_interventions: Array<{
    type: string;
    domain: string;
    title: string;
    action: string;
  }>;
}

class AIEngineClient {
  private cachedStatus: AIEngineStatus | null = null;
  private lastCheckTime = 0;

  /**
   * Probes the Python FastAPI service health endpoint.
   */
  async checkHealth(): Promise<AIEngineStatus> {
    const now = Date.now();
    // Cache check for 5 seconds to avoid flooding
    if (this.cachedStatus && now - this.lastCheckTime < 5000) {
      return this.cachedStatus;
    }

    try {
      const res = await fetch(`${API_BASE}/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(1500),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      this.cachedStatus = {
        isAvailable: true,
        version: data.engine_version,
        databaseConnected: data.database_connected,
      };
    } catch {
      this.cachedStatus = {
        isAvailable: false,
      };
    }

    this.lastCheckTime = now;
    return this.cachedStatus;
  }

  /**
   * Parses human text into a structured task with date, time, priority, and category.
   * Example: "Submit DevOps assignment tomorrow at 5pm #academics !critical"
   */
  async parseTaskNLP(text: string): Promise<ParsedNLPTask | null> {
    try {
      const res = await fetch(`${API_BASE}/nlp/parse-task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        signal: AbortSignal.timeout(3000),
      });

      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  /**
   * Fetches advanced cross-domain analytical synthesis from SQLite database views.
   */
  async getDeepAnalytics(): Promise<DeepAnalyticsResult | null> {
    try {
      const res = await fetch(`${API_BASE}/analytics/deep-dive`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(4000),
      });

      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  /**
   * Synchronizes IndexedDB client data into SQLite relational storage.
   */
  async syncToSQLite(payload: {
    tasks?: any[];
    goals?: any[];
    habits?: any[];
    habit_entries?: any[];
    transactions?: any[];
    subjects?: any[];
  }): Promise<{ success: boolean; synced_counts?: Record<string, number> }> {
    try {
      const res = await fetch(`${API_BASE}/database/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) return { success: false };
      const data = await res.json();
      return { success: true, synced_counts: data.synced_counts };
    } catch {
      return { success: false };
    }
  }
}

export const aiEngine = new AIEngineClient();
