import { createContext, useContext, type ReactNode } from "react";

// ============================================
// TABS CONTEXT
// ============================================

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within a Tabs provider");
  }
  return context;
}

// ============================================
// TABS ROOT
// ============================================

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export function Tabs({ value, onValueChange, children, className = "" }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

// ============================================
// TABS LIST
// ============================================

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export function TabsList({ children, className = "" }: TabsListProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {children}
    </div>
  );
}

// ============================================
// TABS TRIGGER (Button)
// ============================================

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabsTrigger({ value, children, className = "" }: TabsTriggerProps) {
  const { value: activeValue, onValueChange } = useTabsContext();
  const isActive = value === activeValue;

  return (
    <button
      onClick={() => onValueChange(value)}
      className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all ${
        isActive
          ? "bg-surface-100 text-surface-900"
          : "bg-surface-700 text-surface-300 hover:bg-surface-600 hover:text-surface-100"
      } ${className}`}
    >
      {children}
    </button>
  );
}

// ============================================
// TABS CONTENT
// ============================================

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className = "" }: TabsContentProps) {
  const { value: activeValue } = useTabsContext();

  if (value !== activeValue) {
    return null;
  }

  return <div className={className}>{children}</div>;
}

// ============================================
// LEGACY TAB (for backwards compatibility)
// ============================================

interface TabProps {
  value: string;
  children: ReactNode;
  activeValue?: string;
  onValueChange?: (value: string) => void;
}

export function Tab({ value, children, activeValue, onValueChange }: TabProps) {
  const isActive = value === activeValue;

  return (
    <button
      onClick={() => onValueChange?.(value)}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
        isActive
          ? "bg-surface-100 text-surface-900"
          : "bg-surface-700 text-surface-300 hover:bg-surface-600 hover:text-surface-100"
      }`}
    >
      {children}
    </button>
  );
}
