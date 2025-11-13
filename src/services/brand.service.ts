import { Repository } from "typeorm";
import { Brand } from "../entities/Brand.entity";
import { assertExists, assertTrue } from "../utils/validation.utils";
import { CacheService, CacheKeys, CacheTTL } from "../utils/cache";
import type { BrandType } from "../types";

export class BrandService {
    constructor(private readonly brandRepository: Repository<Brand>) {}

    async create(data: Pick<BrandType, "name" | "logo_url">): Promise<string> {
        const existingBrand = await this.brandRepository.findOneBy({
            name: data.name.trim().toLowerCase()
        });

        assertTrue(!existingBrand, "Una marca con ese nombre ya existe");

        const newBrand = this.brandRepository.create(data);
        await this.brandRepository.save(newBrand);

        await CacheService.delPattern("brands:*");

        return `La marca ${newBrand.name} ha sido creada`;
    }

    async getAll(): Promise<Brand[]> {
        return await CacheService.getOrSet(
            CacheKeys.brands(),
            async () => await this.brandRepository.find(),
            CacheTTL.LONG
        );
    }

    async getById(data: Pick<BrandType, "id">): Promise<Brand> {
        const { id } = data;

        const brand = await CacheService.getOrSet(
            CacheKeys.brand(id),
            async () => await this.brandRepository.findOneBy({ id }),
            CacheTTL.LONG
        );

        assertExists(brand, "Marca");

        return brand;
    }

    async update(data: BrandType): Promise<string> {
        const { id, name, logo_url, is_active } = data;

        const brand = await this.brandRepository.findOneBy({ id });
        assertExists(brand, "Marca");

        brand.name = name;
        brand.logo_url = logo_url;
        brand.is_active = is_active;

        await this.brandRepository.save(brand);

        await CacheService.delPattern("brands:*");
        await CacheService.del(CacheKeys.brand(id));

        return "La marca ha sido actualizada";
    }

    async delete(data: Pick<BrandType, "id">): Promise<string> {
        const { id } = data;

        const brand = await this.brandRepository.findOneBy({ id });
        assertExists(brand, "Marca");

        await this.brandRepository.remove(brand);

        await CacheService.delPattern("brands:*");
        await CacheService.del(CacheKeys.brand(id));
        await CacheService.delPattern(`models:brand:${id}`);

        return `La marca ${brand.name} ha sido eliminada`;
    }
}