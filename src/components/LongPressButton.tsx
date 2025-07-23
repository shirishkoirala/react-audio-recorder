import React, { useRef } from 'react';
import styles from "./LongPressButton.module.css"

interface LongPressButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    onLongPressStart?: () => void;
    onLongPressEnd?: () => void;
    onShortPress?: () => void;
    onLongPress?: () => void;
}

const LongPressButton: React.FC<LongPressButtonProps> = ({
    onLongPressStart,
    onLongPressEnd,
    onShortPress,
    onLongPress,
    ...props
}) => {
    const timerRef = React.useRef<NodeJS.Timeout | null>(null);
    const isLongPress = useRef(false);

    const handleMouseDown = () => {
        startPressTimer();
    };

    const handleMouseUp = () => {
        clearTimeout(timerRef.current!);
        if (isLongPress.current) {
            onLongPressEnd?.();
            onLongPress?.();
        } else {
            onShortPress?.();
        }
        isLongPress.current = false;
    };

    const handleTouchStart = () => {
        startPressTimer();
    };

    const handleTouchEnd = () => {
        clearTimeout(timerRef.current!);
        if (isLongPress.current) {
            onLongPressEnd?.();
            onLongPress?.();
        } else {
            onShortPress?.();
        }
        isLongPress.current = false;
    };

    function startPressTimer() {
        isLongPress.current = false;
        timerRef.current = setTimeout(() => {
            isLongPress.current = true;
            onLongPressStart?.();
        }, 500);
    }
    return (
        <button
            draggable={false}
            className={styles["long-press-button"]}
            {...props}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onContextMenu={(e) => e.preventDefault()}
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
            </svg>
        </button>
    );
};

export default LongPressButton;