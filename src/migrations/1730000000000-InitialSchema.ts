import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1730000000000 implements MigrationInterface {
    name = "InitialSchema1730000000000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create users table
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(100) NOT NULL,
                "email" character varying(100) NOT NULL,
                "password" character varying(255) NOT NULL,
                "phone" character varying(20) NOT NULL,
                "role" character varying(20) NOT NULL DEFAULT 'OWNER',
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_users_email" UNIQUE ("email"),
                CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
            )
        `);

        // Create brands table
        await queryRunner.query(`
            CREATE TABLE "brands" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(50) NOT NULL,
                "logo_url" character varying(255),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_brands_name" UNIQUE ("name"),
                CONSTRAINT "PK_brands_id" PRIMARY KEY ("id")
            )
        `);

        // Create models table
        await queryRunner.query(`
            CREATE TABLE "models" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(50) NOT NULL,
                "brand_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_models_id" PRIMARY KEY ("id"),
                CONSTRAINT "FK_models_brand_id" FOREIGN KEY ("brand_id")
                    REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE
            )
        `);

        // Create customers table
        await queryRunner.query(`
            CREATE TABLE "customers" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(100) NOT NULL,
                "phone" character varying(20) NOT NULL,
                "email" character varying(100),
                "dui" character varying(10),
                "address" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_customers_phone" UNIQUE ("phone"),
                CONSTRAINT "PK_customers_id" PRIMARY KEY ("id")
            )
        `);

        // Create motorcycles table
        await queryRunner.query(`
            CREATE TABLE "motorcycles" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "plate" character varying(20) NOT NULL,
                "color" character varying(30),
                "year" integer,
                "engine_number" character varying(50),
                "chassis_number" character varying(50),
                "customer_id" uuid NOT NULL,
                "brand_id" uuid NOT NULL,
                "model_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_motorcycles_plate" UNIQUE ("plate"),
                CONSTRAINT "PK_motorcycles_id" PRIMARY KEY ("id"),
                CONSTRAINT "FK_motorcycles_customer_id" FOREIGN KEY ("customer_id")
                    REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT "FK_motorcycles_brand_id" FOREIGN KEY ("brand_id")
                    REFERENCES "brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
                CONSTRAINT "FK_motorcycles_model_id" FOREIGN KEY ("model_id")
                    REFERENCES "models"("id") ON DELETE RESTRICT ON UPDATE CASCADE
            )
        `);

        // Create services table
        await queryRunner.query(`
            CREATE TABLE "services" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(100) NOT NULL,
                "description" text,
                "base_price" numeric(10,2) NOT NULL,
                "estimated_hours" numeric(5,2) NOT NULL,
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_services_name" UNIQUE ("name"),
                CONSTRAINT "PK_services_id" PRIMARY KEY ("id")
            )
        `);

        // Create repair_jobs table
        await queryRunner.query(`
            CREATE TABLE "repair_jobs" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "description" text NOT NULL,
                "status" character varying(20) NOT NULL DEFAULT 'PENDING',
                "complexity" character varying(20) NOT NULL DEFAULT 'MEDIUM',
                "total_price" numeric(10,2),
                "estimated_completion_date" TIMESTAMP,
                "actual_completion_date" TIMESTAMP,
                "notes" text,
                "motorcycle_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_repair_jobs_id" PRIMARY KEY ("id"),
                CONSTRAINT "FK_repair_jobs_motorcycle_id" FOREIGN KEY ("motorcycle_id")
                    REFERENCES "motorcycles"("id") ON DELETE CASCADE ON UPDATE CASCADE
            )
        `);

        // Create repair_job_services junction table
        await queryRunner.query(`
            CREATE TABLE "repair_job_services" (
                "repair_job_id" uuid NOT NULL,
                "service_id" uuid NOT NULL,
                CONSTRAINT "PK_repair_job_services" PRIMARY KEY ("repair_job_id", "service_id"),
                CONSTRAINT "FK_repair_job_services_repair_job" FOREIGN KEY ("repair_job_id")
                    REFERENCES "repair_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT "FK_repair_job_services_service" FOREIGN KEY ("service_id")
                    REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE
            )
        `);

        // Create indexes for better performance
        await queryRunner.query("CREATE INDEX \"IDX_models_brand_id\" ON \"models\" (\"brand_id\")");
        await queryRunner.query("CREATE INDEX \"IDX_motorcycles_customer_id\" ON \"motorcycles\" (\"customer_id\")");
        await queryRunner.query("CREATE INDEX \"IDX_motorcycles_brand_id\" ON \"motorcycles\" (\"brand_id\")");
        await queryRunner.query("CREATE INDEX \"IDX_motorcycles_model_id\" ON \"motorcycles\" (\"model_id\")");
        await queryRunner.query("CREATE INDEX \"IDX_motorcycles_plate\" ON \"motorcycles\" (\"plate\")");
        await queryRunner.query("CREATE INDEX \"IDX_repair_jobs_motorcycle_id\" ON \"repair_jobs\" (\"motorcycle_id\")");
        await queryRunner.query("CREATE INDEX \"IDX_repair_jobs_status\" ON \"repair_jobs\" (\"status\")");
        await queryRunner.query("CREATE INDEX \"IDX_repair_jobs_created_at\" ON \"repair_jobs\" (\"created_at\")");
        await queryRunner.query("CREATE INDEX \"IDX_customers_phone\" ON \"customers\" (\"phone\")");
        await queryRunner.query("CREATE INDEX \"IDX_customers_name\" ON \"customers\" (\"name\")");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query("DROP INDEX \"IDX_customers_name\"");
        await queryRunner.query("DROP INDEX \"IDX_customers_phone\"");
        await queryRunner.query("DROP INDEX \"IDX_repair_jobs_created_at\"");
        await queryRunner.query("DROP INDEX \"IDX_repair_jobs_status\"");
        await queryRunner.query("DROP INDEX \"IDX_repair_jobs_motorcycle_id\"");
        await queryRunner.query("DROP INDEX \"IDX_motorcycles_plate\"");
        await queryRunner.query("DROP INDEX \"IDX_motorcycles_model_id\"");
        await queryRunner.query("DROP INDEX \"IDX_motorcycles_brand_id\"");
        await queryRunner.query("DROP INDEX \"IDX_motorcycles_customer_id\"");
        await queryRunner.query("DROP INDEX \"IDX_models_brand_id\"");

        // Drop tables in reverse order
        await queryRunner.query("DROP TABLE \"repair_job_services\"");
        await queryRunner.query("DROP TABLE \"repair_jobs\"");
        await queryRunner.query("DROP TABLE \"services\"");
        await queryRunner.query("DROP TABLE \"motorcycles\"");
        await queryRunner.query("DROP TABLE \"customers\"");
        await queryRunner.query("DROP TABLE \"models\"");
        await queryRunner.query("DROP TABLE \"brands\"");
        await queryRunner.query("DROP TABLE \"users\"");
    }
}
