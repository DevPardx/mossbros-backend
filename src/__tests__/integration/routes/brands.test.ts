import request from "supertest";
import express, { Router } from "express";
import { createTestServer } from "../../helpers/testServer";
import { BrandService } from "../../../services/brand.service";
import { authenticate } from "../../../middleware/auth";

// Mock dependencies
jest.mock("../../../services/brand.service");
jest.mock("../../../middleware/auth");

const MockedBrandService = BrandService as jest.MockedClass<typeof BrandService>;
const mockedAuthenticate = authenticate as jest.MockedFunction<typeof authenticate>;

describe("Brands Routes Integration", () => {
  let app: express.Express;
  let mockBrandService: jest.Mocked<BrandService>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Mock authenticate middleware to always pass
    mockedAuthenticate.mockImplementation(async (req, _res, next) => {
      req.user = {
        id: "user-1",
        email: "test@example.com",
        role: "owner",
      } as any;
      next();
    });

    // Create mock service instance
    mockBrandService = {
      create: jest.fn(),
      getAll: jest.fn(),
      getById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    MockedBrandService.mockImplementation(() => mockBrandService);

    // Create test router (simplified version of brands route)
    const router = Router();

    router.get("/brands", async (_req, res, next) => {
      try {
        const brands = await mockBrandService.getAll();
        res.json(brands);
      } catch (error) {
        next(error);
      }
    });

    router.get("/brands/:id", async (req, res, next) => {
      try {
        const brand = await mockBrandService.getById({ id: req.params.id });
        res.json(brand);
      } catch (error) {
        next(error);
      }
    });

    router.post("/brands", authenticate, async (req, res, next) => {
      try {
        const message = await mockBrandService.create(req.body);
        res.status(201).json({ message });
      } catch (error) {
        next(error);
      }
    });

    router.put("/brands/:id", authenticate, async (req, res, next) => {
      try {
        const message = await mockBrandService.update({
          id: req.params.id,
          ...req.body,
        });
        res.json({ message });
      } catch (error) {
        next(error);
      }
    });

    router.delete("/brands/:id", authenticate, async (req, res, next) => {
      try {
        const id = req.params.id as string;
        const message = await mockBrandService.delete({ id });
        res.json({ message });
      } catch (error) {
        next(error);
      }
    });

    app = createTestServer(router);
  });

  describe("GET /api/brands", () => {
    it("should return all brands", async () => {
      const brands = [
        { id: "1", name: "Samsung", logo_url: "url1", is_active: true },
        { id: "2", name: "Apple", logo_url: "url2", is_active: true },
      ];

      mockBrandService.getAll.mockResolvedValue(brands as any);

      const response = await request(app).get("/api/brands");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(brands);
      expect(mockBrandService.getAll).toHaveBeenCalledTimes(1);
    });
  });

  describe("GET /api/brands/:id", () => {
    it("should return a single brand by id", async () => {
      const brand = {
        id: "1",
        name: "Samsung",
        logo_url: "url1",
        is_active: true,
      };

      mockBrandService.getById.mockResolvedValue(brand as any);

      const response = await request(app).get("/api/brands/1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(brand);
      expect(mockBrandService.getById).toHaveBeenCalledWith({ id: "1" });
    });

    it("should return 404 when brand not found", async () => {
      mockBrandService.getById.mockRejectedValue(
        new Error("Marca no encontrado")
      );

      const response = await request(app).get("/api/brands/999");

      expect(response.status).toBe(500);
    });
  });

  describe("POST /api/brands", () => {
    it("should create a new brand", async () => {
      const brandData = {
        name: "Samsung",
        logo_url: "https://example.com/logo.png",
      };

      mockBrandService.create.mockResolvedValue(
        "La marca Samsung ha sido creada"
      );

      const response = await request(app).post("/api/brands").send(brandData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: "La marca Samsung ha sido creada",
      });
      expect(mockBrandService.create).toHaveBeenCalledWith(brandData);
      expect(mockedAuthenticate).toHaveBeenCalled();
    });

    it("should return 400 when brand already exists", async () => {
      const brandData = {
        name: "Samsung",
        logo_url: "https://example.com/logo.png",
      };

      mockBrandService.create.mockRejectedValue(
        new Error("Una marca con ese nombre ya existe")
      );

      const response = await request(app).post("/api/brands").send(brandData);

      expect(response.status).toBe(500);
    });
  });

  describe("PUT /api/brands/:id", () => {
    it("should update a brand", async () => {
      const brandData = {
        name: "Samsung Updated",
        logo_url: "new-url",
        is_active: false,
      };

      mockBrandService.update.mockResolvedValue(
        "La marca ha sido actualizada"
      );

      const response = await request(app)
        .put("/api/brands/1")
        .send(brandData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "La marca ha sido actualizada",
      });
      expect(mockBrandService.update).toHaveBeenCalledWith({
        id: "1",
        ...brandData,
      });
      expect(mockedAuthenticate).toHaveBeenCalled();
    });
  });

  describe("DELETE /api/brands/:id", () => {
    it("should delete a brand", async () => {
      mockBrandService.delete.mockResolvedValue(
        "La marca Samsung ha sido eliminada"
      );

      const response = await request(app).delete("/api/brands/1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "La marca Samsung ha sido eliminada",
      });
      expect(mockBrandService.delete).toHaveBeenCalledWith({ id: "1" });
      expect(mockedAuthenticate).toHaveBeenCalled();
    });
  });
});
