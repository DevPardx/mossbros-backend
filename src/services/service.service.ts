import type { ServiceType } from '../types';
import { AppDataSource } from '../config/typeorm';
import { Service } from '../entities';
import { AppError, BadRequestError, InternalServerError, NotFoundError } from '../handler/error.handler';

export class ServiceService {
    static readonly serviceRepository = AppDataSource.getRepository(Service);

    static create = async (data: Pick<ServiceType, 'name' | 'price'>) => {
        try{
            const service = await this.serviceRepository.findOneBy({ name: data.name.trim().toLowerCase() });

            if (service) {
                throw new BadRequestError('Un servicio con ese nombre ya existe');
            }

            const newService = this.serviceRepository.create(data);
            await this.serviceRepository.save(newService);

            return `El servicio ${newService.name} ha sido creado`;
        }
        catch(error){
            if(error instanceof AppError){
                throw error;
            }

            throw new InternalServerError("Ocurrió un error al iniciar sesión");
        }
    }

    static getAll = async () => {
        try{
            const services = await this.serviceRepository.find();
            return services;
        }
        catch(error){
            if(error instanceof AppError){
                throw error;
            }

            throw new InternalServerError("Ocurrió un error al obtener los servicios");
        }
    }

    static getById = async (data: Pick<ServiceType, 'id'>) => {
        try{
            const { id } = data;
            const service = await this.serviceRepository.findOneBy({ id });

            if (!service) {
                throw new NotFoundError('Servicio no encontrado');
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

    static update = async (data: Pick<ServiceType, 'id' | 'name' | 'price' | 'is_active'>) => {
        try{
            const { id, name, price, is_active } = data;
            const service = await this.serviceRepository.findOneBy({ id });

            if (!service) {
                throw new NotFoundError('Servicio no encontrado');
            }

            service.name = name;
            service.price = price;
            service.is_active = is_active;

            await this.serviceRepository.save(service);

            return "El servicio ha sido actualizado";
        }
        catch(error){
            if(error instanceof AppError){
                throw error;
            }

            throw new InternalServerError("Ocurrió un error al actualizar el servicio");
        }
    }

    static delete = async (data: Pick<ServiceType, 'id'>) => {
        try{
            const { id } = data;
            const service = await this.serviceRepository.findOneBy({ id });

            if (!service) {
                throw new NotFoundError('Servicio no encontrado');
            }

            await this.serviceRepository.remove(service);

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