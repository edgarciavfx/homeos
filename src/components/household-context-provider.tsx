"use client";

import { createContext, useContext } from "react";

interface HouseholdContextValue {
  householdId: string | null;
  role: string | null;
}

const HouseholdContext = createContext<HouseholdContextValue>({
  householdId: null,
  role: null,
});

export function HouseholdContextProvider({ children }: { children: React.ReactNode }) {
  return (
    <HouseholdContext.Provider value={{ householdId: null, role: null }}>
      {children}
    </HouseholdContext.Provider>
  );
}

export function useHousehold() {
  return useContext(HouseholdContext);
}
