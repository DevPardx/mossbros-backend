import { AppDataSource } from "../../config/typeorm";
import { Model } from "../../entities/Model.entity";
import { Brand } from "../../entities/Brand.entity";

export async function seedModels() {
    const modelRepository = AppDataSource.getRepository(Model);
    const brandRepository = AppDataSource.getRepository(Brand);

    const existingModels = await modelRepository.count();
    if (existingModels > 0) {
        console.log("Models already seeded");
        return;
    }

    const brands = await brandRepository.find();
    
    if (brands.length === 0) {
        console.log("❌ No brands found. Please seed brands first.");
        return;
    }

    const serpento = brands.find(b => b.name === "Serpento");
    const freedom = brands.find(b => b.name === "Freedom");
    const yamaha = brands.find(b => b.name === "Yamaha");
    const honda = brands.find(b => b.name === "Honda");
    const hero = brands.find(b => b.name === "Hero");
    const benelli = brands.find(b => b.name === "Benelli");
    const kawasaki = brands.find(b => b.name === "Kawasaki");
    const suzuki = brands.find(b => b.name === "Suzuki");
    const bmw = brands.find(b => b.name === "BMW");
    const ducati = brands.find(b => b.name === "Ducati");
    const ktm = brands.find(b => b.name === "KTM");
    const harley = brands.find(b => b.name === "Harley Davidson");

    const models = [];

    if (serpento) {
        models.push(
            { name: "RT 200", brand_id: serpento.id, is_active: true },
            { name: "RT 150", brand_id: serpento.id, is_active: true },
            { name: "CR 250", brand_id: serpento.id, is_active: true }
        );
    }

    if (freedom) {
        models.push(
            { name: "Rider 200", brand_id: freedom.id, is_active: true },
            { name: "Cruiser 150", brand_id: freedom.id, is_active: true },
            { name: "Sport 250", brand_id: freedom.id, is_active: true }
        );
    }

    if (yamaha) {
        models.push(
            { name: "YZF-R1", brand_id: yamaha.id, is_active: true },
            { name: "YZF-R6", brand_id: yamaha.id, is_active: true },
            { name: "MT-07", brand_id: yamaha.id, is_active: true },
            { name: "MT-09", brand_id: yamaha.id, is_active: true },
            { name: "FZ-S", brand_id: yamaha.id, is_active: true },
            { name: "XSR 700", brand_id: yamaha.id, is_active: true }
        );
    }

    if (honda) {
        models.push(
            { name: "CBR600RR", brand_id: honda.id, is_active: true },
            { name: "CBR1000RR", brand_id: honda.id, is_active: true },
            { name: "CB650R", brand_id: honda.id, is_active: true },
            { name: "CRF450L", brand_id: honda.id, is_active: true },
            { name: "PCX 150", brand_id: honda.id, is_active: true },
            { name: "Gold Wing", brand_id: honda.id, is_active: true }
        );
    }

    if (hero) {
        models.push(
            { name: "Splendor Plus", brand_id: hero.id, is_active: true },
            { name: "HF Deluxe", brand_id: hero.id, is_active: true },
            { name: "Passion Pro", brand_id: hero.id, is_active: true },
            { name: "Xpulse 200", brand_id: hero.id, is_active: true },
            { name: "Destini 125", brand_id: hero.id, is_active: true }
        );
    }

    if (benelli) {
        models.push(
            { name: "TNT 300", brand_id: benelli.id, is_active: true },
            { name: "Leoncino 500", brand_id: benelli.id, is_active: true },
            { name: "TRK 502", brand_id: benelli.id, is_active: true },
            { name: "502C", brand_id: benelli.id, is_active: true },
            { name: "TNT 600i", brand_id: benelli.id, is_active: true }
        );
    }

    if (kawasaki) {
        models.push(
            { name: "Ninja ZX-10R", brand_id: kawasaki.id, is_active: true },
            { name: "Ninja 650", brand_id: kawasaki.id, is_active: true },
            { name: "Z900", brand_id: kawasaki.id, is_active: true },
            { name: "Versys 650", brand_id: kawasaki.id, is_active: true }
        );
    }

    if (suzuki) {
        models.push(
            { name: "GSX-R1000", brand_id: suzuki.id, is_active: true },
            { name: "GSX-S750", brand_id: suzuki.id, is_active: true },
            { name: "V-Strom 650", brand_id: suzuki.id, is_active: true },
            { name: "Hayabusa", brand_id: suzuki.id, is_active: true }
        );
    }

    if (bmw) {
        models.push(
            { name: "S1000RR", brand_id: bmw.id, is_active: true },
            { name: "R1250GS", brand_id: bmw.id, is_active: true },
            { name: "F850GS", brand_id: bmw.id, is_active: true },
            { name: "R nineT", brand_id: bmw.id, is_active: true }
        );
    }

    if (ducati) {
        models.push(
            { name: "Panigale V4", brand_id: ducati.id, is_active: true },
            { name: "Monster 821", brand_id: ducati.id, is_active: true },
            { name: "Multistrada V4", brand_id: ducati.id, is_active: true },
            { name: "Scrambler Icon", brand_id: ducati.id, is_active: true }
        );
    }

    if (ktm) {
        models.push(
            { name: "390 Duke", brand_id: ktm.id, is_active: true },
            { name: "790 Duke", brand_id: ktm.id, is_active: true },
            { name: "890 Duke R", brand_id: ktm.id, is_active: true },
            { name: "1290 Super Duke R", brand_id: ktm.id, is_active: true },
            { name: "390 Adventure", brand_id: ktm.id, is_active: true },
            { name: "890 Adventure", brand_id: ktm.id, is_active: true },
            { name: "1290 Super Adventure S", brand_id: ktm.id, is_active: true },
            { name: "RC 390", brand_id: ktm.id, is_active: true },
            { name: "RC 200", brand_id: ktm.id, is_active: true },
            { name: "250 Duke", brand_id: ktm.id, is_active: true },
            { name: "690 SMC R", brand_id: ktm.id, is_active: true },
            { name: "1290 Super Duke GT", brand_id: ktm.id, is_active: true }
        );
    }

    if (harley) {
        models.push(
            { name: "Street Glide", brand_id: harley.id, is_active: true },
            { name: "Road Glide", brand_id: harley.id, is_active: true },
            { name: "Sportster S", brand_id: harley.id, is_active: true },
            { name: "Fat Boy", brand_id: harley.id, is_active: true },
            { name: "Iron 883", brand_id: harley.id, is_active: true },
            { name: "Forty-Eight", brand_id: harley.id, is_active: true },
            { name: "Street Bob", brand_id: harley.id, is_active: true },
            { name: "Low Rider S", brand_id: harley.id, is_active: true },
            { name: "Heritage Classic", brand_id: harley.id, is_active: true },
            { name: "Road King", brand_id: harley.id, is_active: true },
            { name: "Nightster", brand_id: harley.id, is_active: true }
        );
    }

    const createdModels = modelRepository.create(models);
    await modelRepository.save(createdModels);

    console.log(`✅ ${models.length} Models seeded successfully`);
    return createdModels;
}