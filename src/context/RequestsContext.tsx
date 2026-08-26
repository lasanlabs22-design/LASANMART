import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ServiceRequest = {
  id: string;
  serviceId: string;
  serviceLabel: string;
  category: 'online' | 'offline';
  sector: string;
  title: string;
  description: string;
  budget: string;
  timeline: string;
  city: string;
  postedOn: string;
};

type RequestsContextType = {
  requests: ServiceRequest[];
  addRequest: (r: Omit<ServiceRequest, 'id' | 'postedOn'>) => void;
  removeRequest: (id: string) => void;
};

const RequestsContext = createContext<RequestsContextType | undefined>(undefined);

const today = () =>
  new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export function RequestsProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);

  const addRequest: RequestsContextType['addRequest'] = (r) => {
    setRequests((prev) => [
      {
        ...r,
        id: `req_${Date.now()}`,
        postedOn: today(),
      },
      ...prev,
    ]);
  };

  const removeRequest = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <RequestsContext.Provider value={{ requests, addRequest, removeRequest }}>
      {children}
    </RequestsContext.Provider>
  );
}

export function useRequests() {
  const ctx = useContext(RequestsContext);
  if (!ctx) throw new Error('useRequests must be used within RequestsProvider');
  return ctx;
}