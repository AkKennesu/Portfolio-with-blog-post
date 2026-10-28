import { CertificateRepository } from "@/repositories/certificate.repo";
import { unstable_cache } from "next/cache";

export type Certificate = {
  id?: number;
  year: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
};

export const getCertificates = unstable_cache(
  async (): Promise<Certificate[]> => {
    const items = await CertificateRepository.findAll();
    return items as Certificate[];
  },
  ["certificates-list"],
  {
    tags: ["certificates", "admin-unified-data"],
    revalidate: 300,
  }
);

export const getCertificate = (id: number) =>
  unstable_cache(
    async (): Promise<Certificate | undefined> => {
      return await CertificateRepository.findById(id);
    },
    [`certificate-${id}`],
    {
      tags: [`certificate-${id}`, "certificates", "admin-unified-data"],
      revalidate: 300,
    }
  )();
