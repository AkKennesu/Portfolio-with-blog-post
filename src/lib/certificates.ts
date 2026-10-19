import { CertificateRepository } from "@/repositories/certificate.repo";

export type Certificate = {
  id?: number;
  year: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
};

export async function getCertificates(): Promise<Certificate[]> {
  const items = await CertificateRepository.findAll();
  return items as Certificate[];
}

export async function getCertificate(id: number): Promise<Certificate | undefined> {
  return await CertificateRepository.findById(id);
}
