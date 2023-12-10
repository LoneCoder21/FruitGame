import { useEffect } from "react";

export default function useEventListener(listener: string, callback: () => void) {
    useEffect(() => {
        callback();
        addEventListener(listener, callback);
        return () => {
            removeEventListener(listener, callback);
        };
    });
}
