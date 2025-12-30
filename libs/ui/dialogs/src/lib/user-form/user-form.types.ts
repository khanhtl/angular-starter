export interface UserFormData {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
}

export type UserFormResult = UserFormData | null;
