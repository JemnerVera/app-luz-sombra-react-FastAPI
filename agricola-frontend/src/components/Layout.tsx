import React from 'react';
import { TabType } from '../types';
import { UI_CONFIG } from '../utils/constants';
import { Upload, Eye, BarChart3 } from 'lucide-react';

interface LayoutProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentTab, onTabChange, children }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'upload':
        return <Upload className="h-5 w-5" />;
      case 'eye':
        return <Eye className="h-5 w-5" />;
      case 'bar-chart-3':
        return <BarChart3 className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">
            🌱 Agricola Luz-Sombra
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Análisis de imágenes agrícolas con ML
          </p>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <div className="space-y-2">
            {UI_CONFIG.tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id as TabType)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg font-medium text-sm transition-colors ${
                  currentTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {getIcon(tab.icon)}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            © 2024 Agricola Luz-Sombra v2.0.0
            <br />
            Powered by FastAPI + React
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
