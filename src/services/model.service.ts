import { AppDataSource } from "../config/typeorm";
import { Model } from "../entities";
import { BadRequestError } from "../handler/error.handler";
import type { ModelType } from "../types";

export class ModelService {
    static readonly modelRepository = AppDataSource.getRepository(Model);

    static create = async (data: Pick<ModelType, "name" | "brand_id">) => {
        const { name } = data;
        const model = await this.modelRepository.findOneBy({ name: name.trim().toLowerCase() });

        if (model) {
            throw new BadRequestError("Un modelo con ese nombre ya existe");
        }

        const newModel = this.modelRepository.create(data);
        await this.modelRepository.save(newModel);

        return `El modelo ${newModel.name} ha sido creado`;
    };

    static getAll = async (data: Pick<ModelType, "brand_id">) => {
        const { brand_id } = data;
        const models = await this.modelRepository.find({
            where: { brand: { id: brand_id } },
            relations: {
                brand: true
            }
        });
        return models;
    };

    static getById = async (data: Pick<ModelType, "id" | "brand_id">) => {
        const { brand_id, id } = data;

        const model = await this.modelRepository.findOne({
            where: { id, brand: { id: brand_id } },
            relations: {
                brand: true
            }
        });

        if (!model) {
            throw new BadRequestError("Modelo no encontrado");
        }

        return model;
    };

    static update = async (data: Pick<ModelType, "id" | "name" | "brand_id" | "is_active">) => {
        const { id, name, brand_id, is_active } = data;

        const model = await this.modelRepository.findOneBy({ id });

        if (!model) {
            throw new BadRequestError("Modelo no encontrado");
        }

        const nameExists = await this.modelRepository.findOneBy({ name: name.trim().toLowerCase() });

        if (nameExists && nameExists.id !== id) {
            throw new BadRequestError("Otro modelo con ese nombre ya existe");
        }

        model.name = name;
        model.brand_id = brand_id;
        model.is_active = is_active;

        await this.modelRepository.save(model);

        return `El modelo ${model.name} ha sido actualizado`;
    };

    static delete = async (data: Pick<ModelType, "id">) => {
        const { id } = data;

        const model = await this.modelRepository.findOneBy({ id });

        if (!model) {
            throw new BadRequestError("Modelo no encontrado");
        }

        await this.modelRepository.remove(model);

        return `El modelo ${model.name} ha sido eliminado`;
    };
}