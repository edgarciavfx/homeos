"use client";

import { createContext, useContext } from "react";
import { useHouseholds } from "@/hooks/use-households";

interface HouseholdContextValue {
  householdId: string | null;
  role: string | null;
  isLoading: boolean;
}

const HouseholdContext = createContext<HouseholdContextValue>({
  householdId: null,
  role: null,
  isLoading: true,
});

export function HouseholdContextProvider({ children }: { children: React.ReactNode }) {
  const { data: households, isLoading } = useHouseholds();
  const active = households?.[0] ?? null;

  return (
    <HouseholdContext.Provider
      value={{
        householdId: active?.id ?? null,
        role: active?.role ?? null,
        isLoading,
      }}
    >
      {children}
    </HouseholdContext.Provider>
  );
}

export function useHousehold() {
  return useContext(HouseholdContext);
}
