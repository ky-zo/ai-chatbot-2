import { getUserDocuments } from '@/db/queries'

import { Button } from './ui/button'

interface Document {
  id: string
  title: string
  content: string
  createdAt: string
}

export const DocumentsList = async () => {
  const documents = await getUserDocuments()

  if (documents.length === 0) {
    return <div className="mt-4 text-muted-foreground">No documents uploaded yet</div>
  }

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-xl font-semibold">Your Documents</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="rounded-lg border p-4 hover:bg-muted/50">
            <h3 className="mb-2 font-medium">{doc.title}</h3>
            <p className="text-sm text-muted-foreground">{new Date(doc.createdAt).toLocaleDateString()}</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2">
              View Document
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
