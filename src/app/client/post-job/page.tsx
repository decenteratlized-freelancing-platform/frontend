import PostJobForm from "@/components/clientComponent/post-job-form"

export default function PostJobPage() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Post a New Job</h1>
        <p className="text-gray-300">Find the perfect freelancer for your project</p>
      </div>
      <PostJobForm />
    </div>
  )
}
