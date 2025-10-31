import { Repository } from "typeorm";
import { Brand } from "../entities/Brand.entity";
import { BadRequestError } from "../handler/error.handler";
import type { BrandType } from "../types";

export class BrandService {
    constructor(private readonly brandRepository: Repository<Brand>) {}

    async create(data: Pick<BrandType, "name" | "logo_url">): Promise<string> {
        const brand = await this.brandRepository.findOneBy({ name: data.name.trim().toLowerCase() });

        if (brand) {
            throw new BadRequestError("Una marca con ese nombre ya existe");
        }

        const newBrand = this.brandRepository.create(data);
        await this.brandRepository.save(newBrand);

        return `La marca ${newBrand.name} ha sido creada`;
    }

    async getAll(): Promise<Brand[]> {
        return await this.brandRepository.find();
    }

    async getById(data: Pick<BrandType, "id">): Promise<Brand> {
        const { id } = data;
        const brand = await this.brandRepository.findOneBy({ id });

        if (!brand) {
            throw new BadRequestError("Marca no encontrada");
        }

        return brand;
    }

    async update(data: BrandType): Promise<string> {
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
    }

    async delete(data: Pick<BrandType, "id">): Promise<string> {
        const { id } = data;

        const brand = await this.brandRepository.findOneBy({ id });

        if (!brand) {
            throw new BadRequestError("La marca no existe");
        }

        await this.brandRepository.remove(brand);

        return `La marca ${brand.name} ha sido eliminada`;
    }
}