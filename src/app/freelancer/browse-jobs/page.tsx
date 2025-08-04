import BrowseJobs from "@/components/freelancerComponent/browse-jobs"

export default function BrowseJobsPage() {
  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Browse Jobs</h1>
        <p className="text-gray-300">Find your next opportunity</p>
      </div>
      <BrowseJobs />
    </div>
  )
}
