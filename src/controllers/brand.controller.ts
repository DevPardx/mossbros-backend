import type { Request, Response } from "express";
import { BrandService } from "../services/brand.service";

export class BrandController {
  static create = async (req: Request, res: Response) => {
    try {
      const { name, logo_url } = req.body;
      const response = await BrandService.create({ name, logo_url });
      return res.status(201).json(response);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Error creating brand" });
    }
  };

  static getAll = async (req: Request, res: Response) => {
    try {
      const response = await BrandService.getAll();
      return res.status(200).json(response);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Error fetching brands" });
    }
  };

  static getById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const response = await BrandService.getById({id});
      return res.status(200).json(response);
    } catch (error) {
      console.log(error);
      return res.status(404).json({ error: "Brand not found" });
    }
  };

  static update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, logo_url, is_active } = req.body;
      const response = await BrandService.update({ id, name, logo_url, is_active });
      return res.status(200).json(response);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Error updating brand" });
    }
  };

  static delete = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const response = await BrandService.delete({ id });
      return res.status(200).json(response);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Error deleting brand" });
    }
  };
}