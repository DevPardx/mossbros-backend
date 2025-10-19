import { AppDataSource } from "../config/typeorm";
import { Brand } from "../entities/Brand.entity";
import { BadRequestError } from "../handler/error.handler";
import type { BrandType } from "../types";

export class BrandService {
    static readonly brandRepository = AppDataSource.getRepository(Brand);

    static create = async (data: Pick<BrandType, "name" | "logo_url">) => {
        const brand = await this.brandRepository.findOneBy({ name: data.name.trim().toLowerCase() });

        if (brand) {
            throw new BadRequestError("Una marca con ese nombre ya existe");
        }

        const newBrand = this.brandRepository.create(data);
        await this.brandRepository.save(newBrand);

        return `La marca ${newBrand.name} ha sido creada`;
    };

    static getAll = async () => {
        return await this.brandRepository.find();
    };

    static getById = async (data: Pick<BrandType, "id">) => {
        const { id } = data;
        const brand = await this.brandRepository.findOneBy({ id });

        if (!brand) {
            throw new BadRequestError("Marca no encontrada");
        }

        return brand;
    };

    static update = async (data: BrandType) => {
        const { id, name, logo_url, is_active } = data;

        const brand = await this.brandRepository.findOneBy({ id });

        if (!brand) {
            throw new BadRequestError("La marca no existe");
        }

        brand.name = name;
        brand.logo_url = logo_url;
        brand.is_active = is_active;

        await this.brandRepository.save(brand);

        return "La marca ha sido actualizada";
    };

    static delete = async (data: Pick<BrandType, "id">) => {
        const { id } = data;

        const brand = await this.brandRepository.findOneBy({ id });

        if (!brand) {
            throw new BadRequestError("La marca no existe");
        }

        await this.brandRepository.remove(brand);

        return `La marca ${brand.name} ha sido eliminada`;
    };
}