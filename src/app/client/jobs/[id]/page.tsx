"use client";

import { useParams } from "next/navigation";
import { JobDetail } from "@/components/shared/job-detail";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function ClientJobDetailPage() {
    const params = useParams();
    const jobId = params.id as string;
    const user = useCurrentUser();

    return <JobDetail jobId={jobId} userRole="client" userEmail={user?.email} />;
}
