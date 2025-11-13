import { Repository } from "typeorm";
import { ModelService } from "../../../services/model.service";
import { Model } from "../../../entities";
import { CacheService, CacheKeys } from "../../../utils/cache";
import { BadRequestError } from "../../../handler/error.handler";

jest.mock("../../../utils/cache", () => ({
  CacheService: {
    getOrSet: jest.fn(),
    del: jest.fn(),
    delPattern: jest.fn(),
  },
  CacheKeys: {
    model: (id: string) => `model:${id}`,
    models: (brandId?: string) => brandId ? `models:brand:${brandId}` : "models:all",
  },
  CacheTTL: {
    LONG: 3600,
  },
}));

const mockedCacheService = CacheService as jest.Mocked<typeof CacheService>;

describe("ModelService", () => {
  let modelService: ModelService;
  let mockModelRepository: jest.Mocked<Repository<Model>>;

  beforeEach(() => {
    mockModelRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      remove: jest.fn(),
    } as any;

    modelService = new ModelService(mockModelRepository);
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new model successfully", async () => {
      const modelData = { name: "CG 160", brand_id: "brand-1" };
      const newModel = { id: "model-1", ...modelData };

      mockModelRepository.findOneBy.mockResolvedValue(null);
      mockModelRepository.create.mockReturnValue(newModel as Model);
      mockModelRepository.save.mockResolvedValue(newModel as Model);

      const result = await modelService.create(modelData);

      expect(mockModelRepository.findOneBy).toHaveBeenCalledWith({
        name: modelData.name.trim().toLowerCase(),
      });
      expect(mockModelRepository.create).toHaveBeenCalledWith(modelData);
      expect(mockModelRepository.save).toHaveBeenCalledWith(newModel);
      expect(mockedCacheService.delPattern).toHaveBeenCalledWith("models:brand:brand-1");
      expect(mockedCacheService.del).toHaveBeenCalledWith(CacheKeys.models());
      expect(result).toBe("El modelo CG 160 ha sido creado");
    });

    it("should throw error when model already exists", async () => {
      const modelData = { name: "CG 160", brand_id: "brand-1" };
      const existingModel = { id: "model-1", ...modelData };

      mockModelRepository.findOneBy.mockResolvedValue(existingModel as Model);

      await expect(modelService.create(modelData)).rejects.toThrow(BadRequestError);
      await expect(modelService.create(modelData)).rejects.toThrow(
        "Un modelo con ese nombre ya existe"
      );
      expect(mockModelRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("getAll", () => {
    it("should return all models for a brand", async () => {
      const brandId = "brand-1";
      const models = [
        { id: "model-1", name: "CG 160", brand_id: brandId },
        { id: "model-2", name: "CB 190", brand_id: brandId },
      ];

      mockedCacheService.getOrSet.mockResolvedValue(models as any);

      const result = await modelService.getAll({ brand_id: brandId });

      expect(result).toEqual(models);
      expect(mockedCacheService.getOrSet).toHaveBeenCalledWith(
        CacheKeys.models(brandId),
        expect.any(Function),
        3600
      );
    });

    it("should fetch from database when cache misses", async () => {
      const brandId = "brand-1";
      const models = [
        { id: "model-1", name: "CG 160", brand_id: brandId },
      ];

      mockModelRepository.find.mockResolvedValue(models as Model[]);
      mockedCacheService.getOrSet.mockImplementation(async (_key, fetchFn) => {
        return await fetchFn();
      });

      const result = await modelService.getAll({ brand_id: brandId });

      expect(result).toEqual(models);
      expect(mockModelRepository.find).toHaveBeenCalledWith({
        where: { brand: { id: brandId } },
        relations: { brand: true },
      });
    });
  });

  describe("getById", () => {
    it("should return model by id", async () => {
      const modelData = {
        id: "model-1",
        brand_id: "brand-1",
      };
      const model = {
        id: "model-1",
        name: "CG 160",
        brand_id: "brand-1",
      };

      mockedCacheService.getOrSet.mockResolvedValue(model as any);

      const result = await modelService.getById(modelData);

      expect(result).toEqual(model);
      expect(mockedCacheService.getOrSet).toHaveBeenCalledWith(
        CacheKeys.model("model-1"),
        expect.any(Function),
        3600
      );
    });

    it("should throw error when model not found", async () => {
      mockedCacheService.getOrSet.mockResolvedValue(null);

      await expect(
        modelService.getById({ id: "model-999", brand_id: "brand-1" })
      ).rejects.toThrow(BadRequestError);
      await expect(
        modelService.getById({ id: "model-999", brand_id: "brand-1" })
      ).rejects.toThrow("Modelo no encontrado");
    });
  });

  describe("update", () => {
    it("should update model successfully", async () => {
      const updateData = {
        id: "model-1",
        name: "CG 160 Updated",
        brand_id: "brand-1",
        is_active: false,
      };
      const existingModel = {
        id: "model-1",
        name: "CG 160",
        brand_id: "brand-1",
        is_active: true,
      };

      mockModelRepository.findOneBy
        .mockResolvedValueOnce(existingModel as Model) // First call for finding model
        .mockResolvedValueOnce(null); // Second call for checking name

      mockModelRepository.save.mockResolvedValue({
        ...existingModel,
        ...updateData,
      } as Model);

      const result = await modelService.update(updateData);

      expect(mockModelRepository.findOneBy).toHaveBeenCalledWith({ id: "model-1" });
      expect(mockModelRepository.save).toHaveBeenCalled();
      expect(mockedCacheService.del).toHaveBeenCalledWith(CacheKeys.model("model-1"));
      expect(mockedCacheService.delPattern).toHaveBeenCalledWith("models:brand:brand-1");
      expect(result).toBe("El modelo CG 160 Updated ha sido actualizado");
    });

    it("should throw error when model not found", async () => {
      const updateData = {
        id: "model-999",
        name: "CG 160",
        brand_id: "brand-1",
        is_active: true,
      };

      mockModelRepository.findOneBy.mockResolvedValue(null);

      await expect(modelService.update(updateData)).rejects.toThrow(BadRequestError);
      await expect(modelService.update(updateData)).rejects.toThrow(
        "Modelo no encontrado"
      );
    });

    it("should throw error when name already exists for another model", async () => {
      const updateData = {
        id: "model-1",
        name: "cg 160",
        brand_id: "brand-1",
        is_active: true,
      };
      const existingModel = {
        id: "model-1",
        name: "CG 125",
        brand_id: "brand-1",
      };
      const conflictingModel = {
        id: "model-2",
        name: "cg 160",
        brand_id: "brand-1",
      };

      mockModelRepository.findOneBy
        .mockResolvedValueOnce(existingModel as Model)
        .mockResolvedValueOnce(conflictingModel as Model);

      const promise = modelService.update(updateData);

      await expect(promise).rejects.toThrow(BadRequestError);
      await expect(promise).rejects.toThrow("Otro modelo con ese nombre ya existe");
    });

    it("should clear cache for both brands when brand changes", async () => {
      const updateData = {
        id: "model-1",
        name: "CG 160",
        brand_id: "brand-2",
        is_active: true,
      };
      const existingModel = {
        id: "model-1",
        name: "CG 160",
        brand_id: "brand-1",
        is_active: true,
      };

      mockModelRepository.findOneBy
        .mockResolvedValueOnce(existingModel as Model)
        .mockResolvedValueOnce(null);

      mockModelRepository.save.mockResolvedValue(updateData as Model);

      await modelService.update(updateData);

      expect(mockedCacheService.delPattern).toHaveBeenCalledWith("models:brand:brand-1");
      expect(mockedCacheService.delPattern).toHaveBeenCalledWith("models:brand:brand-2");
    });
  });

  describe("delete", () => {
    it("should delete model successfully", async () => {
      const model = {
        id: "model-1",
        name: "CG 160",
        brand_id: "brand-1",
      };

      mockModelRepository.findOneBy.mockResolvedValue(model as Model);
      mockModelRepository.remove.mockResolvedValue(model as Model);

      const result = await modelService.delete({ id: "model-1" });

      expect(mockModelRepository.findOneBy).toHaveBeenCalledWith({ id: "model-1" });
      expect(mockModelRepository.remove).toHaveBeenCalledWith(model);
      expect(mockedCacheService.del).toHaveBeenCalledWith(CacheKeys.model("model-1"));
      expect(mockedCacheService.delPattern).toHaveBeenCalledWith("models:brand:brand-1");
      expect(mockedCacheService.del).toHaveBeenCalledWith(CacheKeys.models());
      expect(result).toBe("El modelo CG 160 ha sido eliminado");
    });

    it("should throw error when model not found", async () => {
      mockModelRepository.findOneBy.mockResolvedValue(null);

      await expect(modelService.delete({ id: "model-999" })).rejects.toThrow(
        BadRequestError
      );
      await expect(modelService.delete({ id: "model-999" })).rejects.toThrow(
        "Modelo no encontrado"
      );
    });
  });
});
