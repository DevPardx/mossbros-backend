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