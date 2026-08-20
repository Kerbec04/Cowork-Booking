-- AlterTable
ALTER TABLE "spaces" ADD COLUMN     "descontoPrimeiraReserva" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "possuiAddonPodcast" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "precoAddonPodcastHora" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "podcastIncluido" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "descontoAplicado" INTEGER NOT NULL DEFAULT 0;
