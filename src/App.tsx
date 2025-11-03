import MainLayout from '@/layouts/MainLayout'
import OwnerPage from '@/pages/OwnerPage'
import TranslatorManagementPage from '@/pages/TranslatorManagementPage'
import TranslatorPage from '@/pages/TranslatorPage'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<OwnerPage />} />
          <Route path="/translator" element={<TranslatorPage />} />
          <Route path="/translators/manage" element={<TranslatorManagementPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
