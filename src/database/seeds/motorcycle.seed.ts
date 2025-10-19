import { AppDataSource } from "../../config/typeorm";
import { Motorcycle } from "../../entities/Motorcycle.entity";
import { Customer } from "../../entities/Customer.entity";
import { Brand } from "../../entities/Brand.entity";
import { Model } from "../../entities/Model.entity";

export async function seedMotorcycles() {
    const motorcycleRepository = AppDataSource.getRepository(Motorcycle);
    const customerRepository = AppDataSource.getRepository(Customer);
    const brandRepository = AppDataSource.getRepository(Brand);
    const modelRepository = AppDataSource.getRepository(Model);

    const existingMotorcycles = await motorcycleRepository.count();
    if (existingMotorcycles > 0) {
        console.log("Motorcycles already seeded");
        return;
    }

    const customers = await customerRepository.find();
    const brands = await brandRepository.find();
    const models = await modelRepository.find();

    if (customers.length === 0) {
        console.log("❌ No customers found. Please seed customers first.");
        return;
    }

    if (brands.length === 0 || models.length === 0) {
        console.log("❌ No brands or models found. Please seed brands and models first.");
        return;
    }

    const getRandomBrandModel = () => {
        const randomBrand = brands[Math.floor(Math.random() * brands.length)];
        const compatibleModels = models.filter(m => m.brand_id === randomBrand.id);
        if (compatibleModels.length === 0) {
            return getRandomBrandModel();
        }
        const randomModel = compatibleModels[Math.floor(Math.random() * compatibleModels.length)];
        return { brand: randomBrand, model: randomModel };
    };

    const motorcyclePlates = [
        "M195357", "M482951", "M739182", "M582746", "M947385",
        "M394857", "M682934", "M158472", "M529863", "M847295",
        "M639741", "M472958", "M826394", "M593847", "M736529",
        "M482936", "M695847", "M829473", "M573849", "M947382",
        "M628495", "M394827", "M785394", "M529637", "M847293",
        "M384759", "M562847", "M739285", "M485729", "M639472",
        "M741852", "M963258", "M147369", "M258741", "M369852"
    ];

    console.log("Creating motorcycles...");

    const motorcycles = [];
    
    for (let i = 0; i < Math.min(customers.length, motorcyclePlates.length); i++) {
        const customer = customers[i];
        const { brand, model } = getRandomBrandModel();
        const plate = motorcyclePlates[i];

        const motorcycle = motorcycleRepository.create({
            plate: plate,
            customer_id: customer.id,
            brand_id: brand.id,
            model_id: model.id
        });

        motorcycles.push({
            motorcycle,
            customerName: customer.name,
            brandName: brand.name,
            modelName: model.name
        });
    }

    const savedMotorcycles = await motorcycleRepository.save(motorcycles.map(m => m.motorcycle));

    motorcycles.forEach((item) => {
        console.log(`✅ Created motorcycle: ${item.motorcycle.plate} for ${item.customerName} - ${item.brandName} ${item.modelName}`);
    });

    console.log(`✅ ${savedMotorcycles.length} Motorcycles seeded successfully`);
    return savedMotorcycles;
}