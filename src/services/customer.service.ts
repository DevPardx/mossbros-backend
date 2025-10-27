import { AppDataSource } from "../config/typeorm";
import { Customer } from "../entities/Customer.entity";
import { Motorcycle } from "../entities/Motorcycle.entity";
import { AppError, BadRequestError, InternalServerError, NotFoundError } from "../handler/error.handler";
import type { CustomerWithMotorcycleType, CustomerType, MotorcycleType } from "../types";

export class CustomerService {
    static readonly customerRepository = AppDataSource.getRepository(Customer);
    static readonly motorcycleRepository = AppDataSource.getRepository(Motorcycle);

    static create = async (data: CustomerWithMotorcycleType) => {
        return await AppDataSource.transaction(async manager => {
            try {
                // Check for duplicate motorcycle plate
                const existingMotorcycle = await manager.findOne(Motorcycle, {
                    where: { plate: data.motorcycle_plate }
                });

                if (existingMotorcycle) {
                    throw new BadRequestError("Ya existe una motocicleta con esta placa");
                }

                // Check for duplicate customer email (if provided)
                if (data.customer_email) {
                    const existingCustomerByEmail = await manager.findOne(Customer, {
                        where: { email: data.customer_email }
                    });

                    if (existingCustomerByEmail) {
                        throw new BadRequestError("Ya existe un cliente con este correo electrónico");
                    }
                }

                // Check for duplicate customer phone
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
    };

    static getAll = async () => {
        try {
            const customers = await this.customerRepository.find({
                relations: ["motorcycle", "motorcycle.brand", "motorcycle.model"],
                order: { created_at: "DESC" }
            });
            return customers;
        } catch (error) {
            console.log(error);
            throw new InternalServerError("Error al obtener clientes");
        }
    };

    static getById = async (id: string) => {
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
    };

    static update = async (id: string, data: Partial<CustomerWithMotorcycleType>) => {
        return await AppDataSource.transaction(async manager => {
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
    };

    static delete = async (id: string) => {
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