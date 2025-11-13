import { Repository } from "typeorm";
import { ServiceService } from "../../../services/service.service";
import { Service } from "../../../entities";
import { CacheService, CacheKeys } from "../../../utils/cache";
import {
  BadRequestError,
  NotFoundError,
  InternalServerError,
} from "../../../handler/error.handler";

jest.mock("../../../utils/cache", () => ({
  CacheService: {
    getOrSet: jest.fn(),
    del: jest.fn(),
  },
  CacheKeys: {
    service: (id: string) => `service:${id}`,
    services: () => "services:all",
  },
  CacheTTL: {
    LONG: 3600,
  },
}));

const mockedCacheService = CacheService as jest.Mocked<typeof CacheService>;

describe("ServiceService", () => {
  let serviceService: ServiceService;
  let mockServiceRepository: jest.Mocked<Repository<Service>>;

  beforeEach(() => {
    mockServiceRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOneBy: jest.fn(),
      remove: jest.fn(),
    } as any;

    serviceService = new ServiceService(mockServiceRepository);
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new service successfully", async () => {
      const serviceData = { name: "Cambio de Aceite", price: 50000 };
      const newService = { id: "service-1", ...serviceData };

      mockServiceRepository.findOneBy.mockResolvedValue(null);
      mockServiceRepository.create.mockReturnValue(newService as Service);
      mockServiceRepository.save.mockResolvedValue(newService as Service);

      const result = await serviceService.create(serviceData);

      expect(mockServiceRepository.findOneBy).toHaveBeenCalledWith({
        name: serviceData.name.trim().toLowerCase(),
      });
      expect(mockServiceRepository.create).toHaveBeenCalledWith(serviceData);
      expect(mockServiceRepository.save).toHaveBeenCalledWith(newService);
      expect(mockedCacheService.del).toHaveBeenCalledWith(CacheKeys.services());
      expect(result).toBe("El servicio Cambio de Aceite ha sido creado");
    });

    it("should throw error when service already exists", async () => {
      const serviceData = { name: "Cambio de Aceite", price: 50000 };
      const existingService = { id: "service-1", ...serviceData };

      mockServiceRepository.findOneBy.mockResolvedValue(existingService as Service);

      await expect(serviceService.create(serviceData)).rejects.toThrow(
        BadRequestError
      );
      await expect(serviceService.create(serviceData)).rejects.toThrow(
        "Un servicio con ese nombre ya existe"
      );
      expect(mockServiceRepository.create).not.toHaveBeenCalled();
    });

    it("should throw InternalServerError on unexpected error", async () => {
      const serviceData = { name: "Cambio de Aceite", price: 50000 };

      mockServiceRepository.findOneBy.mockRejectedValue(
        new Error("Database error")
      );

      await expect(serviceService.create(serviceData)).rejects.toThrow(
        InternalServerError
      );
    });
  });

  describe("getAll", () => {
    it("should return all services from cache or database", async () => {
      const services = [
        { id: "service-1", name: "Cambio de Aceite", price: 50000, is_active: true },
        { id: "service-2", name: "Reparación", price: 100000, is_active: true },
      ];

      mockedCacheService.getOrSet.mockResolvedValue(services as any);

      const result = await serviceService.getAll();

      expect(result).toEqual(services);
      expect(mockedCacheService.getOrSet).toHaveBeenCalledWith(
        CacheKeys.services(),
        expect.any(Function),
        3600
      );
    });

    it("should fetch from database when cache misses", async () => {
      const services = [
        { id: "service-1", name: "Cambio de Aceite", price: 50000, is_active: true },
      ];

      mockServiceRepository.find.mockResolvedValue(services as Service[]);
      mockedCacheService.getOrSet.mockImplementation(async (_key, fetchFn) => {
        return await fetchFn();
      });

      const result = await serviceService.getAll();

      expect(result).toEqual(services);
      expect(mockServiceRepository.find).toHaveBeenCalled();
    });

    it("should throw InternalServerError on unexpected error", async () => {
      mockedCacheService.getOrSet.mockRejectedValue(new Error("Cache error"));

      await expect(serviceService.getAll()).rejects.toThrow(InternalServerError);
      await expect(serviceService.getAll()).rejects.toThrow(
        "Ocurrió un error al obtener los servicios"
      );
    });
  });

  describe("getById", () => {
    it("should return service by id from cache or database", async () => {
      const service = {
        id: "service-1",
        name: "Cambio de Aceite",
        price: 50000,
        is_active: true,
      };

      mockedCacheService.getOrSet.mockResolvedValue(service as any);

      const result = await serviceService.getById({ id: "service-1" });

      expect(result).toEqual(service);
      expect(mockedCacheService.getOrSet).toHaveBeenCalledWith(
        CacheKeys.service("service-1"),
        expect.any(Function),
        3600
      );
    });

    it("should throw NotFoundError when service not found", async () => {
      mockedCacheService.getOrSet.mockResolvedValue(null);

      await expect(serviceService.getById({ id: "service-999" })).rejects.toThrow(
        NotFoundError
      );
      await expect(serviceService.getById({ id: "service-999" })).rejects.toThrow(
        "Servicio no encontrado"
      );
    });

    it("should throw InternalServerError on unexpected error", async () => {
      mockedCacheService.getOrSet.mockRejectedValue(new Error("Cache error"));

      await expect(serviceService.getById({ id: "service-1" })).rejects.toThrow(
        InternalServerError
      );
      await expect(serviceService.getById({ id: "service-1" })).rejects.toThrow(
        "Ocurrió un error al obtener el servicio"
      );
    });
  });

  describe("update", () => {
    it("should update service successfully", async () => {
      const updateData = {
        id: "service-1",
        name: "Cambio de Aceite Updated",
        price: 60000,
        is_active: false,
      };
      const existingService = {
        id: "service-1",
        name: "Cambio de Aceite",
        price: 50000,
        is_active: true,
      };

      mockServiceRepository.findOneBy.mockResolvedValue(existingService as Service);
      mockServiceRepository.save.mockResolvedValue({
        ...existingService,
        ...updateData,
      } as Service);

      const result = await serviceService.update(updateData);

      expect(mockServiceRepository.findOneBy).toHaveBeenCalledWith({
        id: "service-1",
      });
      expect(mockServiceRepository.save).toHaveBeenCalled();
      expect(mockedCacheService.del).toHaveBeenCalledWith(
        CacheKeys.service("service-1")
      );
      expect(mockedCacheService.del).toHaveBeenCalledWith(CacheKeys.services());
      expect(result).toBe("El servicio ha sido actualizado");
    });

    it("should throw NotFoundError when service not found", async () => {
      const updateData = {
        id: "service-999",
        name: "Cambio de Aceite",
        price: 50000,
        is_active: true,
      };

      mockServiceRepository.findOneBy.mockResolvedValue(null);

      await expect(serviceService.update(updateData)).rejects.toThrow(
        NotFoundError
      );
      await expect(serviceService.update(updateData)).rejects.toThrow(
        "Servicio no encontrado"
      );
    });

    it("should throw InternalServerError on unexpected error", async () => {
      const updateData = {
        id: "service-1",
        name: "Cambio de Aceite",
        price: 50000,
        is_active: true,
      };

      mockServiceRepository.findOneBy.mockRejectedValue(
        new Error("Database error")
      );

      await expect(serviceService.update(updateData)).rejects.toThrow(
        InternalServerError
      );
    });
  });

  describe("delete", () => {
    it("should delete service successfully", async () => {
      const service = {
        id: "service-1",
        name: "Cambio de Aceite",
        price: 50000,
        is_active: true,
      };

      mockServiceRepository.findOneBy.mockResolvedValue(service as Service);
      mockServiceRepository.remove.mockResolvedValue(service as Service);

      const result = await serviceService.delete({ id: "service-1" });

      expect(mockServiceRepository.findOneBy).toHaveBeenCalledWith({
        id: "service-1",
      });
      expect(mockServiceRepository.remove).toHaveBeenCalledWith(service);
      expect(mockedCacheService.del).toHaveBeenCalledWith(
        CacheKeys.service("service-1")
      );
      expect(mockedCacheService.del).toHaveBeenCalledWith(CacheKeys.services());
      expect(result).toBe("El servicio Cambio de Aceite ha sido eliminado");
    });

    it("should throw NotFoundError when service not found", async () => {
      mockServiceRepository.findOneBy.mockResolvedValue(null);

      await expect(serviceService.delete({ id: "service-999" })).rejects.toThrow(
        NotFoundError
      );
      await expect(serviceService.delete({ id: "service-999" })).rejects.toThrow(
        "Servicio no encontrado"
      );
    });

    it("should throw InternalServerError on unexpected error", async () => {
      mockServiceRepository.findOneBy.mockRejectedValue(
        new Error("Database error")
      );

      await expect(serviceService.delete({ id: "service-1" })).rejects.toThrow(
        InternalServerError
      );
      await expect(serviceService.delete({ id: "service-1" })).rejects.toThrow(
        "Ocurrió un error al eliminar el servicio"
      );
    });
  });
});
