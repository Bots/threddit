import { Community } from "@/src/atoms/communitiesAtom"
import { Post } from "@/src/atoms/postAtom"
import { auth, firestore } from "@/src/firebase/clientApp"
import usePosts from "@/src/hooks/usePosts"
import { collection, getDocs, orderBy, query, where } from "firebase/firestore"
import React, { useEffect, useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import PostItem from "./PostItem"
import { Stack } from "@chakra-ui/react"
import PostLoader from "./PostLoader"

type PostsProps = {
  communityData: Community
}

const Posts: React.FC<PostsProps> = ({ communityData }) => {
  const [user] = useAuthState(auth)
  const [loading, setLoading] = useState(false)
  const {
    postStateValue,
    setPostStateValue,
    onVote,
    onDeletePost,
    onSelectPost,
  } = usePosts()

  const getPosts = async () => {
    try {
      setLoading(true)
      // Get posts for this community
      const postsQuery = query(
        collection(firestore, "posts"),
        where("communityId", "==", communityData.id),
        orderBy("createdAt", "desc")
      )
      const postDocs = await getDocs(postsQuery)
      const posts = postDocs.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

      setPostStateValue((prev: any) => ({
        ...prev,
        posts: posts as Post[],
      }))
    } catch (error: any) {
      console.log("getPosts error: ", error.message)
    }
    setLoading(false)
  }

  useEffect(() => {
    getPosts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {loading ? (
        <PostLoader />
      ) : (
        <Stack>
          {postStateValue.posts.map((item: Post, index: number) => {
            return (
              <PostItem
                key={index}
                post={item}
                userIsCreator={user?.uid === item.creatorId}
                userVoteValue={undefined}
                onVote={onVote}
                onSelectPost={onSelectPost}
                onDeletePost={onDeletePost}
              />
            )
          })}
        </Stack>
      )}
    </>
  )
}
export default Posts
