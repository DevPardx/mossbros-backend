import { DataSource, EntityManager, Repository, In } from "typeorm";
import { Customer } from "../entities/Customer.entity";
import { Motorcycle } from "../entities/Motorcycle.entity";
import { AppError, BadRequestError, InternalServerError, NotFoundError } from "../handler/error.handler";
import type { CustomerWithMotorcycleType, CustomerType, MotorcycleType, MotorcycleInputType } from "../types";

export class CustomerService {
    constructor(
        private readonly customerRepository: Repository<Customer>,
        private readonly dataSource: DataSource
    ) {}

    private async validateDuplicates(
        manager: EntityManager,
        data: CustomerWithMotorcycleType,
        excludeCustomerId?: string
    ): Promise<void> {
        const plates = data.motorcycles.map(m => m.motorcycle_plate);
        const uniquePlates = new Set(plates);
        if (plates.length !== uniquePlates.size) {
            throw new BadRequestError("No puedes registrar el mismo número de placa múltiples veces");
        }

        const existingMotorcycles = await manager.find(Motorcycle, {
            where: { plate: In(plates) }
        });

        const duplicateMotorcycles = excludeCustomerId
            ? existingMotorcycles.filter(m => m.customer_id !== excludeCustomerId)
            : existingMotorcycles;

        if (duplicateMotorcycles.length > 0) {
            const duplicatePlate = duplicateMotorcycles[0]?.plate ?? "desconocida";
            throw new BadRequestError(`Ya existe una motocicleta con la placa ${duplicatePlate}`);
        }

        if (data.customer_email) {
            const existingCustomerByEmail = await manager.findOne(Customer, {
                where: { email: data.customer_email }
            });

            if (existingCustomerByEmail && existingCustomerByEmail.id !== excludeCustomerId) {
                throw new BadRequestError("Ya existe un cliente con este correo electrónico");
            }
        }

        if (data.customer_phone) {
            const existingCustomerByPhone = await manager.findOne(Customer, {
                where: { phone: data.customer_phone }
            });

            if (existingCustomerByPhone && existingCustomerByPhone.id !== excludeCustomerId) {
                throw new BadRequestError("Ya existe un cliente con este número de teléfono");
            }
        }
    }

    private buildCustomerData(data: CustomerWithMotorcycleType): CustomerType {
        return {
            name: data.customer_name,
            phone: data.customer_phone,
            email: data.customer_email
        };
    }

    private buildMotorcycleData(
        motorcycleInput: MotorcycleInputType,
        customerId: string
    ): MotorcycleType & { customer_id: string } {
        return {
            plate: motorcycleInput.motorcycle_plate,
            brand_id: motorcycleInput.brand_id,
            model_id: motorcycleInput.model_id,
            customer_id: customerId
        };
    }

    async create(data: CustomerWithMotorcycleType): Promise<string> {
        return await this.dataSource.transaction(async manager => {
            try {
                if (!data.motorcycles || data.motorcycles.length === 0) {
                    throw new BadRequestError("Debes registrar al menos una motocicleta");
                }

                await this.validateDuplicates(manager, data);

                const customerData = this.buildCustomerData(data);
                const customer = manager.create(Customer, customerData);
                const savedCustomer = await manager.save(Customer, customer);

                const motorcycles = data.motorcycles.map(motorcycleInput => {
                    const motorcycleData = this.buildMotorcycleData(motorcycleInput, savedCustomer.id);
                    return manager.create(Motorcycle, motorcycleData);
                });

                await manager.save(Motorcycle, motorcycles);

                const motorcycleCount = motorcycles.length;
                return `El cliente ha sido registrado con ${motorcycleCount} motocicleta${motorcycleCount > 1 ? "s" : ""}`;
            } catch (error) {
                if (error instanceof AppError) {
                    throw error;
                }
                throw new InternalServerError("Error al registrar el cliente");
            }
        });
    }

    async getAll(page: number = 1, limit: number = 15) {
        try {
            const skip = (page - 1) * limit;

            const [customers, total] = await this.customerRepository.findAndCount({
                relations: ["motorcycles", "motorcycles.brand", "motorcycles.model"],
                order: { created_at: "DESC" },
                take: limit,
                skip: skip
            });

            return {
                data: customers,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            };
        } catch {
            throw new InternalServerError("Error al obtener clientes");
        }
    }

