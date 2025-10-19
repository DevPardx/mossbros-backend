export type LoginType = {
    email: string;
    password: string;
    rememberMe: boolean;
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
    id: string;
    name: string;
    phone: string;
    email?: string;
}

export type MotorcycleType = {
    id: string;
    plate: string;
    customer_id: string;
    brand_id: string;
    model_id: string;
}

export type CustomerWithMotorcycleType = {
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    motorcycle_plate: string;
    brand_id: string;
    model_id: string;
}

export type CustomerData = {
    name: string;
    phone: string;
    email?: string;
}

export type MotorcycleData = {
    plate: string;
    brand_id: string;
    model_id: string;
}

export type CustomerWithMotorcycleData = {
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    motorcycle_plate: string;
    brand_id: string;
    model_id: string;
}