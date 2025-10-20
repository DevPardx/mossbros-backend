import type { Request, Response } from "express";
import { client } from "../config/redis";
import { BrandService } from "../services/brand.service";

export class BrandController {
  static create = async (req: Request, res: Response) => {
    const { name, logo_url } = req.body;
    const response = await BrandService.create({ name, logo_url });
    await client.del("brands");
    return res.status(201).json(response);
  };

  static getAll = async (req: Request, res: Response) => {
    const brands = await client.get("brands");

    if (brands) {
      const data = typeof brands === 'string' ? brands : brands.toString();
      return res.status(200).json(JSON.parse(data));
    }

    const response = await BrandService.getAll();
    await client.set("brands", JSON.stringify(response));
    return res.status(200).json(response);
  };

  static getById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const response = await BrandService.getById({id});
    return res.status(200).json(response);
  };

  static update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, logo_url, is_active } = req.body;
    const response = await BrandService.update({ id, name, logo_url, is_active });
    await client.del("brands");
    return res.status(200).json(response);
  };

  static delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    const response = await BrandService.delete({ id });
    await client.del("brands");
    return res.status(200).json(response);
  };
}