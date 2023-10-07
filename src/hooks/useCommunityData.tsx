import { useEffect, useState } from "react"
import { useRecoilState, useSetRecoilState } from "recoil"
import {
  Community,
  communityState,
  CommunitySnippet,
} from "../atoms/communitiesAtom"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, firestore } from "../firebase/clientApp"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  writeBatch,
} from "firebase/firestore"
import { authModalState } from "../atoms/authModalAtom"
import { useRouter } from "next/router"

const useCommunityData = () => {
  const [user] = useAuthState(auth)
  const router = useRouter()
  const [communityStateValue, setCommunityStateValue] =
    useRecoilState(communityState)
  const setAuthModalState = useSetRecoilState(authModalState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const onJoinOrLeaveCommunity = (
    communityData: Community,
    isJoined: boolean
  ) => {
    // Check if the user is logged in? If not open auth modal
    if (!user) {
      // Open modal
      setAuthModalState({ open: true, view: "login" })
      return
    }

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
    } catch (error: any) {
      console.log("getMySnippets error: ", error)
      setError(error.message)
    }
    setLoading(false)
  }

  const joinCommunity = async (communityData: Community) => {
    // Batch write
    try {
      const batch = writeBatch(firestore)

      // Creating a new community snippet
      const newSnippet: CommunitySnippet = {
        communityId: communityData.id,
        imageURL: communityData.imageURL || "",
      }

      batch.set(
        doc(
          firestore,
          `users/${user?.uid}/communitySnippets`,
          communityData.id
        ),
        newSnippet
      )

      // Updating number of members in community
      batch.update(doc(firestore, "communities", communityData.id), {
        numberOfMembers: increment(1),
      })

      await batch.commit()

      // Updating recoil state - communityState.mySnippets
      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: [...prev.mySnippets, newSnippet],
      }))
    } catch (error: any) {
      console.log("joinCommunity error: ", error)
      setError(error.message)
    }
    setLoading(false)
  }

  const leaveCommunity = async (communityId: string) => {
    // Batch write
    try {
      const batch = writeBatch(firestore)

      // Deleting community snippet from user
      batch.delete(
        doc(firestore, `users/${user?.uid}/communitySnippets`, communityId)
      )

      // Updating number of members in community
      batch.update(doc(firestore, "communities", communityId), {
        numberOfMembers: increment(-1),
      })

      await batch.commit()

      // Updating recoil state - communityState.mySnippets
      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: prev.mySnippets.filter(
          (item) => item.communityId !== communityId
        ),
      }))
    } catch (error: any) {
      console.log("leaveCommunity error: ", error)
      setError(error.message)
    }
    setLoading(false)
  }

  const getCommunityData = async (communityId: string) => {
    try {
      const communityDocRef = doc(firestore, "communities", communityId)
      const communityDoc = await getDoc(communityDocRef)

      setCommunityStateValue((prev) => ({
        ...prev,
        currentCommunity: {
          id: communityDoc.id,
          ...communityDoc.data(),
        } as Community,
      }))
    } catch (error) {
      console.log("getCommunityData error: ", error)
    }
  }

  useEffect(() => {
    if (!user) {
      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: [],
      }))
      return
    }
    getMySnippets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    const { communityId } = router.query

    if (communityId && !communityStateValue.currentCommunity) {
      getCommunityData(communityId as string)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query, communityStateValue.currentCommunity])

  return {
    // Data and functions
    communityStateValue,
    onJoinOrLeaveCommunity,
    loading,
  }
}
export default useCommunityData
