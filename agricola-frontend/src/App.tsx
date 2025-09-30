import React, { useState, useEffect } from 'react';
import { TabType } from './types';
import Layout from './components/Layout';
import ImageUploadForm from './components/ImageUploadForm';
import ModelTestForm from './components/ModelTestForm';
import HistoryTable from './components/HistoryTable';
import Notification from './components/Notification';

function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('analizar');
  const [hasUnsavedData, setHasUnsavedData] = useState(false);
  const [pendingTab, setPendingTab] = useState<TabType | null>(null);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    show: false,
    message: '',
    type: 'info'
  });

  // Load EXIF library on app start
  useEffect(() => {
    // Load EXIF.js dynamically
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/exif-js@2.3.0/exif.js';
    script.onload = () => console.log('✅ EXIF.js loaded');
    script.onerror = () => console.error('❌ Failed to load EXIF.js');
    document.head.appendChild(script);
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setNotification({
      show: true,
      message,
      type
    });
    
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  const [showModal, setShowModal] = useState(false);

  const handleTabChange = (tab: TabType) => {
    if (hasUnsavedData && currentTab === 'analizar') {
      setPendingTab(tab);
      setShowModal(true);
    } else {
      setCurrentTab(tab);
      setHasUnsavedData(false);
    }
  };

  const confirmTabChange = () => {
    if (pendingTab) {
      setCurrentTab(pendingTab);
      setHasUnsavedData(false);
      setPendingTab(null);
    }
    setShowModal(false);
  };

  const cancelTabChange = () => {
    setPendingTab(null);
    setShowModal(false);
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case 'analizar':
        return (
          <ImageUploadForm 
            onUnsavedDataChange={setHasUnsavedData}
            onNotification={showNotification}
          />
        );
      case 'probar':
        return (
          <ModelTestForm 
            onNotification={showNotification}
          />
        );
      case 'historial':
        return (
          <HistoryTable 
            onNotification={showNotification}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Layout
        currentTab={currentTab}
        onTabChange={handleTabChange}
      >
        {renderTabContent()}
      </Layout>
      
      <Notification
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
      />

      {/* Modal de confirmación */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirmar cambio de pestaña
            </h3>
            <p className="text-gray-600 mb-6">
              Tienes información sin guardar en la pestaña "Analizar Imágenes". 
              Si cambias de pestaña, se perderán los datos ingresados.
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={cancelTabChange}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                onClick={confirmTabChange}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;