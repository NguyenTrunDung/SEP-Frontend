// src/context/FoodCategoryContext.js
import React, { createContext, useContext, useState } from 'react';

const FoodCategoryContext = createContext();

export const FoodCategoryProvider = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => setRefreshTrigger((prev) => prev + 1);

  return (
    <FoodCategoryContext.Provider value={{ isModalOpen, setIsModalOpen, triggerRefresh, refreshTrigger }}>
      {children}
    </FoodCategoryContext.Provider>
  );
};

export const useFoodCategoryContext = () => useContext(FoodCategoryContext);