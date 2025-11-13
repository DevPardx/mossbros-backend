import { Repository } from "typeorm";
import { Model } from "../entities";
import { BadRequestError } from "../handler/error.handler";
import { CacheService, CacheKeys, CacheTTL } from "../utils/cache";
import type { ModelType } from "../types";

export class ModelService {
    constructor(
        private readonly modelRepository: Repository<Model>
    ) {}

    async create(data: Pick<ModelType, "name" | "brand_id">): Promise<string> {
        const { name, brand_id } = data;
        const model = await this.modelRepository.findOneBy({ name: name.trim().toLowerCase() });

        if (model) {
            throw new BadRequestError("Un modelo con ese nombre ya existe");
        }

        const newModel = this.modelRepository.create(data);
        await this.modelRepository.save(newModel);

        await CacheService.delPattern(`models:brand:${brand_id}`);
        await CacheService.del(CacheKeys.models());

        return `El modelo ${newModel.name} ha sido creado`;
    }

    async getAll(data: Pick<ModelType, "brand_id">): Promise<Model[]> {
        const { brand_id } = data;

        return await CacheService.getOrSet(
            CacheKeys.models(brand_id),
            async () => await this.modelRepository.find({
                where: { brand: { id: brand_id } },
                relations: { brand: true }
            }),
            CacheTTL.LONG
        );
    }

    async getById(data: Pick<ModelType, "id" | "brand_id">): Promise<Model> {
        const { brand_id, id } = data;

        const model = await CacheService.getOrSet(
            CacheKeys.model(id),
            async () => await this.modelRepository.findOne({
                where: { id, brand: { id: brand_id } },
                relations: { brand: true }
            }),
            CacheTTL.LONG
        );

        if (!model) {
            throw new BadRequestError("Modelo no encontrado");
        }

        return model;
    }

    async update(data: Pick<ModelType, "id" | "name" | "brand_id" | "is_active">): Promise<string> {
        const { id, name, brand_id, is_active } = data;

        const model = await this.modelRepository.findOneBy({ id });

        if (!model) {
            throw new BadRequestError("Modelo no encontrado");
        }

        const nameExists = await this.modelRepository.findOneBy({ name: name.trim().toLowerCase() });

        if (nameExists && nameExists.id !== id) {
            throw new BadRequestError("Otro modelo con ese nombre ya existe");
        }

        const oldBrandId = model.brand_id;
        model.name = name;
        model.brand_id = brand_id;
        model.is_active = is_active;

        await this.modelRepository.save(model);

        await CacheService.del(CacheKeys.model(id));
        await CacheService.delPattern(`models:brand:${oldBrandId}`);
        if (oldBrandId !== brand_id) {
            await CacheService.delPattern(`models:brand:${brand_id}`);
        }
        await CacheService.del(CacheKeys.models());

        return `El modelo ${model.name} ha sido actualizado`;
    }

    async delete(data: Pick<ModelType, "id">): Promise<string> {
        const { id } = data;

        const model = await this.modelRepository.findOneBy({ id });

        if (!model) {
            throw new BadRequestError("Modelo no encontrado");
        }

        const brandId = model.brand_id;

        await this.modelRepository.remove(model);

        await CacheService.del(CacheKeys.model(id));
        await CacheService.delPattern(`models:brand:${brandId}`);
        await CacheService.del(CacheKeys.models());

        return `El modelo ${model.name} ha sido eliminado`;
    }
}