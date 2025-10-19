import { AppDataSource } from "../../config/typeorm";
import { Customer } from "../../entities/Customer.entity";

export async function seedCustomers() {
    const customerRepository = AppDataSource.getRepository(Customer);

    const existingCustomers = await customerRepository.count();
    if (existingCustomers > 0) {
        console.log("Customers already seeded");
        return;
    }

    const customersData = [
        {
            name: "Jorge Pardo",
            phone: "+503 7789-0152",
            email: "jorge@gmail.com"
        },
        {
            name: "María Elena Rodríguez",
            phone: "+503 7654-3210",
            email: "maria.rodriguez@hotmail.com"
        },
        {
            name: "Carlos Antonio Mejía",
            phone: "+503 2234-5678",
            email: "carlos.mejia@gmail.com"
        },
        {
            name: "Ana Sofía Hernández",
            phone: "+503 7896-1234",
            email: "ana.hernandez@yahoo.com"
        },
        {
            name: "Roberto José García",
            phone: "+503 2345-6789",
            email: "roberto.garcia@outlook.com"
        },
        {
            name: "Claudia Patricia López",
            phone: "+503 7567-8901",
            email: "claudia.lopez@gmail.com"
        },
        {
            name: "Fernando Alejandro Cruz",
            phone: "+503 2456-7890",
            email: "fernando.cruz@hotmail.com"
        },
        {
            name: "Gabriela Monserrat Silva",
            phone: "+503 7678-9012",
            email: "gabriela.silva@gmail.com"
        },
        {
            name: "Diego Ernesto Morales",
            phone: "+503 2567-8901"
        },
        {
            name: "Vanessa Carolina Ramos",
            phone: "+503 7789-0123",
            email: "vanessa.ramos@yahoo.com"
        },
        {
            name: "Miguel Ángel Flores",
            phone: "+503 2678-9012",
            email: "miguel.flores@gmail.com"
        },
        {
            name: "Sandra Elizabeth Torres",
            phone: "+503 7890-1234",
            email: "sandra.torres@hotmail.com"
        },
        {
            name: "José Manuel Castillo",
            phone: "+503 2789-0123"
        },
        {
            name: "Patricia Alejandra Vega",
            phone: "+503 7901-2345",
            email: "patricia.vega@outlook.com"
        },
        {
            name: "Ricardo Daniel Mendoza",
            phone: "+503 2890-1234",
            email: "ricardo.mendoza@gmail.com"
        },
        {
            name: "Lorena Beatriz Jiménez",
            phone: "+503 7012-3456",
            email: "lorena.jimenez@yahoo.com"
        },
        {
            name: "Arturo Enrique Salazar",
            phone: "+503 2012-3456"
        },
        {
            name: "Carmen Rosa Aguilar",
            phone: "+503 7123-4567",
            email: "carmen.aguilar@hotmail.com"
        },
        {
            name: "Sergio Alberto Navarro",
            phone: "+503 2123-4567",
            email: "sergio.navarro@gmail.com"
        },
        {
            name: "Melissa Andrea Peña",
            phone: "+503 7234-5678",
            email: "melissa.pena@outlook.com"
        },
        {
            name: "Gustavo René Chávez",
            phone: "+503 2234-5678",
            email: "gustavo.chavez@yahoo.com"
        },
        {
            name: "Silvia Margarita Ortega",
            phone: "+503 7345-6789"
        },
        {
            name: "Raúl Eduardo Vargas",
            phone: "+503 2345-6789",
            email: "raul.vargas@gmail.com"
        },
        {
            name: "Mónica Isabel Reyes",
            phone: "+503 7456-7890",
            email: "monica.reyes@hotmail.com"
        },
        {
            name: "Oscar Mauricio Santos",
            phone: "+503 2456-7890",
            email: "oscar.santos@outlook.com"
        }
    ];    console.log("Creating customers...");

    const customers = customerRepository.create(customersData);
    const savedCustomers = await customerRepository.save(customers);

    savedCustomers.forEach((customer) => {
        console.log(`✅ Created customer: ${customer.name} - ${customer.phone}`);
    });

    console.log(`✅ ${savedCustomers.length} Customers seeded successfully`);
    return savedCustomers;
}