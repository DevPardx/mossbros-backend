import { AppDataSource } from "../../config/typeorm";
import { RepairJob } from "../../entities/RepairJob.entity";
import { Motorcycle } from "../../entities/Motorcycle.entity";
import { Service } from "../../entities/Service.entity";
import { RepairStatus } from "../../enums";

export async function seedRepairJobs() {
    const repairJobRepository = AppDataSource.getRepository(RepairJob);
    const motorcycleRepository = AppDataSource.getRepository(Motorcycle);
    const serviceRepository = AppDataSource.getRepository(Service);

    const existingRepairJobs = await repairJobRepository.count();
    if (existingRepairJobs > 0) {
        console.log("Repair jobs already seeded");
        return;
    }

    const motorcycles = await motorcycleRepository.find({ take: 10 });
    const services = await serviceRepository.find();

    if (motorcycles.length === 0) {
        console.log("❌ No motorcycles found. Please seed motorcycles first.");
        return;
    }

    if (services.length === 0) {
        console.log("❌ No services found. Please seed services first.");
        return;
    }

    const getRandomServices = () => {
        const shuffled = services.sort(() => 0.5 - Math.random());
        const count = Math.floor(Math.random() * 3) + 1;
        return shuffled.slice(0, count);
    };

    const repairJobsData = [
        {
            status: RepairStatus.PENDING,
            notes: "Revisión general del motor y cambio de aceite",
        },
        {
            status: RepairStatus.IN_REPAIR,
            notes: "Reparación de frenos delanteros, piezas ordenadas",
            started_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
            status: RepairStatus.WAITING_FOR_PARTS,
            notes: "Esperando repuestos para el sistema eléctrico",
            started_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
        {
            status: RepairStatus.READY_FOR_PICKUP,
            notes: "Mantenimiento completo finalizado",
            started_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        {
            status: RepairStatus.COMPLETED,
            notes: "Cambio de llantas y alineación completa",
            started_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            completed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
        {
            status: RepairStatus.CANCELLED,
            notes: "Cliente decidió no proceder con la reparación",
        },
        {
            status: RepairStatus.PENDING,
            notes: "Diagnóstico inicial de problemas de transmisión",
        },
        {
            status: RepairStatus.IN_REPAIR,
            notes: "Reparación de carburador en progreso",
            started_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        }
    ];

    console.log("Creating repair jobs...");

    const repairJobs = [];
    for (let i = 0; i < Math.min(repairJobsData.length, motorcycles.length); i++) {
        const jobData = repairJobsData[i];
        const motorcycle = motorcycles[i];
        const jobServices = getRandomServices();

        const total_cost = jobServices.reduce((sum, service) => sum + Number(service.price), 0);

        const estimated_completion = new Date();
        estimated_completion.setDate(estimated_completion.getDate() + Math.floor(Math.random() * 7) + 3);

        const repairJob = repairJobRepository.create({
            motorcycle_id: motorcycle.id,
            status: jobData.status,
            notes: jobData.notes,
            total_cost,
            estimated_completion,
            started_at: jobData.started_at,
            completed_at: jobData.completed_at,
            services: jobServices
        });

        repairJobs.push(repairJob);
    }

    const savedRepairJobs = await repairJobRepository.save(repairJobs);

    savedRepairJobs.forEach((job, index) => {
        const motorcycle = motorcycles[index];
        console.log(`✅ Created repair job: ${job.status} for motorcycle ${motorcycle.plate} - Total: $${job.total_cost}`);
    });

    console.log(`✅ ${savedRepairJobs.length} Repair jobs seeded successfully`);
    return savedRepairJobs;
}