"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { mockCampaigns, mockCandidates } from "@/lib/mock-data"
import type { Campaign, Candidate } from "@/lib/types"

export default function VotePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [candidates, setCandidates] = useState<Record<string, Candidate[]>>({})
  const [selections, setSelections] = useState<Record<string, string>>({})
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

    const campaignId = params.id as string
    const foundCampaign = mockCampaigns.find((c) => c.id === campaignId)

    if (!foundCampaign || foundCampaign.hasVoted || new Date(foundCampaign.deadline) <= new Date()) {
      toast({
        title: "Cannot Vote",
        description: foundCampaign?.hasVoted
          ? "You have already voted in this election"
          : "This election is not available for voting",
        variant: "destructive",
      })
      router.push("/voter/dashboard")
      return
    }

    setCampaign(foundCampaign)

    const candidatesByPosition: Record<string, Candidate[]> = {}
    mockCandidates
      .filter((candidate) => candidate.campaignId === campaignId)
      .forEach((candidate) => {
        if (!candidatesByPosition[candidate.position]) {
          candidatesByPosition[candidate.position] = []
        }
        candidatesByPosition[candidate.position].push(candidate)
      })

    setCandidates(candidatesByPosition)
    setLoading(false)
  }, [params.id, router, toast])

  const handleSelectionChange = (position: string, candidateId: string) => {
    setSelections((prev) => ({
      ...prev,
      [position]: candidateId,
    }))
  }

  const handleSubmitVote = () => {
    const positions = campaign?.positions || []
    const missingSelections = positions.filter((position) => !selections[position])

    if (missingSelections.length > 0) {
      toast({
        title: "Incomplete Selections",
        description: `Please select a candidate for all positions`,
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Vote Submitted",
      description: "Your vote has been recorded",
    })

    const updatedCampaigns = mockCampaigns.map((c) => (c.id === campaign?.id ? { ...c, hasVoted: true } : c))
    localStorage.setItem("campaigns", JSON.stringify(updatedCampaigns))

    setTimeout(() => {
      router.push("/voter/dashboard")
    }, 1500)
  }

  if (loading) return <div className="p-4">Loading...</div>

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:px-8 lg:px-10">
        <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="outline" size="sm" onClick={() => router.push("/voter/dashboard")}>
            Back
          </Button>
          <h1 className="text-xl font-bold">{campaign?.title}</h1>
          <div className="hidden sm:block sm:w-[70px]"></div> {/* Spacer for alignment on desktop */}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaign?.positions.map((position) => (
            <div key={position} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
              <h2 className="mb-3 font-medium">{position}</h2>
              <RadioGroup
                value={selections[position]}
                onValueChange={(value) => handleSelectionChange(position, value)}
              >
                <div className="space-y-2">
                  {candidates[position]?.map((candidate) => (
                    <div
                      key={candidate.id}
                      className={`flex items-center rounded border p-2 ${
                        selections[position] === candidate.id
                          ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-gray-700"
                          : "border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <RadioGroupItem value={candidate.id} id={candidate.id} className="mr-2" />
                      <div className="overflow-hidden">
                        <Label htmlFor={candidate.id} className="block truncate font-medium">
                          {candidate.name}
                        </Label>
                        <p className="truncate text-xs text-gray-500">{candidate.course}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSubmitVote}>Submit Vote</Button>
        </div>
      </div>
    </div>
  )
}

