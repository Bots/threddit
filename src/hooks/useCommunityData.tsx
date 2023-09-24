import { useEffect, useState } from "react"
import { useRecoilState } from "recoil"
import {
  Community,
  communityState,
  CommunitySnippet,
} from "../atoms/communitiesAtom"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, firestore } from "../firebase/clientApp"
import { collection, getDocs } from "firebase/firestore"

const useCommunityData = () => {
  const [user] = useAuthState(auth)
  const [communityStateValue, setCommunityStateValue] =
    useRecoilState(communityState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const onJoinOrLeaveCommunity = (
    communityData: Community,
    isJoined: boolean
  ) => {
    // Check if the user is logged in? If not open auth modal

    if (isJoined) {
      leaveCommunity(communityData.id)
      return
    }

    joinCommunity(communityData)
  }

  const getMySnippets = async () => {
    setLoading(true)
    try {
      // Get users snippets
      const snippetDocs = await getDocs(
        collection(firestore, `users/${user?.uid}/communitySnippets`)
      )
      const snippets = snippetDocs.docs.map((doc) => ({ ...doc.data() }))

      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: snippets as CommunitySnippet[],
      }))

      console.log("Here are teh snippets: ", snippets)
    } catch (error) {
      console.log("getMySnippets error: ", error)
    }
    setLoading(false)
  }

  const joinCommunity = (communityData: Community) => {}

  const leaveCommunity = (communityId: string) => {}

  useEffect(() => {
    if (!user) return
    getMySnippets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  return {
    // Data and functions
    communityStateValue,
    onJoinOrLeaveCommunity,
    loading,
  }
}
export default useCommunityData
