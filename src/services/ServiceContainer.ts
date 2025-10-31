import { DataSource, Repository } from "typeorm";
import { Brand } from "../entities/Brand.entity";
import { Model } from "../entities/Model.entity";
import { Service } from "../entities/Service.entity";
import { Customer } from "../entities/Customer.entity";
import { Motorcycle } from "../entities/Motorcycle.entity";
import { User } from "../entities/User.entity";
import { RepairJob } from "../entities/RepairJob.entity";
import { BrandService } from "./brand.service";
import { ModelService } from "./model.service";
import { ServiceService } from "./service.service";
import { CustomerService } from "./customer.service";
import { AuthService } from "./auth.service";
import { RepairJobService } from "./repairJob.service";

export class ServiceContainer {
    private readonly dataSource: DataSource;

    private _brandService?: BrandService;
    private _modelService?: ModelService;
    private _serviceService?: ServiceService;
    private _customerService?: CustomerService;
    private _authService?: AuthService;
    private _repairJobService?: RepairJobService;

    constructor(dataSource: DataSource) {
        this.dataSource = dataSource;
    }

    private get brandRepository(): Repository<Brand> {
        return this.dataSource.getRepository(Brand);
    }

    private get modelRepository(): Repository<Model> {
        return this.dataSource.getRepository(Model);
    }

    private get serviceRepository(): Repository<Service> {
        return this.dataSource.getRepository(Service);
    }

    private get customerRepository(): Repository<Customer> {
        return this.dataSource.getRepository(Customer);
    }

    private get motorcycleRepository(): Repository<Motorcycle> {
        return this.dataSource.getRepository(Motorcycle);
    }

    private get userRepository(): Repository<User> {
        return this.dataSource.getRepository(User);
    }

    private get repairJobRepository(): Repository<RepairJob> {
        return this.dataSource.getRepository(RepairJob);
    }

    get brandService(): BrandService {
        if (!this._brandService) {
            this._brandService = new BrandService(this.brandRepository);
        }
        return this._brandService;
    }

    get modelService(): ModelService {
        if (!this._modelService) {
            this._modelService = new ModelService(this.modelRepository);
        }
        return this._modelService;
    }

    get serviceService(): ServiceService {
        if (!this._serviceService) {
            this._serviceService = new ServiceService(this.serviceRepository);
        }
        return this._serviceService;
    }

    get customerService(): CustomerService {
        if (!this._customerService) {
            this._customerService = new CustomerService(
                this.customerRepository,
                this.dataSource
            );
        }
        return this._customerService;
    }

    get authService(): AuthService {
        if (!this._authService) {
            this._authService = new AuthService(this.userRepository);
        }
        return this._authService;
    }

    get repairJobService(): RepairJobService {
        if (!this._repairJobService) {
            this._repairJobService = new RepairJobService(
                this.repairJobRepository,
                this.motorcycleRepository,
                this.serviceRepository,
                this.customerRepository
            );
        }
        return this._repairJobService;
    }
}
