import { Post, postState } from "@/src/atoms/postAtom"
import { firestore, storage } from "@/src/firebase/clientApp"
import usePosts from "@/src/hooks/usePosts"
import useSelectFile from "@/src/hooks/useSelectFile"
import { Alert, AlertIcon, Flex, Icon, Text } from "@chakra-ui/react"
import { User } from "firebase/auth"
import {
  Timestamp,
  addDoc,
  collection,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore"
import { getDownloadURL, ref, uploadString } from "firebase/storage"
import { useRouter } from "next/router"
import React, { useState } from "react"
import { BiPoll } from "react-icons/bi"
import { BsLink45Deg, BsMic } from "react-icons/bs"
import { IoDocumentText, IoImageOutline } from "react-icons/io5"
import { useSetRecoilState } from "recoil"
import ImageUpload from "./PostForm/ImageUpload"
import TextInputs from "./PostForm/TextInputs"
import TabItem from "./TabItem"

type NewPostFormProps = {
  user: User
  communityImageURL?: string
}

const formTabs: TabItemType[] = [
  {
    title: "Post",
    icon: IoDocumentText,
  },
  {
    title: "Images & Video",
    icon: IoImageOutline,
  },
  {
    title: "Link",
    icon: BsLink45Deg,
  },
  {
    title: "Poll",
    icon: BiPoll,
  },
  {
    title: "Talk",
    icon: BsMic,
  },
]

export type TabItemType = {
  title: string
  icon: typeof Icon.arguments
}

const NewPostForm: React.FC<NewPostFormProps> = ({
  user,
  communityImageURL,
}) => {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState(formTabs[0].title)
  const [textInputs, setTextInputs] = useState({
    title: "",
    body: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const setPostItems = useSetRecoilState(postState)
  const { selectedFile, setSelectedFile, onSelectFile } = useSelectFile()
  const { onVote } = usePosts()

  const handleCreatePost = async (
    event: React.MouseEvent<SVGElement, MouseEvent>
  ): Promise<void> => {
    const { communityId } = router.query

    setLoading(true)
    try {
      // Store the post in the db
      const postDocRef = await addDoc(collection(firestore, "posts"), {
        communityId,
        communityImageURL: communityImageURL || "",
        creatorId: user.uid,
        creatorDisplayName: user.email
          ? user.email.split("@")[0]
          : user.displayName!,
        title: textInputs.title,
        body: textInputs.body,
        numberOfComments: 0,
        voteStatus: 0,
        createdAt: serverTimestamp() as Timestamp,
      })

      // Check for selected file
      if (selectedFile) {
        // Store in storage => getDownloadURL (return image url)
        const imageRef = ref(storage, `posts/${postDocRef.id}/image`)
        await uploadString(imageRef, selectedFile, "data_url")
        const downloadURL = await getDownloadURL(imageRef)

        // upadate post doc by adding image url
        await updateDoc(postDocRef, {
          imageURL: downloadURL,
        })
      }

      // redirect the user back to the communityPage using the router
      // Clear the cache to cause a refetch of the posts
      setPostItems((prev) => ({
        ...prev,
        postUpdateRequired: true,
      }))

      // Get the post and upvote it
      const postDoc = await getDoc(postDocRef)
      let post = postDoc.data()
      post = {
        ...post,
        id: postDocRef.id,
      }
      onVote(event, post as Post, 1, communityId as string)

      // Direct user back to community page
      router.back()
    } catch (error) {
      console.log("handleCreatePostError: ", error)
      setError(true)
    }
    setLoading(false)
  }

  const onTextChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const {
      target: { name, value },
    } = event
    setTextInputs((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <Flex
      direction="column"
      bg="white"
      borderRadius={4}
      mt={2}
    >
      <Flex width="100%">
        {formTabs.map((item, index) => (
          <TabItem
            key={index}
            item={item}
            selected={item.title === selectedTab}
            setSelectedTab={setSelectedTab}
          />
        ))}
      </Flex>
      <Flex p={4}>
        {selectedTab === "Post" && (
          <TextInputs
            textInputs={textInputs}
            handleCreatePost={(event) => handleCreatePost(event)}
            onChange={onTextChange}
            loading={loading}
          />
        )}
        {selectedTab === "Images & Video" && (
          <ImageUpload
            selectedFile={selectedFile}
            onSelectImage={onSelectFile}
            setSelectedTab={setSelectedTab}
            setSelectedFile={setSelectedFile}
          />
        )}
      </Flex>
      {error && (
        <Alert status="error">
          <AlertIcon />
          <Text mr={2}>Error creating post</Text>
        </Alert>
      )}
    </Flex>
  )
}
export default NewPostForm
