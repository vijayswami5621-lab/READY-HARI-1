/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { recordPageVisit } from '../lib/analytics';

export default function VisitorTracker() {
  const location = useLocation();

  useEffect(() => {
    // Record page visit on route changes
    recordPageVisit(location.pathname);
  }, [location.pathname]);

  return null;
}
