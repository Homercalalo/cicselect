"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { mockCampaigns, mockCandidates, mockResults } from "@/lib/mock-data"
import type { Campaign, Result } from "@/lib/types"

export default function ResultsPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [results, setResults] = useState<Record<string, Result[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }

    const campaignId = params.id as string
    const foundCampaign = mockCampaigns.find((c) => c.id === campaignId)

    if (!foundCampaign) {
      toast({
        title: "Not Found",
        description: "The requested election could not be found",
        variant: "destructive",
      })
      router.push("/voter/dashboard")
      return
    }

    setCampaign(foundCampaign)

    const campaignResults = mockResults.filter((r) => r.campaignId === campaignId)

    const resultsByPosition: Record<string, Result[]> = {}
    foundCampaign.positions.forEach((position) => {
      const positionResults = campaignResults.filter((r) => r.position === position).sort((a, b) => b.votes - a.votes)

      resultsByPosition[position] = positionResults
    })

    setResults(resultsByPosition)
    setLoading(false)
  }, [params.id, router, toast])

  if (loading) return <div className="p-4">Loading...</div>

  // Find the maximum votes for each position to calculate percentages
  const maxVotesByPosition: Record<string, number> = {}
  Object.entries(results).forEach(([position, positionResults]) => {
    maxVotesByPosition[position] = Math.max(...positionResults.map((r) => r.votes), 1)
  })

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:px-8 lg:px-10">
        <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="outline" size="sm" onClick={() => router.push("/voter/dashboard")}>
            Back
          </Button>
          <h1 className="text-xl font-bold">Results: {campaign?.title}</h1>
          <div className="hidden sm:block sm:w-[70px]"></div> {/* Spacer for alignment on desktop */}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaign?.positions.map((position) => (
            <div key={position} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
              <h2 className="mb-3 font-medium">{position}</h2>

              <div className="space-y-3">
                {results[position]?.map((result, idx) => {
                  const candidate = mockCandidates.find((c) => c.id === result.candidateId)
                  const percentage = Math.round((result.votes / maxVotesByPosition[position]) * 100)

                  return (
                    <div key={result.candidateId} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="truncate pr-2">
                          {candidate?.name}
                          {idx === 0 && (
                            <span className="ml-1 text-xs text-green-600 dark:text-green-400">(Winner)</span>
                          )}
                        </div>
                        <div className="whitespace-nowrap text-xs text-gray-500">
                          {result.votes} ({percentage}%)
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

