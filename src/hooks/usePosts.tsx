import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore"
import { deleteObject, ref } from "firebase/storage"
import { useAuthState } from "react-firebase-hooks/auth"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import { authModalState } from "../atoms/authModalAtom"
import { Post, PostVote, postState } from "../atoms/postAtom"
import { auth, firestore, storage } from "../firebase/clientApp"
import { useEffect } from "react"
import { communityState } from "../atoms/communitiesAtom"
import { useRouter } from "next/router"

const usePosts = () => {
  const [user] = useAuthState(auth)
  const router = useRouter()
  const [postStateValue, setPostStateValue] = useRecoilState(postState)
  const currentCommunity = useRecoilValue(communityState).currentCommunity
  const setAuthModalState = useSetRecoilState(authModalState)

  const onVote = async (
    event: React.MouseEvent<SVGElement, MouseEvent>,
    post: Post,
    vote: number,
    communityId: string
  ) => {
    event.stopPropagation()
    // Check for user and if not, redirect to auth modal
    if (!user?.uid) {
      setAuthModalState({ open: true, view: "login" })
      return
    }

    const { voteStatus } = post
    // const existingVote = post.currentUserVoteStatus;
    const existingVote = postStateValue.postVotes.find(
      (vote) => vote.postId === post.id
    )

    try {
      let voteChange = vote
      const batch = writeBatch(firestore)

      const updatedPost = { ...post }
      const updatedPosts = [...postStateValue.posts]
      let updatedPostVotes = [...postStateValue.postVotes]

      // New vote
      if (!existingVote) {
        const postVoteRef = doc(
          collection(firestore, "users", `${user.uid}/postVotes`)
        )

        const newVote: PostVote = {
          id: postVoteRef.id,
          postId: post.id,
          communityId,
          voteValue: vote,
        }
        // APRIL 25 - DON'T THINK WE NEED THIS
        // newVote.id = postVoteRef.id;

        batch.set(postVoteRef, newVote)

        updatedPost.voteStatus = voteStatus + vote
        updatedPostVotes = [...updatedPostVotes, newVote]
      }
      // Removing existing vote
      else {
        // Used for both possible cases of batch writes
        const postVoteRef = doc(
          firestore,
          "users",
          `${user.uid}/postVotes/${existingVote.id}`
        )

        // Removing vote
        if (existingVote.voteValue === vote) {
          voteChange *= -1
          updatedPost.voteStatus = voteStatus - vote
          updatedPostVotes = updatedPostVotes.filter(
            (vote) => vote.id !== existingVote.id
          )
          batch.delete(postVoteRef)
        }
        // Changing vote
        else {
          voteChange = 2 * vote
          updatedPost.voteStatus = voteStatus + 2 * vote
          const voteIdx = postStateValue.postVotes.findIndex(
            (vote) => vote.id === existingVote.id
          )
          // console.log("HERE IS VOTE INDEX", voteIdx);

          // Vote was found - findIndex returns -1 if not found
          if (voteIdx !== -1) {
            updatedPostVotes[voteIdx] = {
              ...existingVote,
              voteValue: vote,
            }
          }
          batch.update(postVoteRef, {
            voteValue: vote,
          })
        }
      }

      let updatedState = { ...postStateValue, postVotes: updatedPostVotes }

      const postIdx = postStateValue.posts.findIndex(
        (item) => item.id === post.id
      )

      // if (postIdx !== undefined) {
      updatedPosts[postIdx!] = updatedPost
      updatedState = {
        ...updatedState,
        posts: updatedPosts,
        postsCache: {
          ...updatedState.postsCache,
          [communityId]: updatedPosts,
        },
      }
      // }

      /**
       * Optimistically update the UI
       * Used for single page view [pid]
       * since we don't have real-time listener there
       */
      if (updatedState.selectedPost) {
        updatedState = {
          ...updatedState,
          selectedPost: updatedPost,
        }
      }

      // Optimistically update the UI
      setPostStateValue(updatedState)

      if (postStateValue.selectedPost) {
        setPostStateValue((prev) => ({
          ...prev,
          selectedPost: updatedPost,
        }))
      }

      // Update database
      const postRef = doc(firestore, "posts", post.id)
      batch.update(postRef, { voteStatus: voteStatus + voteChange })
      await batch.commit()
    } catch (error) {
      console.log("onVote error", error)
    }
  }

  const onSelectPost = (post: Post) => {
    setPostStateValue((prev) => ({
      ...prev,
      selectedPost: post,
    }))
    router.push(`/r/${post.communityId}/comments/${post.id}`)
  }

  const onDeletePost = async (post: Post): Promise<boolean> => {
    try {
      // Check if image exists, delete if so
      if (post.imageURL) {
        const imageRef = ref(storage, `posts/${post.id}/image`)
        await deleteObject(imageRef)
      }

      // Delete post from the firestore
      const postDocRef = doc(firestore, "posts", post.id!)
      await deleteDoc(postDocRef)

      // update recoil state
      setPostStateValue((prev) => ({
        ...prev,
        posts: prev.posts.filter((item) => item.id !== post.id),
      }))
      return true
    } catch (error) {
      return false
    }
  }

  const getCommunityPostVotes = async (communityId: string) => {
    const postVotesQuery = query(
      collection(firestore, "users", `${user?.uid}/postVotes`),
      where("communityId", "==", communityId)
    )

    const postVoteDocs = await getDocs(postVotesQuery)
    const postVotes = postVoteDocs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    setPostStateValue((prev) => ({
      ...prev,
      postVotes: postVotes as PostVote[],
    }))
  }

  useEffect(() => {
    if (!user) {
      // Clear user post votes
      setPostStateValue((prev) => ({
        ...prev,
        postVotes: [],
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    if (!user || !currentCommunity?.id) return
    getCommunityPostVotes(currentCommunity?.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentCommunity])

  return {
    postStateValue,
    setPostStateValue,
    onVote,
    onSelectPost,
    onDeletePost,
  }
}
export default usePosts
