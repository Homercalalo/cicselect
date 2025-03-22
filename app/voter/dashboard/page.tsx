"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { mockCampaigns } from "@/lib/mock-data"
import type { Campaign } from "@/lib/types"

export default function VoterDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login?role=voter")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "voter") {
      router.push("/login?role=voter")
      return
    }

    setUser(parsedUser)
    setCampaigns(mockCampaigns)
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  const handleVote = (campaignId: string) => {
    router.push(`/voter/vote/${campaignId}`)
  }

  const handleViewResults = (campaignId: string) => {
    router.push(`/voter/results/${campaignId}`)
  }

  if (loading) return <div className="p-4">Loading...</div>

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:px-8 lg:px-10">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-xl font-bold">Available Elections</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">Welcome, {user?.name}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {campaigns.map((campaign) => {
            const isActive = new Date(campaign.deadline) > new Date()
            return (
              <div
                key={campaign.id}
                className="flex flex-col rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
              >
                <div className="mb-3 flex-1">
                  <div className="flex items-start justify-between">
                    <h2 className="font-medium">{campaign.title}</h2>
                    <div className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium dark:bg-gray-700">
                      {isActive ? (campaign.hasVoted ? "Voted" : "Not Voted") : "Closed"}
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {isActive
                      ? `Ends: ${new Date(campaign.deadline).toLocaleDateString()}`
                      : `Ended: ${new Date(campaign.deadline).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="mt-auto">
                  {isActive ? (
                    <Button
                      className="w-full"
                      size="sm"
                      disabled={campaign.hasVoted}
                      onClick={() => handleVote(campaign.id)}
                    >
                      {campaign.hasVoted ? "Already Voted" : "Vote Now"}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      size="sm"
                      onClick={() => handleViewResults(campaign.id)}
                    >
                      View Results
                    </Button>
                  )}
                </div>
              </div>
            )
          })}

          {campaigns.length === 0 && (
            <div className="col-span-full rounded-lg border border-dashed border-gray-200 dark:border-gray-600 p-6 text-center text-gray-500 dark:text-gray-400">
              No elections available.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

