import { DataSource, Repository } from "typeorm";
import { Customer } from "../entities/Customer.entity";
import { Motorcycle } from "../entities/Motorcycle.entity";
import { AppError, BadRequestError, InternalServerError, NotFoundError } from "../handler/error.handler";
import type { CustomerWithMotorcycleType, CustomerType, MotorcycleType } from "../types";

export class CustomerService {
    constructor(
        private readonly customerRepository: Repository<Customer>,
        private readonly dataSource: DataSource
    ) {}

    async create(data: CustomerWithMotorcycleType): Promise<string> {
        return await this.dataSource.transaction(async manager => {
            try {
                const existingMotorcycle = await manager.findOne(Motorcycle, {
                    where: { plate: data.motorcycle_plate }
                });

                if (existingMotorcycle) {
                    throw new BadRequestError("Ya existe una motocicleta con esta placa");
                }

                if (data.customer_email) {
                    const existingCustomerByEmail = await manager.findOne(Customer, {
                        where: { email: data.customer_email }
                    });

                    if (existingCustomerByEmail) {
                        throw new BadRequestError("Ya existe un cliente con este correo electrónico");
                    }
                }

                const existingCustomerByPhone = await manager.findOne(Customer, {
                    where: { phone: data.customer_phone }
                });

                if (existingCustomerByPhone) {
                    throw new BadRequestError("Ya existe un cliente con este número de teléfono");
                }

                const customerData: CustomerType = {
                    name: data.customer_name,
                    phone: data.customer_phone,
                    email: data.customer_email
                };

                const customer = manager.create(Customer, customerData);
                const savedCustomer = await manager.save(Customer, customer);

                const motorcycleData: MotorcycleType & { customer_id: string } = {
                    plate: data.motorcycle_plate,
                    brand_id: data.brand_id,
                    model_id: data.model_id,
                    customer_id: savedCustomer.id
                };

                const motorcycle = manager.create(Motorcycle, motorcycleData);
                await manager.save(Motorcycle, motorcycle);

                return "El cliente ha sido registrado";
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
                relations: ["motorcycle", "motorcycle.brand", "motorcycle.model"],
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
        } catch (error) {
            console.log(error);
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
                .leftJoinAndSelect("customer.motorcycle", "motorcycle")
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
        } catch (error) {
            console.log(error);
            throw new InternalServerError("Error al buscar clientes");
        }
    }

    async getById(id: string) {
        try {
            const customer = await this.customerRepository.findOne({
                where: { id },
                relations: ["motorcycle", "motorcycle.brand", "motorcycle.model"]
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
                    relations: ["motorcycle"]
                });

                if (!customer) {
                    throw new NotFoundError("Customer not found");
                }

                const customerUpdateData: Partial<CustomerType> = {};
                const motorcycleUpdateData: Partial<MotorcycleType> = {};

                if (data.customer_name !== undefined) customerUpdateData.name = data.customer_name;
                if (data.customer_phone !== undefined) customerUpdateData.phone = data.customer_phone;
                if (data.customer_email !== undefined) customerUpdateData.email = data.customer_email;

                if (data.motorcycle_plate !== undefined) motorcycleUpdateData.plate = data.motorcycle_plate;
                if (data.brand_id !== undefined) motorcycleUpdateData.brand_id = data.brand_id;
                if (data.model_id !== undefined) motorcycleUpdateData.model_id = data.model_id;

                if (Object.keys(customerUpdateData).length > 0) {
                    await manager.update(Customer, { id }, customerUpdateData);
                }

                if (Object.keys(motorcycleUpdateData).length > 0 && customer.motorcycle) {
                    if (motorcycleUpdateData.plate && motorcycleUpdateData.plate !== customer.motorcycle.plate) {
                        const existingMotorcycle = await manager.findOne(Motorcycle, {
                            where: { plate: motorcycleUpdateData.plate }
                        });

                        if (existingMotorcycle) {
                            throw new BadRequestError("A motorcycle with this plate already exists");
                        }
                    }

                    await manager.update(Motorcycle, { id: customer.motorcycle.id }, motorcycleUpdateData);
                }

                return "Cliente actualizado correctamente";
            } catch (error) {
                if (error instanceof AppError) {
                    throw error;
                }
                console.error("Error updating customer:", error);
                throw new InternalServerError("Error updating customer");
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