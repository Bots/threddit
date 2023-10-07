import { Post, postState } from "@/src/atoms/postAtom"
import { firestore } from "@/src/firebase/clientApp"
import { Box, Flex, Stack } from "@chakra-ui/react"
import { User } from "firebase/auth"
import {
  Timestamp,
  collection,
  doc,
  increment,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore"
import React, { useEffect, useState } from "react"
import { useSetRecoilState } from "recoil"
import CommentInput from "./CommentInput"
import CommentItem, { Comment } from "./CommentItem"

type CommentsProps = {
  user: User
  selectedPost: Post | null
  communityId: string
}

const Comments: React.FC<CommentsProps> = ({
  user,
  selectedPost,
  communityId,
}) => {
  const [commentText, setCommentText] = useState("")
  const [comments, setComments] = useState<Comment[]>([])
  const [fetchLoading, setFetchLoading] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const setPostState = useSetRecoilState(postState)

  const onCreateComment = async () => {
    setCreateLoading(true)
    try {
      const batch = writeBatch(firestore)

      // Create a comment document
      const commentDocRef = doc(collection(firestore, "comments"))

      const newComment: Comment = {
        id: commentDocRef.id,
        creatorId: user.uid,
        creatorDisplayText: user.displayName || user.email?.split("@")[0],
        communityId,
        postId: selectedPost?.id!,
        postTitle: selectedPost?.title!,
        text: commentText,
        createdAt: serverTimestamp() as Timestamp,
      }

      batch.set(commentDocRef, newComment)

      // Update post number of comments
      const postDocRef = doc(firestore, "posts", selectedPost?.id!)
      batch.update(postDocRef, {
        numberOfComments: increment(1),
      })

      await batch.commit()

      // Update client recoil state
      setCommentText("")
      setComments((prev) => [newComment, ...prev])
      setPostState((prev: any) => ({
        ...prev,
        selectedPost: {
          ...prev.selectedPost,
          numberOfComments: prev.selectedPost?.numberOfComments! + 1,
        } as Post,
      }))
    } catch (error) {
      console.log("onCreateComment error: ", error)
    }
    setCreateLoading(false)
  }

  const onDeleteComment = async (comment: any) => {
    // Delete comment document
    // Update post numberOfComments
    // Update client recoil state
  }

  const getPostComments = async () => {}

  useEffect(() => {
    getPostComments()
  }, [])

  return (
    <Box
      bg="white"
      borderRadius="0px 0px 4px 4px"
      p={2}
    >
      <Flex
        direction="column"
        pl={10}
        pr={4}
        mb={6}
        fontSize="10pt"
        width="100%"
      >
        <CommentInput
          commentText={commentText}
          setCommentText={setCommentText}
          user={user}
          createLoading={createLoading}
          onCreateComment={onCreateComment}
        />
      </Flex>
      <Stack spacing={6}>
        {comments.map((comment, index) => (
          <CommentItem
            key={index}
            comment={comment}
            onDeleteComment={onDeleteComment}
            loadingDelete={false}
            userId={user.uid}
          />
        ))}
      </Stack>
    </Box>
  )
}
export default Comments
