'use client'

import { ProcessDocument } from '@/components/custom/process-document'

const Page = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Document Upload</h1>
      <ProcessDocument />
    </div>
  )
}

export default Page
