import { Repository } from "typeorm";
import { BrandService } from "../../../services/brand.service";
import { Brand } from "../../../entities/Brand.entity";
import { CacheService, CacheKeys } from "../../../utils/cache";
import { BadRequestError, NotFoundError } from "../../../handler/error.handler";

jest.mock("../../../utils/cache", () => ({
  CacheService: {
    getOrSet: jest.fn(),
    del: jest.fn(),
    delPattern: jest.fn(),
  },
  CacheKeys: {
    brand: (id: string) => `brand:${id}`,
    brands: () => "brands:all",
  },
  CacheTTL: {
    LONG: 3600,
  },
}));

const mockedCacheService = CacheService as jest.Mocked<typeof CacheService>;

describe("BrandService", () => {
  let brandService: BrandService;
  let mockBrandRepository: jest.Mocked<Repository<Brand>>;

  beforeEach(() => {
    mockBrandRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOneBy: jest.fn(),
      remove: jest.fn(),
    } as any;

    brandService = new BrandService(mockBrandRepository);
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new brand successfully", async () => {
      const brandData = { name: "Samsung", logo_url: "https://example.com/logo.png" };
      const newBrand = { id: "brand-1", ...brandData };

      mockBrandRepository.findOneBy.mockResolvedValue(null);
      mockBrandRepository.create.mockReturnValue(newBrand as Brand);
      mockBrandRepository.save.mockResolvedValue(newBrand as Brand);

      const result = await brandService.create(brandData);

      expect(mockBrandRepository.findOneBy).toHaveBeenCalledWith({
        name: brandData.name.trim().toLowerCase(),
      });
      expect(mockBrandRepository.create).toHaveBeenCalledWith(brandData);
      expect(mockBrandRepository.save).toHaveBeenCalledWith(newBrand);
      expect(mockedCacheService.delPattern).toHaveBeenCalledWith("brands:*");
      expect(result).toBe("La marca Samsung ha sido creada");
    });

    it("should throw error when brand already exists", async () => {
      const brandData = { name: "Samsung", logo_url: "https://example.com/logo.png" };
      const existingBrand = { id: "brand-1", ...brandData };

      mockBrandRepository.findOneBy.mockResolvedValue(existingBrand as Brand);

      await expect(brandService.create(brandData)).rejects.toThrow(BadRequestError);
      await expect(brandService.create(brandData)).rejects.toThrow(
        "Una marca con ese nombre ya existe"
      );
      expect(mockBrandRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("getAll", () => {
    it("should return all brands from cache or database", async () => {
      const brands = [
        { id: "brand-1", name: "Samsung", logo_url: "url1", is_active: true },
        { id: "brand-2", name: "Apple", logo_url: "url2", is_active: true },
      ];

      mockedCacheService.getOrSet.mockResolvedValue(brands as any);

      const result = await brandService.getAll();

      expect(result).toEqual(brands);
      expect(mockedCacheService.getOrSet).toHaveBeenCalledWith(
        CacheKeys.brands(),
        expect.any(Function),
        3600
      );
    });

    it("should fetch from database when cache misses", async () => {
      const brands = [
        { id: "brand-1", name: "Samsung", logo_url: "url1", is_active: true },
      ];

      mockBrandRepository.find.mockResolvedValue(brands as Brand[]);
      mockedCacheService.getOrSet.mockImplementation(async (_key, fetchFn) => {
        return await fetchFn();
      });

      const result = await brandService.getAll();

      expect(result).toEqual(brands);
      expect(mockBrandRepository.find).toHaveBeenCalled();
    });
  });

  describe("getById", () => {
    it("should return brand by id from cache or database", async () => {
      const brand = {
        id: "brand-1",
        name: "Samsung",
        logo_url: "url1",
        is_active: true,
      };

      mockedCacheService.getOrSet.mockResolvedValue(brand as any);

      const result = await brandService.getById({ id: "brand-1" });

      expect(result).toEqual(brand);
      expect(mockedCacheService.getOrSet).toHaveBeenCalledWith(
        CacheKeys.brand("brand-1"),
        expect.any(Function),
        3600
      );
    });

    it("should throw NotFoundError when brand not found", async () => {
      mockedCacheService.getOrSet.mockResolvedValue(null);

      await expect(brandService.getById({ id: "brand-999" })).rejects.toThrow(
        NotFoundError
      );
      await expect(brandService.getById({ id: "brand-999" })).rejects.toThrow(
        "Marca no encontrado"
      );
    });
  });

  describe("update", () => {
    it("should update brand successfully", async () => {
      const brandData = {
        id: "brand-1",
        name: "Samsung Updated",
        logo_url: "new-url",
        is_active: false,
      };
      const existingBrand = {
        id: "brand-1",
        name: "Samsung",
        logo_url: "old-url",
        is_active: true,
      };

      mockBrandRepository.findOneBy.mockResolvedValue(existingBrand as Brand);
      mockBrandRepository.save.mockResolvedValue({
        ...existingBrand,
        ...brandData,
      } as Brand);

      const result = await brandService.update(brandData);

      expect(mockBrandRepository.findOneBy).toHaveBeenCalledWith({
        id: "brand-1",
      });
      expect(mockBrandRepository.save).toHaveBeenCalled();
      expect(mockedCacheService.delPattern).toHaveBeenCalledWith("brands:*");
      expect(mockedCacheService.del).toHaveBeenCalledWith(
        CacheKeys.brand("brand-1")
      );
      expect(result).toBe("La marca ha sido actualizada");
    });

    it("should throw NotFoundError when brand not found", async () => {
      const brandData = {
        id: "brand-999",
        name: "Samsung",
        logo_url: "url",
        is_active: true,
      };

      mockBrandRepository.findOneBy.mockResolvedValue(null);

      await expect(brandService.update(brandData)).rejects.toThrow(NotFoundError);
      await expect(brandService.update(brandData)).rejects.toThrow(
        "Marca no encontrado"
      );
    });
  });

  describe("delete", () => {
    it("should delete brand successfully", async () => {
      const brand = {
        id: "brand-1",
        name: "Samsung",
        logo_url: "url",
        is_active: true,
      };

      mockBrandRepository.findOneBy.mockResolvedValue(brand as Brand);
      mockBrandRepository.remove.mockResolvedValue(brand as Brand);

      const result = await brandService.delete({ id: "brand-1" });

      expect(mockBrandRepository.findOneBy).toHaveBeenCalledWith({
        id: "brand-1",
      });
      expect(mockBrandRepository.remove).toHaveBeenCalledWith(brand);
      expect(mockedCacheService.delPattern).toHaveBeenCalledWith("brands:*");
      expect(mockedCacheService.del).toHaveBeenCalledWith(
        CacheKeys.brand("brand-1")
      );
      expect(mockedCacheService.delPattern).toHaveBeenCalledWith(
        "models:brand:brand-1"
      );
      expect(result).toBe("La marca Samsung ha sido eliminada");
    });

    it("should throw NotFoundError when brand not found", async () => {
      mockBrandRepository.findOneBy.mockResolvedValue(null);

      await expect(brandService.delete({ id: "brand-999" })).rejects.toThrow(
        NotFoundError
      );
      await expect(brandService.delete({ id: "brand-999" })).rejects.toThrow(
        "Marca no encontrado"
      );
    });
  });
});
