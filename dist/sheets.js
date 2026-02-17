"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.payloadToRow = payloadToRow;
exports.appendRow = appendRow;
/**
 * Maps the form payload to a single row (array of values).
 * personalidad array is joined with ", ".
 * Use this when implementing your save logic.
 */
function payloadToRow(data) {
    const personalidad = Array.isArray(data.personalidad)
        ? data.personalidad.join(", ")
        : data.personalidad != null
            ? String(data.personalidad)
            : "";
    return [
        data.nombre != null ? String(data.nombre) : "",
        data.apellido != null ? String(data.apellido) : "",
        data.email != null ? String(data.email) : "",
        data.caracteristicas != null ? String(data.caracteristicas) : "",
        personalidad,
        data.ajuste != null ? String(data.ajuste) : "",
        data.tiempo != null ? String(data.tiempo) : "",
        data.genero != null ? String(data.genero) : "",
        data.ubicacion != null ? String(data.ubicacion) : "",
        data.comunicaciones === true
            ? "Sí"
            : data.comunicaciones === false
                ? "No"
                : "",
        data.procesamiento === true
            ? "Sí"
            : data.procesamiento === false
                ? "No"
                : "",
    ];
}
/**
 * Saves form data as a new row. Replace this implementation with your own (e.g. DB, Notion, etc.).
 */
async function appendRow(_data) {
    throw new Error("Sheet saving not configured. Implement appendRow in sheets.ts with your preferred backend.");
}
//# sourceMappingURL=sheets.js.map