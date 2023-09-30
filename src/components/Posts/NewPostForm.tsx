import { Flex, Icon } from "@chakra-ui/react"
import React, { useState } from "react"
import { BiPoll } from "react-icons/bi"
import { BsLink45Deg, BsMic } from "react-icons/bs"
import { IoDocumentText, IoImageOutline } from "react-icons/io5"
import TabItem from "./TabItem"
import TextInputs from "./PostForm/TextInputs"

type NewPostFormProps = {}

const formTabs: TabItem[] = [
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

export type TabItem = {
  title: string
  icon: typeof Icon.arguments
}

const NewPostForm: React.FC<NewPostFormProps> = () => {
  const [selectedTab, setSelectedTab] = useState(formTabs[0].title)
  const [textInputs, setTextInputs] = useState({
    title: "",
    body: "",
  })
  const [selectedFile, setSelectedFile] = useState<string>()

  const handleCreatePost = async () => {}

  const onSelectImage = () => {}

  const onTextChange = () => {}

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
        <TextInputs />
      </Flex>
    </Flex>
  )
}
export default NewPostForm
