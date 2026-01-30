"use client";

import { useParams } from "next/navigation";
import { ProposalDetail } from "@/components/shared/proposal-detail";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function FreelancerProposalDetailPage() {
    const params = useParams();
    const proposalId = params.id as string;
    const user = useCurrentUser();

    return <ProposalDetail proposalId={proposalId} userRole="freelancer" userEmail={user?.email} />;
}
