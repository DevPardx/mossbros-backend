import { AppDataSource } from "../../config/typeorm";
import { Service } from "../../entities/Service.entity";

export async function seedServices() {
    const serviceRepository = AppDataSource.getRepository(Service);

    const existingServices = await serviceRepository.count();
    if (existingServices > 0) {
        console.log("Services already seeded");
        return;
    }

    const servicesData = [
        {
            name: "Mantenimiento Básico",
            price: 25.00,
            is_active: true
        },
        {
            name: "Mantenimiento General",
            price: 45.00,
            is_active: true
        },
        {
            name: "Mantenimiento Plus",
            price: 75.00,
            is_active: true
        },
        {
            name: "Reparaciones Mecánicas",
            price: 80.00,
            is_active: true
        },
        {
            name: "Reparaciones Eléctricas",
            price: 65.00,
            is_active: true
        },
        {
            name: "Escaneo/Borrado Códigos",
            price: 15.00,
            is_active: true
        },
        {
            name: "Importación de Motocicletas",
            price: 150.00,
            is_active: true
        }
    ];

    console.log("Creating services...");

    const services = serviceRepository.create(servicesData);
    const savedServices = await serviceRepository.save(services);

    savedServices.forEach((service) => {
        console.log(`Created service: ${service.name} - $${service.price}`);
    });

    console.log(`${savedServices.length} Services seeded successfully`);
    return savedServices;
}