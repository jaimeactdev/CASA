-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('CC', 'CE', 'PASSPORT', 'PPT');

-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('FEMALE', 'MALE', 'UNSPECIFIED');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'RETIRED');

-- CreateEnum
CREATE TYPE "FeeType" AS ENUM ('MONTHLY', 'ENROLLMENT');

-- CreateEnum
CREATE TYPE "FeeStatus" AS ENUM ('PENDING', 'OVERDUE', 'PAID');

-- CreateEnum
CREATE TYPE "BenefitType" AS ENUM ('ANNUAL', 'EVENTUAL');

-- CreateEnum
CREATE TYPE "BenefitAudience" AS ENUM ('ALL', 'FEMALE', 'MALE');

-- CreateTable
CREATE TABLE "settings" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "acronym" TEXT NOT NULL,
    "service_city" TEXT NOT NULL,
    "phone" TEXT,
    "contact_email" TEXT,
    "address" TEXT,
    "opening_hours" TEXT,
    "minimum_wage" INTEGER NOT NULL DEFAULT 0,
    "first_fee_cutoff_day" INTEGER NOT NULL,
    "first_fee_percent" DECIMAL(6,2) NOT NULL,
    "grace_days" INTEGER NOT NULL,
    "surcharge_percent" DECIMAL(6,2) NOT NULL,
    "enrollment_fee" INTEGER NOT NULL DEFAULT 0,
    "allow_multi_fee_payment" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role_id" UUID NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "must_change_password" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "membership_profiles" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "percent" DECIMAL(6,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membership_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benefits" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "internal_description" TEXT NOT NULL,
    "public_text" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "type" "BenefitType" NOT NULL,
    "audience" "BenefitAudience" NOT NULL,
    "min_paid_fees_in_year" INTEGER NOT NULL DEFAULT 0,
    "max_deliveries_per_year" INTEGER NOT NULL,
    "suggested_month" INTEGER,
    "requires_minimum_setup" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "benefits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_benefits" (
    "profile_id" UUID NOT NULL,
    "benefit_id" UUID NOT NULL,

    CONSTRAINT "profile_benefits_pkey" PRIMARY KEY ("profile_id","benefit_id")
);

-- CreateTable
CREATE TABLE "members" (
    "id" UUID NOT NULL,
    "document_type" "DocumentType" NOT NULL,
    "document_number" TEXT NOT NULL,
    "first_names" TEXT NOT NULL,
    "last_names" TEXT NOT NULL,
    "sex" "Sex" NOT NULL,
    "birth_date" DATE NOT NULL,
    "mobile_phone" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT NOT NULL,
    "residence_city" TEXT NOT NULL,
    "shirt_size" TEXT,
    "pants_size" TEXT,
    "shoe_size" TEXT,
    "member_number" SERIAL NOT NULL,
    "joined_on" DATE NOT NULL,
    "profile_id" UUID NOT NULL,
    "status" "MemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fees" (
    "id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "type" "FeeType" NOT NULL,
    "period_year" INTEGER,
    "period_month" INTEGER,
    "minimum_wage_used" INTEGER NOT NULL,
    "profile_percent" DECIMAL(6,2) NOT NULL,
    "base_amount" INTEGER NOT NULL,
    "is_reduced" BOOLEAN NOT NULL DEFAULT false,
    "reduction_percent" DECIMAL(6,2),
    "due_date" DATE NOT NULL,
    "due_limit" DATE NOT NULL,
    "status" "FeeStatus" NOT NULL,
    "paid_on" DATE,
    "payment_method_id" UUID,
    "payment_note" TEXT,
    "paid_by_id" UUID,
    "paid_at" TIMESTAMP(3),
    "months_late_charged" INTEGER,
    "surcharge_percent_applied" DECIMAL(6,2),
    "surcharge_amount" INTEGER,
    "total_paid" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benefit_deliveries" (
    "id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "benefit_id" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "delivered_on" DATE NOT NULL,
    "delivered_by_id" UUID NOT NULL,
    "is_exception" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "is_voided" BOOLEAN NOT NULL DEFAULT false,
    "voided_by_id" UUID,
    "voided_at" TIMESTAMP(3),
    "void_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "benefit_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "detail" JSONB NOT NULL,
    "note" TEXT,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_methods_name_key" ON "payment_methods"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_key_key" ON "permissions"("key");

-- CreateIndex
CREATE UNIQUE INDEX "membership_profiles_name_key" ON "membership_profiles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "members_member_number_key" ON "members"("member_number");

-- CreateIndex
CREATE INDEX "members_status_idx" ON "members"("status");

-- CreateIndex
CREATE INDEX "members_profile_id_idx" ON "members"("profile_id");

-- CreateIndex
CREATE INDEX "members_last_names_idx" ON "members"("last_names");

-- CreateIndex
CREATE UNIQUE INDEX "members_document_type_document_number_key" ON "members"("document_type", "document_number");

-- CreateIndex
CREATE INDEX "fees_status_idx" ON "fees"("status");

-- CreateIndex
CREATE INDEX "fees_period_year_period_month_idx" ON "fees"("period_year", "period_month");

-- CreateIndex
CREATE INDEX "fees_member_id_status_idx" ON "fees"("member_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "fees_member_id_period_year_period_month_key" ON "fees"("member_id", "period_year", "period_month");

-- CreateIndex
CREATE INDEX "benefit_deliveries_member_id_benefit_id_year_is_voided_idx" ON "benefit_deliveries"("member_id", "benefit_id", "year", "is_voided");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entity_id_idx" ON "audit_logs"("entity", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_at_idx" ON "audit_logs"("at");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_benefits" ADD CONSTRAINT "profile_benefits_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "membership_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_benefits" ADD CONSTRAINT "profile_benefits_benefit_id_fkey" FOREIGN KEY ("benefit_id") REFERENCES "benefits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "membership_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fees" ADD CONSTRAINT "fees_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fees" ADD CONSTRAINT "fees_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fees" ADD CONSTRAINT "fees_paid_by_id_fkey" FOREIGN KEY ("paid_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "benefit_deliveries" ADD CONSTRAINT "benefit_deliveries_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "benefit_deliveries" ADD CONSTRAINT "benefit_deliveries_benefit_id_fkey" FOREIGN KEY ("benefit_id") REFERENCES "benefits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "benefit_deliveries" ADD CONSTRAINT "benefit_deliveries_delivered_by_id_fkey" FOREIGN KEY ("delivered_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "benefit_deliveries" ADD CONSTRAINT "benefit_deliveries_voided_by_id_fkey" FOREIGN KEY ("voided_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- One enrollment fee per member
CREATE UNIQUE INDEX "fees_one_enrollment_per_member"
ON "fees" ("member_id")
WHERE "type" = 'ENROLLMENT';

