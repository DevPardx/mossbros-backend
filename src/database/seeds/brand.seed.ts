import { AppDataSource } from "../../config/typeorm";
import { Brand } from "../../entities/Brand.entity";

export async function seedBrands() {
    const brandRepository = AppDataSource.getRepository(Brand);

    const existingBrands = await brandRepository.count();
    if (existingBrands > 0) {
        console.log("Brands already seeded");
        return;
    }

    const brands = [
        {
            name: "Serpento",
            logo_url: "https://res.cloudinary.com/dmy3s8j5w/image/upload/v1760850899/serpento_logo_tgblqf.webp",
            is_active: true
        },
        {
            name: "Freedom",
            logo_url: "https://res.cloudinary.com/dmy3s8j5w/image/upload/v1760850890/freedom_logo_pz7jac.webp",
            is_active: true
        },
        {
            name: "Yamaha",
            logo_url: "https://res.cloudinary.com/dmy3s8j5w/image/upload/v1760850900/yamaha_logo_rwruph.webp",
            is_active: true
        },
        {
            name: "Honda",
            logo_url: "https://res.cloudinary.com/dmy3s8j5w/image/upload/v1760850893/honda_logo_wxv1ln.webp",
            is_active: true
        },
        {
            name: "Hero",
            logo_url: "https://res.cloudinary.com/dmy3s8j5w/image/upload/v1760850892/hero_logo_t29ugu.webp",
            is_active: true
        },
        {
            name: "Benelli",
            logo_url: "https://res.cloudinary.com/dmy3s8j5w/image/upload/v1760850889/benelli_logo_wyaojd.webp",
            is_active: true
        },
        {
            name: "Kawasaki",
            logo_url: "https://res.cloudinary.com/dmy3s8j5w/image/upload/v1760850893/kawasaki_logo_tpmc43.webp",
            is_active: true
        },
        {
            name: "Suzuki",
            logo_url: "https://res.cloudinary.com/dmy3s8j5w/image/upload/v1760850899/suzuki_logo_kses8i.webp",
            is_active: true
        },
        {
            name: "BMW",
            logo_url: "https://res.cloudinary.com/dmy3s8j5w/image/upload/v1760850889/bmw_logo_c68evr.webp",
            is_active: true
        },
        {
            name: "Ducati",
            logo_url: "https://res.cloudinary.com/dmy3s8j5w/image/upload/v1760850890/ducati_logo_dobig0.webp",
            is_active: true
        },
        {
            name: "KTM",
            logo_url: "https://res.cloudinary.com/dmy3s8j5w/image/upload/v1760850894/ktm_logo_sigqtn.webp",
            is_active: true
        },
        {
            name: "Harley Davidson",
            logo_url: "https://res.cloudinary.com/dmy3s8j5w/image/upload/v1760850891/harley_davidson_logo_euwmz1.webp",
            is_active: true
        }
    ];

    const createdBrands = brandRepository.create(brands);
    await brandRepository.save(createdBrands);

    console.log("✅ Brands seeded successfully");
    return createdBrands;
}