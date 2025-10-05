"use client";

import { useState } from "react";
import {
  BarChart3,
  Database,
  Settings,
  Menu,
  X,
  Home,
  AlertTriangle,
  TrendingUp,
  Search,
  Zap,
  Trash2,
  Twitter,
  Instagram,
  Facebook,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "data", label: "Data Monitoring", icon: Database },
    { id: "analytics", label: "Analitik", icon: BarChart3 },
    { id: "search", label: "Vector Search", icon: Search },
    { id: "urgent", label: "Item Mendesak", icon: AlertTriangle },
    { id: "trends", label: "Tren & Isu", icon: TrendingUp },
    { id: "embeddings", label: "Embeddings", icon: Zap },
    { id: "deduplication", label: "Deduplication", icon: Trash2 },
    { id: "twitter", label: "Twitter/X", icon: Twitter },
    { id: "instagram", label: "Instagram", icon: Instagram },
    { id: "facebook", label: "Facebook", icon: Facebook },
    { id: "settings", label: "Pengaturan", icon: Settings },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md bg-white shadow-md border border-gray-200"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-200
        transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0
        transition-transform duration-300 ease-in-out
      `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ST</span>
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-bold text-gray-900">
                  Sapa Trenggalek
                </h1>
                <p className="text-xs text-gray-500">Sistem Monitoring</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors
                    ${
                      isActive
                        ? "bg-primary-50 text-primary-700 border-r-2 border-primary-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  <Icon
                    className={`h-5 w-5 mr-3 ${
                      isActive ? "text-primary-600" : "text-gray-400"
                    }`}
                  />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              <p>Pemerintah Kabupaten Trenggalek</p>
              <p className="mt-1">© 2024 - Sistem Aspirasi & Pengaduan</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
