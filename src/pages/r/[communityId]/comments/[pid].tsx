import { Post } from "@/src/atoms/postAtom"
import About from "@/src/components/Community/About"
import PageContent from "@/src/components/Layout/PageContent"
import PostItem from "@/src/components/Posts/PostItem"
import { auth, firestore } from "@/src/firebase/clientApp"
import useCommunityData from "@/src/hooks/useCommunityData"
import usePosts from "@/src/hooks/usePosts"
import { doc, getDoc } from "firebase/firestore"
import { useRouter } from "next/router"
import React, { useEffect } from "react"
import { useAuthState } from "react-firebase-hooks/auth"

const PostPage: React.FC = () => {
  const { postStateValue, setPostStateValue, onDeletePost, onVote } = usePosts()
  const [user] = useAuthState(auth)
  const router = useRouter()
  const { communityStateValue } = useCommunityData()

  const fetchPost = async (postId: string) => {
    try {
      const postDocRef = doc(firestore, "posts", postId)
      const postDoc = await getDoc(postDocRef)
      setPostStateValue((prev) => ({
        ...prev,
        selectedPost: { id: postDoc.id, ...postDoc.data() } as Post,
      }))
    } catch (error) {
      console.log("fetchPost error: ", error)
    }
  }

  useEffect(() => {
    const { pid } = router.query

    if (pid && !postStateValue.selectedPost) {
      fetchPost(pid as string)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query, postStateValue.selectedPost])

  return (
    <PageContent>
      <>
        {postStateValue.selectedPost && (
          <PostItem
            post={postStateValue.selectedPost}
            onVote={onVote}
            onDeletePost={onDeletePost}
            userVoteValue={
              postStateValue.postVotes.find(
                (item) => item.postId === postStateValue.selectedPost?.id
              )?.voteValue
            }
            userIsCreator={user?.uid === postStateValue.selectedPost?.creatorId}
          />
        )}
        {/* Comments */}
      </>
      <>
        {communityStateValue.currentCommunity && (
          <About communityData={communityStateValue.currentCommunity} />
        )}
      </>
    </PageContent>
  )
}
export default PostPage
