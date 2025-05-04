export function isNull(obj) {
    return !isNotNull(obj);
}

export function isNotNull(obj) {
    return obj != null;
}