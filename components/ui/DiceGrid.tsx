// components/ui/DiceGrid.tsx
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Die from "./Die";

interface DiceGridProps {
    values: string[];
    onDiePress: (index: number) => void;
    selectedIndex: number | null;
}

export default function DiceGrid({ values, onDiePress, selectedIndex }: DiceGridProps) {
    const row1 = values.slice(0, 6);
    const row2 = values.slice(6);

    return (
        <View style={styles.grid}>
            {[row1, row2].map((row, i) => (
                <View style={styles.row} key={i}>
                    {row.map((val, j) => {
                        const index = i * 6 + j;
                        return (
                            <Pressable key={index} onPress={() => onDiePress(index)}>
                                <Die value={val} isSelected={selectedIndex === index} />
                            </Pressable>
                        );
                    })}
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    grid: {
        alignItems: "center",
        marginTop: 20,
    },
    row: {
        flexDirection: "row",
    },
});
