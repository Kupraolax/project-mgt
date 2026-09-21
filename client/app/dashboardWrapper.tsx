"use client";

import React, { useEffect } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import StoreProvider, { useAppDispatch, useAppSelector } from './redux'
import AuthProvider from './authProvider'
import { setIsSidebarCollapsed } from '@/state'

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    const isSidebarCollapsed = useAppSelector(
      (state) => state.global.isSidebarCollapsed,
    );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        dispatch(setIsSidebarCollapsed(true));
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [dispatch]);

  return (
    <div className="flex min-h-screen w-full bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <Sidebar />
        <main
          className={`flex w-full flex-col bg-gray-50 dark:bg-dark-bg ${
            isSidebarCollapsed ? "" : "md:pl-64"
          }`}
        >
          <Navbar />
            {children}
        </main>
    </div>
  )
}

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <AuthProvider>
        <DashboardLayout>{children}</DashboardLayout>
      </AuthProvider>
    </StoreProvider>
  );
};


export default DashboardWrapper
