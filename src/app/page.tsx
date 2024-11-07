import { ProcessDocument } from '@/components/custom/process-document'
import { DocumentsList } from '@/components/documents-list'

const Page = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Document Upload</h1>
      <ProcessDocument />
      <DocumentsList />
    </div>
  )
}

export default Page
