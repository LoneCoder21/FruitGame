export function lerprange(value: number, x1: number, x2: number, y1: number, y2: number) {
    let t = (value - x1) / (x2 - x1);
    return t * (y2 - y1) + y1;
}

export function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}
