import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface GameBoardProps {
    board: string[][];
    onCellPress: (row: number, col: number) => void;
}

export default function GameBoard({ board, onCellPress }: GameBoardProps) {
    console.log("GameBoard rendered ", board.length, board[0].length);
    return (
        <View style={styles.board}>
            {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                    <Pressable
                        key={`${rowIndex}-${colIndex}`}
                        style={styles.cell}
                        onPress={() => onCellPress(rowIndex, colIndex)}
                    >
                        <Text style={styles.cellText}>{cell}</Text>
                    </Pressable>
                ))
            )}
        </View>
    );
}

const TILE_SIZE = 50;

const styles = StyleSheet.create({
    board: {
        flexDirection: "row",
        flexWrap: "wrap",
        width: TILE_SIZE * 12 + 12 * 2, // TILE_SIZE * cols + 2px margin * cols
        // marginTop: 40,
        alignSelf: "center",
    },
    cell: {
        width: TILE_SIZE,
        height: TILE_SIZE,
        margin: 0,
        borderColor: "#ccc",
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fafafa",
    },
    cellText: {
        fontSize: 20,
        fontWeight: "bold",
    },
});
