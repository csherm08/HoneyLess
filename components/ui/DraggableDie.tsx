import React, { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from "react-native-reanimated";

interface DraggableDieProps {
    letter: string;
    dieOrigins: any;
    id: number;
    originX: number;
    originY: number;
    onDrop: (id: number, x: number, y: number) => void;
    onHover?: (x: number, y: number) => void;
}

const DIE_SIZE = 50;

export default function DraggableDie({
    dieOrigins,
    letter,
    id,
    originX,
    originY,
    onDrop,
    onHover,
}: DraggableDieProps) {
    const translateX = useSharedValue(originX);
    const translateY = useSharedValue(originY);

    useEffect(() => {
        console.log(`Moving die ${id} to origin (${originX}, ${originY})`);
        translateX.value = withSpring(originX);
        translateY.value = withSpring(originY);
    }, [originX, originY, dieOrigins]);

    const pan = Gesture.Pan()
        .onUpdate((event) => {
            translateX.value = event.absoluteX - DIE_SIZE / 2;
            translateY.value = event.absoluteY - DIE_SIZE * 2;

            if (onHover) {
                const screenX = translateX.value + DIE_SIZE / 2; // adjust this value to match the horizontal offset from left
                const screenY = translateY.value + DIE_SIZE * 2; // adjust this value to match the vertical offset from top
                runOnJS(onHover)(screenX, screenY);
            }
        })
        .onEnd(() => {
            runOnJS(onDrop)(id, translateX.value, translateY.value);
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
        ],
        opacity: 1,
    }));

    return (
        <GestureDetector gesture={pan}>
            <Animated.View style={[styles.die, animatedStyle]}>
                <Text style={styles.dieText}>{letter}</Text>
            </Animated.View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    die: {
        position: "absolute",
        width: DIE_SIZE,
        height: DIE_SIZE,
        backgroundColor: "rgb(255, 159, 28)",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "#000",
        zIndex: 10,
    },
    dieText: {
        fontSize: 24,
        fontWeight: "bold",
    },
});
