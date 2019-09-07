function calculateSeverity(incidenceNum, radius) {
    let num = incidenceNum / (4 * radius) * 10;
    return Math.min(num.toFixed(1), 10);
}