import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ScrollToTop from '@/components/ScrollToTop';
import PageNotFound from '@/lib/PageNotFound';
import Architecture from '@/pages/Architecture';
import ControlRoom from '@/pages/ControlRoom';
import MobileLayout from '@/components/mobile/MobileLayout';
import Home from '@/pages/mobile/Home';
import Device from '@/pages/mobile/Device';
import Safety from '@/pages/mobile/Safety';
import Profile from '@/pages/mobile/Profile';
import Settings from '@/pages/mobile/Settings';
import Dashboard from '@/pages/control/Dashboard';
import Incidents from '@/pages/control/Incidents';
import Tasks from '@/pages/control/Tasks';
import DataPage from '@/pages/control/DataPage';
import AuditLogs from '@/pages/control/AuditLogs';
import Stats from '@/pages/control/Stats';
import Notifications from '@/pages/control/Notifications';
import CrSettings from '@/pages/control/CrSettings';

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Navigate to="/app" replace />} />
        <Route path="/login" element={<Navigate to="/app" replace />} />
        <Route path="/register" element={<Navigate to="/app" replace />} />
        <Route path="/forgot-password" element={<Navigate to="/app" replace />} />
        <Route path="/reset-password" element={<Navigate to="/app" replace />} />
        <Route path="/oauth/consent" element={<Navigate to="/app" replace />} />
        <Route path="/architecture" element={<Architecture />} />

        <Route path="/app" element={<MobileLayout />}>
          <Route index element={<Home />} />
          <Route path="device" element={<Device />} />
          <Route path="safety" element={<Safety />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="/control" element={<ControlRoom />}>
          <Route index element={<Dashboard />} />
          <Route path="incidents" element={<Incidents />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="data" element={<DataPage />} />
          <Route path="audit" element={<AuditLogs />} />
          <Route path="stats" element={<Stats />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<CrSettings />} />
        </Route>

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
}
