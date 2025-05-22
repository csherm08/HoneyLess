/* eslint-disable */
import React, {
  createContext,
  FC,
  ReactNode,
  useContext,
  useState,
} from "react";

interface DragContextType {
  draggingValue: string | null;
  setDraggingValue: (val: string | null) => void;
}

const DragDieContext = createContext<DragContextType | undefined>(undefined);

export const DragProvider: FC<{ children: ReactNode }> = ({ children }):any => {
  const [draggingValue, setDraggingValue] = useState<string | null>(null);

  return (
    <DragDieContext.Provider value={{ draggingValue, setDraggingValue }}>
      {children}
    </DragDieContext.Provider>
  );
};

export const useDragDie = (): DragContextType => {
  const context = useContext(DragDieContext);
  if (!context) {
    throw new Error("useDragDie must be used within a DragProvider");
  }
  return context;
};
