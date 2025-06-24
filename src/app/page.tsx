"use client";

import { useState, useEffect } from "react";
import SetupForm from "@/components/SetupForm";
import UpdateView from "@/components/UpdateView";
import { LotteryData } from "@/lib/types";

const DATA_KEY = "lottery_data";

export default function Home() {
  const [lotteryData, setLotteryData] = useState<LotteryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedData = localStorage.getItem(DATA_KEY);
      if (savedData) {
        setLotteryData(JSON.parse(savedData));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      // If parsing fails, treat it as no data
      localStorage.removeItem(DATA_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSetupComplete = (data: LotteryData) => {
    try {
      localStorage.setItem(DATA_KEY, JSON.stringify(data));
      setLotteryData(data);
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
      alert("There was an error saving your data. Please try again.");
    }
  };

  const handleUpdate = (data: LotteryData) => {
    handleSetupComplete(data); // Same logic as setup: save to localStorage and update state
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to delete all data and start over?")) {
      try {
        localStorage.removeItem(DATA_KEY);
        setLotteryData(null);
      } catch (error) {
        console.error("Failed to remove data from localStorage", error);
      }
    }
  };
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 sm:p-8 md:p-12">
      <div className="z-10 w-full max-w-4xl items-center justify-between font-mono text-sm lg:flex mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-accent text-center w-full">
          Lottery Winnings Calculator
        </h1>
      </div>

      <div className="w-full max-w-2xl">
        {isLoading ? (
          <p className="text-center">Loading...</p>
        ) : lotteryData ? (
          <UpdateView data={lotteryData} onUpdate={handleUpdate} onReset={handleReset} />
        ) : (
          <SetupForm onSetupComplete={handleSetupComplete} />
        )}
      </div>
    </main>
  );
}
