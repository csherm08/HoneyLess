import DraggableDie from "@/components/ui/DraggableDie";
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
    const [board, setBoard] = useState<string[][]>(
        Array.from({ length: 12 }, () => Array(12).fill(""))
    );
    const [dieOrigins, setDieOrigins] = useState<{ [id: number]: { x: number; y: number } }>({});

    const [gridOriginY, setGridOriginY] = useState<number | null>(null);
    const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
    const placedDice = useRef<{ [id: number]: { row: number; col: number } }>({});

    const fitsInOneRow = screenWidth >= (DIE_SIZE + 10) * 12;
    // useEffect(() => {
    //     setDieOrigins((prev) => {
    //         const updated = { ...prev };
    //         dice.forEach((_, index) => {
    //             if (!(index in updated)) {
    //                 updated[index] = getHomePosition(index, fitsInOneRow, GRID_ORIGIN_X);
    //             }
    //         });
    //         return updated;
    //     });
    //     console.log("Updated die origins:", dieOrigins);
    // }, [dice, fitsInOneRow, GRID_ORIGIN_X]);
    function getHomePosition(index: number, fitsInOneRow: boolean, GRID_ORIGIN_X: number): { x: number; y: number } {
        if (fitsInOneRow) {
            // Center all 12 dice in one row
            const totalDiceWidth = 12 * DIE_SIZE + 11 * 5 // 12 dice + 11 gaps of 5px
            const startX = (screenWidth - totalDiceWidth) / 2
            return {
                x: startX + index * (DIE_SIZE + 5),
                y: 10,
            }
        } else {
            const dicePerRow = 6
            const totalRowWidth = dicePerRow * DIE_SIZE + (dicePerRow - 1) * 5 // 6 dice + 5 gaps
            const startX = (screenWidth - totalRowWidth) / 2
            const row = Math.floor(index / dicePerRow)
            const col = index % dicePerRow

            return {
                x: startX + col * (DIE_SIZE + 5),
                y: 10 + row * (DIE_SIZE + 10), // 10px gap between rows
            }
        }
    }

    const clearPreviousTile = (placedDice: any, i: number, row: number, col: number, newBoard: string[][]) => {
        newBoard[row][col] = "";
        delete placedDice.current[i]
        return newBoard;
    }

    const handleDrop = (id: number, x: number, y: number) => {
        const prev = placedDice.current[id];
        console.log(placedDice)
        let newBoard = board.map((r) => [...r]);

        // Clear previous tile if it was placed
        if (prev) {
            console.log("new board", newBoard);
            newBoard = clearPreviousTile(placedDice, id, prev.row, prev.col, newBoard);
            setBoard(newBoard)
            // console.log(`Clearing previous tile at row ${prev.row}, col ${prev.col}`);
            // newBoard[prev.row][prev.col] = "";
        }
        if (!hoveredCell || gridOriginY == null) {
            console.log("No hovered cell");
            const home = getHomePosition(id, fitsInOneRow, GRID_ORIGIN_X);
            console.log(home);
            setDieOrigins(prev => ({
                ...prev,
                [id]: home,
            }));
            return;
        };

        const { row, col } = hoveredCell;
        setHoveredCell(null);


        console.log("Placing die", id, "at row", row, "col", col);
        console.log("Current board state:", newBoard);
        const isInBounds =
            row >= 0 && row < 12 &&
            col >= 0 && col < 12 &&
            newBoard[row][col] === "";

        if (!isInBounds) {
            console.log("Position out of bounds or cell already occupied");
            return;
        };
        newBoard[row][col] = dice[id];
        console.log("is in bounds");

        // 🧠 Save grid position
        placedDice.current[id] = { row, col };

        const centerX = col * TILE_SIZE + GRID_ORIGIN_X + TILE_SIZE / 2;
        const centerY = row * TILE_SIZE + gridOriginY! + TILE_SIZE / 2;

        console.log(`Hovered cell center → x: ${centerX}, y: ${centerY}`);

        // ✅ Save new origin so the die knows where to "stick"
        setDieOrigins((prevOrigins) => ({
            ...prevOrigins,
            [id]: {
                x: col * TILE_SIZE + GRID_ORIGIN_X,
                y: (row * TILE_SIZE + gridOriginY - TILE_SIZE * 1.5) - 1,
            },
        }));

        // const updatedUsed = [...usedDice];
        // updatedUsed[id] = true;

        setBoard(newBoard);
        console.log("new board", newBoard);
        // setUsedDice(updatedUsed);
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
        // const updatedUsed = [...usedDice];
        // updatedUsed[id] = false;

        const newBoard = board.map((r, ri) =>
            r.map((c, ci) => (ri === row && ci === col ? "" : c))
        );

        delete placedDice.current[id];
        setBoard(newBoard);
        // setUsedDice(updatedUsed);
    };

    const handleReroll = () => {
        if (!onReroll) return;
        const newDice = onReroll();
        setDice(newDice);
        // setUsedDice(Array(12).fill(false));
        setBoard(Array.from({ length: 12 }, () => Array(12).fill("")));
        placedDice.current = {};
    };
    const handleReset = () => {
        setBoard(Array.from({ length: 12 }, () => Array(12).fill("")));
        // setUsedDice(Array(12).fill(false));
        placedDice.current = {};
        setDieOrigins({});
    };

    return (
        <DragProvider>
            <View style={styles.container}>
                <Text style={styles.title}>{title}</Text>
                <View style={{ flexDirection: "row", justifyContent: "space-around", paddingHorizontal: 10 }}>
                    {allowReroll && (
                        <Button title="Reroll" onPress={handleReroll} />
                    )}
                    <Button title="Reset" onPress={handleReset} />
                </View>
                <View style={styles.diceArea}>
                    {dice.map((letter, index) => {
                        const origin = dieOrigins[index];
                        const { x: defaultX, y: defaultY } = getHomePosition(index, fitsInOneRow, GRID_ORIGIN_X);

                        const originX = origin?.x ?? defaultX;
                        const originY = origin?.y ?? defaultY;

                        return (
                            <DraggableDie
                                key={index}
                                id={index}
                                letter={letter}
                                originX={originX}
                                originY={originY}
                                onDrop={handleDrop}
                                onHover={handleHover}
                            />
                        );
                    })}
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
                                                borderColor: isHovered ? "rgb(255, 159, 28)" : "rgb(128, 128, 128)",
                                                borderWidth: isHovered ? 3 : 1,
                                                backgroundColor: "rgba(255,255,255,1)",
                                                // backgroundColor: placed
                                                //     ? "rgba(100,0,0,0.05)"
                                                //     : isHovered
                                                //         ? "rgba(128,128,128)"
                                                //         : "rgba(255,255,255,1)",
                                            }}
                                        />
                                    );
                                })
                            )}
                        </View>
                    )}
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
        zIndex: 1000,
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
