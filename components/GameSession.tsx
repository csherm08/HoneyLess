import DraggableDie from "@/components/ui/DraggableDie";
import GameBoard from "@/components/ui/GameBoard";
import { DragProvider } from "@/hooks/useDragDie";
import React, { useRef, useState } from "react";
import { Button, Dimensions, StyleSheet, Text, View } from "react-native";

interface GameSessionProps {
    initialDice: string[];
    title: string;
    allowReroll?: boolean;
    onReroll?: () => string[];
}

const TILE_SIZE = 50;
const DIE_SIZE = 50; // Size of the die
const screenWidth = Dimensions.get("window").width;
const GRID_ORIGIN_X = Math.floor((screenWidth - TILE_SIZE * 12 - 12 * 2) / 2);

export default function GameSession({
    initialDice,
    title,
    allowReroll = false,
    onReroll,
}: GameSessionProps) {
    const [dice, setDice] = useState(initialDice);
    const [usedDice, setUsedDice] = useState<boolean[]>(Array(12).fill(false));
    const [board, setBoard] = useState<string[][]>(
        Array.from({ length: 12 }, () => Array(12).fill(""))
    );
    const [gridOriginY, setGridOriginY] = useState<number | null>(null);
    const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
    const placedDice = useRef<{ [id: number]: { row: number; col: number } }>({});

    const handleDrop = (id: number, x: number, y: number) => {
        if (!hoveredCell || gridOriginY == null) return;

        const { row, col } = hoveredCell;
        setHoveredCell(null);

        const isInBounds =
            row >= 0 && row < 12 &&
            col >= 0 && col < 12 &&
            board[row][col] === "";

        if (!isInBounds) return;

        const newBoard = board.map((r, i) =>
            r.map((cell, j) => (i === row && j === col ? dice[id] : cell))
        );

        const updatedUsed = [...usedDice];
        updatedUsed[id] = true;

        placedDice.current[id] = { row, col };
        setBoard(newBoard);
        setUsedDice(updatedUsed);
    };

    const handleHover = (x: number, y: number) => {
        if (gridOriginY == null) return;
        const col = Math.round((x - DIE_SIZE / 2 - GRID_ORIGIN_X) / TILE_SIZE);
        const row = Math.round((y - DIE_SIZE / 2 - gridOriginY) / TILE_SIZE);
        if (row >= 0 && row < 12 && col >= 0 && col < 12) {
            setHoveredCell({ row, col });
        } else {
            setHoveredCell(null);
        }
    };

    const handleCellPress = (row: number, col: number) => {
        const dieId = Object.entries(placedDice.current).find(
            ([, pos]) => pos.row === row && pos.col === col
        )?.[0];

        if (!dieId) return;

        const id = parseInt(dieId);
        const updatedUsed = [...usedDice];
        updatedUsed[id] = false;

        const newBoard = board.map((r, ri) =>
            r.map((c, ci) => (ri === row && ci === col ? "" : c))
        );

        delete placedDice.current[id];
        setBoard(newBoard);
        setUsedDice(updatedUsed);
    };

    const handleReroll = () => {
        if (!onReroll) return;
        const newDice = onReroll();
        setDice(newDice);
        setUsedDice(Array(12).fill(false));
        setBoard(Array.from({ length: 12 }, () => Array(12).fill("")));
        placedDice.current = {};
    };

    return (
        <DragProvider>
            <View style={styles.container}>
                <Text style={styles.title}>{title}</Text>
                {allowReroll && <Button title="Roll Dice" onPress={handleReroll} />}

                <View style={styles.diceArea}>
                    {dice.map((letter, index) => (
                        <DraggableDie
                            key={index}
                            id={index}
                            letter={letter}
                            originX={(index % 6) * 60 + GRID_ORIGIN_X}
                            originY={Math.floor(index / 6) * 60 + 10}
                            isUsed={usedDice[index]}
                            onDrop={handleDrop}
                            onHover={handleHover}
                        />
                    ))}
                </View>

                <View
                    onLayout={(e) => {
                        setGridOriginY(e.nativeEvent.layout.y);
                    }}
                    style={{ position: "relative" }}
                >
                    {gridOriginY != null && (
                        <View style={[StyleSheet.absoluteFillObject, { zIndex: 10 }]} pointerEvents="none">
                            {[...Array(12)].map((_, row) =>
                                [...Array(12)].map((_, col) => {
                                    const isHovered = hoveredCell?.row === row && hoveredCell?.col === col;
                                    const placed = board[row][col];
                                    return (
                                        <View
                                            key={`${row}-${col}`}
                                            style={{
                                                position: "absolute",
                                                top: row * TILE_SIZE,
                                                left: col * TILE_SIZE + GRID_ORIGIN_X,
                                                width: TILE_SIZE,
                                                height: TILE_SIZE,
                                                // color: isHovered ? "rgb(255, 159, 28)" : "rgba(255,0,0,0.6)",
                                                borderColor: isHovered ? "rgb(255, 159, 28)" : "rgba(255,255,255)",
                                                borderWidth: isHovered ? 3 : 1,
                                                backgroundColor: placed
                                                    ? "rgba(0,0,0,0.05)"
                                                    : isHovered
                                                        ? "rgba(0,255,0,0.1)"
                                                        : "transparent",
                                            }}
                                        />
                                    );
                                })
                            )}
                            {hoveredCell && (
                                <View
                                    style={{
                                        position: "absolute",
                                        width: 10,
                                        height: 10,
                                        borderRadius: 5,
                                        backgroundColor: "red",
                                        top: hoveredCell.row * TILE_SIZE + TILE_SIZE / 2 - 5,
                                        left: hoveredCell.col * TILE_SIZE + TILE_SIZE / 2 - 5 + GRID_ORIGIN_X,
                                        zIndex: 11,
                                    }}
                                />
                            )}
                        </View>
                    )}
                    <GameBoard board={board} onCellPress={handleCellPress} />
                </View>
            </View>
        </DragProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: "relative",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        padding: 10,
    },
    diceArea: {
        height: 120,
        position: "relative",
    },
    debugOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 5,
    },
});
