"use client";

import { useParams } from "next/navigation";
import { ContractDetail } from "@/components/shared/contract-detail";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function ClientContractDetailPage() {
    const params = useParams();
    const contractId = params.id as string;
    const user = useCurrentUser();

    return <ContractDetail contractId={contractId} userRole="client" userEmail={user?.email} />;
}
