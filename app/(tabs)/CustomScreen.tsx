import GameSession from "@/components/GameSession";
import { DragProvider } from "@/hooks/useDragDie";
import { rollDice } from "@/utils/dice";
import React from "react";

export default function CustomScreen() {
    return (
        <DragProvider>
            <GameSession
                title="Custom Game"
                initialDice={rollDice()}
                allowReroll
                onReroll={rollDice}
            />
        </DragProvider>
    );
}
