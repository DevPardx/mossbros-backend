import type { ServiceType } from "../types";
import { Repository } from "typeorm";
import { Service } from "../entities";
import { AppError, BadRequestError, InternalServerError, NotFoundError } from "../handler/error.handler";
import { CacheService, CacheKeys, CacheTTL } from "../utils/cache";

export class ServiceService {
    constructor(private readonly serviceRepository: Repository<Service>) {}

    async create(data: Pick<ServiceType, "name" | "price">): Promise<string> {
        try{
            const service = await this.serviceRepository.findOneBy({ name: data.name.trim().toLowerCase() });

            if (service) {
                throw new BadRequestError("Un servicio con ese nombre ya existe");
            }

            const newService = this.serviceRepository.create(data);
            await this.serviceRepository.save(newService);

            await CacheService.del(CacheKeys.services());

            return `El servicio ${newService.name} ha sido creado`;
        }
        catch(error){
            if(error instanceof AppError){
                throw error;
            }

            throw new InternalServerError("Ocurrió un error al iniciar sesión");
        }
    }

    async getAll(): Promise<Service[]> {
        try{
            return await CacheService.getOrSet(
                CacheKeys.services(),
                async () => await this.serviceRepository.find(),
                CacheTTL.LONG
            );
        }
        catch(error){
            if(error instanceof AppError){
                throw error;
            }

            throw new InternalServerError("Ocurrió un error al obtener los servicios");
        }
    }

    async getById(data: Pick<ServiceType, "id">): Promise<Service> {
        try{
            const { id } = data;

            const service = await CacheService.getOrSet(
                CacheKeys.service(id),
                async () => await this.serviceRepository.findOneBy({ id }),
                CacheTTL.LONG
            );

            if (!service) {
                throw new NotFoundError("Servicio no encontrado");
            }

            return service;
        }
        catch(error){
            if(error instanceof AppError){
                throw error;
            }

            throw new InternalServerError("Ocurrió un error al obtener el servicio");
        }
    }

    async update(data: Pick<ServiceType, "id" | "name" | "price" | "is_active">): Promise<string> {
        try{
            const { id, name, price, is_active } = data;
            const service = await this.serviceRepository.findOneBy({ id });

            if (!service) {
                throw new NotFoundError("Servicio no encontrado");
            }

            service.name = name;
            service.price = price;
            service.is_active = is_active;

            await this.serviceRepository.save(service);

            await CacheService.del(CacheKeys.service(id));
            await CacheService.del(CacheKeys.services());

            return "El servicio ha sido actualizado";
        }
        catch(error){
            if(error instanceof AppError){
                throw error;
            }

            throw new InternalServerError("Ocurrió un error al actualizar el servicio");
        }
    }

    async delete(data: Pick<ServiceType, "id">): Promise<string> {
        try{
            const { id } = data;
            const service = await this.serviceRepository.findOneBy({ id });

            if (!service) {
                throw new NotFoundError("Servicio no encontrado");
            }

            await this.serviceRepository.remove(service);

            await CacheService.del(CacheKeys.service(id));
            await CacheService.del(CacheKeys.services());

            return `El servicio ${service.name} ha sido eliminado`;
        }
        catch(error){
            if(error instanceof AppError){
                throw error;
            }

            throw new InternalServerError("Ocurrió un error al eliminar el servicio");
        }
    }
}