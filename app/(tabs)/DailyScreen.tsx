import GameSession from "@/components/GameSession";
import { DragProvider } from "@/hooks/useDragDie";
import { getSeededDice } from "@/utils/dice";
import React from "react";

export default function DailyScreen() {
    const today = new Date().toISOString().split("T")[0];
    const dailyDice = getSeededDice(today);

    return (
        <DragProvider>
            <GameSession title={`Daily Puzzle - ${today}`} initialDice={dailyDice} />;
        </ DragProvider>
    )
}
