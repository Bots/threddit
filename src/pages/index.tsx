import { Flex, Stack, chakra } from "@chakra-ui/react"
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore"
import { Inter } from "next/font/google"
import { useEffect, useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { Post, PostVote } from "../atoms/postAtom"
import CreatePostLink from "../components/Community/CreatePostLink"
import PersonalHome from "../components/Community/PersonalHome"
import Premium from "../components/Community/Premium"
import Recommendations from "../components/Community/Recommendations"
import PageContent from "../components/Layout/PageContent"
import PostItem from "../components/Posts/PostItem"
import PostLoader from "../components/Posts/PostLoader"
import { auth, firestore } from "../firebase/clientApp"
import useCommunityData from "../hooks/useCommunityData"
import usePosts from "../hooks/usePosts"
import InfiniteScroll from "react-infinite-scroll-component"

const inter = Inter({ subsets: ["latin"] })

export default function Home() {
  const [user, loadingUser] = useAuthState(auth)
  const [loading, setLoading] = useState<boolean>(false)
  const [lastVisibleItem, setLastVisibleItem] = useState({})
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [mounted, setMounted] = useState<boolean>(false)
  const {
    postStateValue,
    setPostStateValue,
    onSelectPost,
    onDeletePost,
    onVote,
  } = usePosts()
  const { communityStateValue } = useCommunityData()

  const userFetchFirst = async () => {
    if (communityStateValue.mySnippets.length) {
      // Get posts from users communities
      setLoading(true)
      try {
        const myCommunityIds = communityStateValue.mySnippets.map(
          (snippet) => snippet.communityId
        )
        const postQuery = query(
          collection(firestore, "posts"),
          where("communityId", "in", myCommunityIds),
          orderBy("voteStatus", "desc"),
          limit(5)
        )

        const postDocs = await getDocs(postQuery)

        setLastVisibleItem(postDocs.docs[postDocs.docs.length - 1])

        const posts = postDocs.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        posts.length < 5 && setHasMore(false)

        setPostStateValue((prev) => ({
          ...prev,
          posts: posts as Post[],
        }))
        setLoading(false)
        return posts
      } catch (error) {
        console.log("userFetchFirst error: ", error)
      }
      setLoading(false)
    } else {
      noUserFetchFirst()
    }
  }

  const noUserFetchFirst = async () => {
    setLoading(true)
    try {
      const postQuery = query(
        collection(firestore, "posts"),
        orderBy("voteStatus", "desc"),
        limit(5)
      )

      const postDocs = await getDocs(postQuery)

      setLastVisibleItem(postDocs.docs[postDocs.docs.length - 1])

      const posts = postDocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      posts.length < 5 && setHasMore(false)

      setPostStateValue((prev) => ({
        ...prev,
        posts: posts as Post[],
      }))
      setLoading(false)
      return posts
    } catch (error) {
      console.log("noUserFetchFirst error: ", error)
    }
    setLoading(false)
  }

  const userFetchNext = async () => {
    try {
      const myCommunityIds = communityStateValue.mySnippets.map(
        (snippet) => snippet.communityId
      )

      const postQuery = query(
        collection(firestore, "posts"),
        where("communityId", "in", myCommunityIds),
        orderBy("voteStatus", "desc"),
        startAfter(lastVisibleItem),
        limit(5)
      )

      const postDocs = await getDocs(postQuery)

      setLastVisibleItem(postDocs.docs[postDocs.docs.length - 1])

      const posts = postDocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      console.log("posts.length: ", posts.length)
      posts.length < 5 && setHasMore(false)

      setPostStateValue((prev) => ({
        ...prev,
        posts: [...prev.posts, ...posts] as Post[],
      }))

      return posts
    } catch (error) {
      console.log("userFetchNext error: ", error)
    }
  }

  const noUserFetchNext = async () => {
    try {
      const postQuery = query(
        collection(firestore, "posts"),
        orderBy("voteStatus", "desc"),
        startAfter(lastVisibleItem),
        limit(5)
      )

      const postDocs = await getDocs(postQuery)

      setLastVisibleItem(postDocs.docs[postDocs.docs.length - 1])

      const posts = postDocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      console.log("posts.length: ", posts.length)
      posts.length < 5 && setHasMore(false)

      setPostStateValue((prev) => ({
        ...prev,
        posts: [...prev.posts, ...posts] as Post[],
      }))

      return posts
    } catch (error) {
      console.log("userFetchNext error: ", error)
    }
  }

  const getUserPostVotes = async () => {
    try {
      const postIds = postStateValue.posts.map((post) => post.id)
      const postVotesQuery = query(
        collection(firestore, `users/${user?.uid}/postVotes`),
        where("postId", "in", postIds)
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
    } catch (error) {
      console.log("getUserPostVotes error: ", error)
    }
  }

  useEffect(() => {
    if (communityStateValue.snippetsFetched) userFetchFirst()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityStateValue.snippetsFetched])

  useEffect(() => {
    if (!user && !loadingUser) noUserFetchFirst()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loadingUser])

  useEffect(() => {
    if (user && postStateValue.posts.length) getUserPostVotes()

    return () => {
      setPostStateValue((prev) => ({
        ...prev,
        postVotes: [],
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, postStateValue.posts])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (mounted) {
    return (
      <PageContent>
        <>
          <CreatePostLink />
          {loading ? (
            <PostLoader />
          ) : (
            <>
              <InfiniteScroll
                dataLength={postStateValue.posts.length} //This is important field to render the next data
                next={user ? userFetchNext : noUserFetchNext}
                hasMore={hasMore}
                loader={<h4>Loading...</h4>}
                endMessage={
                  <p style={{ textAlign: "center" }}>
                    <b>You&apos;ve reached the end of the interwebs.</b>
                  </p>
                }
              >
                {postStateValue.posts.map((post, index) => (
                  <div key={index} style={{ marginBottom: "20px" }}>
                    <PostItem
                      post={post}
                      onSelectPost={onSelectPost}
                      onDeletePost={onDeletePost}
                      onVote={onVote}
                      userVoteValue={
                        postStateValue.postVotes.find(
                          (item) => item.postId === post.id
                        )?.voteValue
                      }
                      userIsCreator={user?.uid === post.creatorId}
                      homePage
                    />
                  </div>
                ))}
              </InfiniteScroll>
            </>
          )}
        </>
        <Stack spacing={5}>
          <Recommendations />
          <Premium />
          <PersonalHome />
        </Stack>
      </PageContent>
    )
  }
}
