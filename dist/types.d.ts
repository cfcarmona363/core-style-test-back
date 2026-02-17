/**
 * API request/response types for the mail service endpoints.
 */
/** Form data sent with send-email and saved to Notion after a successful send. */
export interface FormData {
    nombre: string;
    apellido: string;
    email: string;
    caracteristicas: string;
    personalidad: string[];
    ajuste: string;
    tiempo: string;
    genero: string;
    ubicacion: string;
    comunicaciones: boolean;
    procesamiento: boolean;
}
export interface SendEmailBody {
    to: string;
    subject?: string;
    html: string;
    text?: string;
    replyTo?: string;
    /** If present, after the email is sent successfully this data is saved to Notion. */
    formData?: FormData;
}
export interface SendEmailSuccessResponse {
    success: true;
    messageId: string;
}
export interface SendEmailErrorResponse {
    error: string;
}
export type SendEmailResponse = SendEmailSuccessResponse | SendEmailErrorResponse;
export interface SaveToSheetBody {
    nombre?: string | null;
    apellido?: string | null;
    email?: string | null;
    caracteristicas?: string | null;
    personalidad?: string[] | null;
    ajuste?: string | null;
    tiempo?: string | null;
    genero?: string | null;
    ubicacion?: string | null;
    comunicaciones?: boolean | null;
    procesamiento?: boolean | null;
}
export interface SaveToSheetSuccessResponse {
    success: true;
    updatedRows: number;
}
export interface SaveToSheetErrorResponse {
    error: string;
}
export type SaveToSheetResponse = SaveToSheetSuccessResponse | SaveToSheetErrorResponse;
export interface HealthResponse {
    ok: true;
}
//# sourceMappingURL=types.d.ts.map