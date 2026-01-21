/*
  Warnings:

  - You are about to drop the column `device_id` on the `bookings` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_auditorium_id_fkey";

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "device_id";

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_auditorium_id_fkey" FOREIGN KEY ("auditorium_id") REFERENCES "auditoriums"("id") ON DELETE CASCADE ON UPDATE CASCADE;
