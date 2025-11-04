export type LoginType = {
    email: string;
    password: string;
    remember_me: boolean;
}

export type ForgotPasswordType = Pick<LoginType, "email">;

export type ForgotPasswordEmailType = {
    email: string;
    name: string;
    token: string;
    expires_in: number;
    date: Date;
}

export type ResetPasswordType = {
    token: string;
    new_password: string;
}

export type ModelType = {
    id: string;
    name: string;
    is_active: boolean;
    brand_id: string;
}

export type BrandType = {
    id: string;
    name: string;
    logo_url: string;
    is_active: boolean;
}

export type CustomerType = {
    name: string;
    phone: string;
    email?: string;
}

export type MotorcycleType = {
    plate: string;
    brand_id: string;
    model_id: string;
}

export type MotorcycleInputType = {
    motorcycle_plate: string;
    brand_id: string;
    model_id: string;
}

export type CustomerWithMotorcycleType = {
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    motorcycles: MotorcycleInputType[];
}

export type ServiceType = {
    id: string;
    name: string;
    price: number;
    is_active: boolean;
}

export type RepairJobType = {
    id: string;
    status: string;
    notes?: string;
    estimated_completion?: Date;
    total_cost?: number;
    motorcycle_id: string;
    service_ids: string[];
}

export type CreateRepairJobType = {
    motorcycle_id: string;
    service_ids: string[];
    notes?: string;
    estimated_completion?: string;
}

export type UpdateRepairJobType = {
    status?: string;
    notes?: string;
    estimated_completion?: string;
}

export type RepairJobWorkflowType = {
    current_status: string;
    allowed_transitions: readonly string[];
    can_cancel: boolean;
    requires_confirmation: boolean;
}