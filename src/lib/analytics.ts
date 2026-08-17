/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc 
} from 'firebase/firestore';
import { db as firebaseDb } from './firebase';

export interface DailyVisitorLog {
  date: string; // YYYY-MM-DD
  pageViews: number;
  uniqueVisitorsCount: number;
  newVisitorsCount: number;
  returningVisitorsCount: number;
  visitorsMap: {
    [visitorId: string]: {
      isNew: boolean;
      lastSeen: string;
      pageViews: number;
    };
  };
}

// 1. Get or initialize anonymous visitor ID
export function getVisitorInfo(): { visitorId: string; isNew: boolean } {
  try {
    let visitorId = localStorage.getItem('hari_visitor_id');
    if (!visitorId) {
      visitorId = `vis_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('hari_visitor_id', visitorId);
      return { visitorId, isNew: true };
    }
    return { visitorId, isNew: false };
  } catch (err) {
    const fallbackId = `vis_${Date.now()}`;
    return { visitorId: fallbackId, isNew: true };
  }
}

// Helper: Format date YYYY-MM-DD
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Record page visit
let lastLoggedPath = '';
let lastLoggedTime = 0;

export async function recordPageVisit(path: string = '/') {
  const now = Date.now();
  // Prevent duplicate rapid logging within 2 seconds for same path
  if (path === lastLoggedPath && (now - lastLoggedTime) < 2000) {
    return;
  }
  lastLoggedPath = path;
  lastLoggedTime = now;

  const { visitorId, isNew } = getVisitorInfo();
  const todayStr = getTodayDateString();
  const nowIso = new Date().toISOString();

  // Local storage cache tracking
  try {
    let cachedDaily: { [date: string]: DailyVisitorLog } = {};
    const stored = localStorage.getItem('hp_analytics_daily');
    if (stored) {
      cachedDaily = JSON.parse(stored);
    }

    if (!cachedDaily[todayStr]) {
      cachedDaily[todayStr] = {
        date: todayStr,
        pageViews: 0,
        uniqueVisitorsCount: 0,
        newVisitorsCount: 0,
        returningVisitorsCount: 0,
        visitorsMap: {}
      };
    }

    const todayLog = cachedDaily[todayStr];
    todayLog.pageViews += 1;

    if (!todayLog.visitorsMap[visitorId]) {
      todayLog.visitorsMap[visitorId] = {
        isNew,
        lastSeen: nowIso,
        pageViews: 1
      };
      todayLog.uniqueVisitorsCount += 1;
      if (isNew) {
        todayLog.newVisitorsCount += 1;
      } else {
        todayLog.returningVisitorsCount += 1;
      }
    } else {
      todayLog.visitorsMap[visitorId].pageViews += 1;
      todayLog.visitorsMap[visitorId].lastSeen = nowIso;
    }

    cachedDaily[todayStr] = todayLog;
    localStorage.setItem('hp_analytics_daily', JSON.stringify(cachedDaily));
  } catch (e) {
    console.warn('Error saving local visitor log:', e);
  }

  // Firestore background sync
  try {
    const docRef = doc(firebaseDb, 'analytics_daily', todayStr);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      const newLog: DailyVisitorLog = {
        date: todayStr,
        pageViews: 1,
        uniqueVisitorsCount: 1,
        newVisitorsCount: isNew ? 1 : 0,
        returningVisitorsCount: isNew ? 0 : 1,
        visitorsMap: {
          [visitorId]: {
            isNew,
            lastSeen: nowIso,
            pageViews: 1
          }
        }
      };
      await setDoc(docRef, newLog);
    } else {
      const existing = docSnap.data() as DailyVisitorLog;
      const vMap = existing.visitorsMap || {};
      const isAlreadyLoggedToday = !!vMap[visitorId];

      const updatedVMap = {
        ...vMap,
        [visitorId]: {
          isNew: isAlreadyLoggedToday ? vMap[visitorId].isNew : isNew,
          lastSeen: nowIso,
          pageViews: (vMap[visitorId]?.pageViews || 0) + 1
        }
      };

      const newUniqueCount = Object.keys(updatedVMap).length;
      let newCount = existing.newVisitorsCount || 0;
      let returningCount = existing.returningVisitorsCount || 0;

      if (!isAlreadyLoggedToday) {
        if (isNew) newCount += 1;
        else returningCount += 1;
      }

      await updateDoc(docRef, {
        pageViews: (existing.pageViews || 0) + 1,
        uniqueVisitorsCount: newUniqueCount,
        newVisitorsCount: newCount,
        returningVisitorsCount: returningCount,
        visitorsMap: updatedVMap
      });
    }
  } catch (err) {
    console.warn('Firestore visitor log background sync:', err);
  }
}