    async search(query: string, page: number = 1, limit: number = 15) {
        try {
            if (!query || query.trim() === "") {
                return await this.getAll(page, limit);
            }

            const searchTerm = `%${query.toLowerCase()}%`;
            const skip = (page - 1) * limit;

            const queryBuilder = this.customerRepository
                .createQueryBuilder("customer")
                .leftJoinAndSelect("customer.motorcycles", "motorcycle")
                .leftJoinAndSelect("motorcycle.brand", "brand")
                .leftJoinAndSelect("motorcycle.model", "model")
                .where("LOWER(customer.name) LIKE :searchTerm", { searchTerm })
                .orWhere("LOWER(motorcycle.plate) LIKE :searchTerm", { searchTerm })
                .orderBy("customer.created_at", "DESC")
                .skip(skip)
                .take(limit);

            const [customers, total] = await queryBuilder.getManyAndCount();

            return {
                data: customers,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            };
        } catch {
            throw new InternalServerError("Error al buscar clientes");
        }
    }

    async getById(id: string) {
        try {
            const customer = await this.customerRepository.findOne({
                where: { id },
                relations: ["motorcycles", "motorcycles.brand", "motorcycles.model"]
            });

            if (!customer) {
                throw new NotFoundError("Cliente no encontrado");
            }

            return customer;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new InternalServerError("Error al obtener cliente");
        }
    }

    async update(id: string, data: Partial<CustomerWithMotorcycleType>) {
        return await this.dataSource.transaction(async manager => {
            try {
                const customer = await manager.findOne(Customer, {
                    where: { id },
                    relations: ["motorcycles"]
                });

                if (!customer) {
                    throw new NotFoundError("Cliente no encontrado");
                }

                const validationData: Partial<CustomerWithMotorcycleType> = {};

                if (data.customer_phone !== undefined && data.customer_phone !== customer.phone) {
                    validationData.customer_phone = data.customer_phone;
                }

                if (data.customer_email !== undefined && data.customer_email !== customer.email) {
                    validationData.customer_email = data.customer_email;
                }

                if (data.motorcycles !== undefined) {
                    if (data.motorcycles.length === 0) {
                        throw new BadRequestError("Debes registrar al menos una motocicleta");
                    }
                    validationData.motorcycles = data.motorcycles;
                }

                if (validationData.motorcycles || validationData.customer_phone || validationData.customer_email) {
                    await this.validateDuplicates(
                        manager,
                        { ...validationData, motorcycles: validationData.motorcycles || [] } as CustomerWithMotorcycleType,
                        id
                    );
                }

                if (data.motorcycles !== undefined) {
                    await manager.delete(Motorcycle, { customer_id: id });

                    const motorcycles = data.motorcycles.map(motorcycleInput => {
                        const motorcycleData = this.buildMotorcycleData(motorcycleInput, id);
                        return manager.create(Motorcycle, motorcycleData);
                    });

                    await manager.save(Motorcycle, motorcycles);
                }

                const customerUpdateData: Partial<CustomerType> = {};
                if (data.customer_name !== undefined) customerUpdateData.name = data.customer_name;
                if (data.customer_phone !== undefined) customerUpdateData.phone = data.customer_phone;
                if (data.customer_email !== undefined) customerUpdateData.email = data.customer_email;

                if (Object.keys(customerUpdateData).length > 0) {
                    await manager.update(Customer, { id }, customerUpdateData);
                }

                return "Cliente actualizado correctamente";
            } catch (error) {
                if (error instanceof AppError) {
                    throw error;
                }
                throw new InternalServerError("Error al actualizar cliente");
            }
        });
    }

    async delete(id: string) {
        try {
            const customer = await this.customerRepository.findOneBy({ id });

            if (!customer) {
                throw new NotFoundError("Cliente no encontrado");
            }

            await this.customerRepository.remove(customer);

            return "Cliente eliminado correctamente";
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new InternalServerError("Error al eliminar cliente");
        }
    };
}