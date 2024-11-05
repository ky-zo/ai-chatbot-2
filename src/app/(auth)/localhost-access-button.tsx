'use client'

import { useState } from 'react'

import { localHostAccess } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { getURL } from '@/lib/utils'

const LocalhostAuthButton = () => {
  const [loading, setLoading] = useState(false)
  const baseURL = getURL()

  const handleAdminSignIn = async () => {
    await localHostAccess()
  }

  return (
    <>
      {baseURL === 'http://localhost:3000' && (
        <Button
          variant={'outline'}
          className="bg-white"
          disabled={loading}
          onClick={async () => {
            setLoading(true)
            await handleAdminSignIn()
          }}>
          Localhost Access
        </Button>
      )}
    </>
  )
}

export default LocalhostAuthButton
