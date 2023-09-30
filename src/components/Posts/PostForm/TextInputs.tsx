import { Button, Flex, Input, Stack, Textarea } from "@chakra-ui/react"
import React from "react"

type TextInputsProps = {}

const TextInputs: React.FC<TextInputsProps> = () => {
  return (
    <Stack
      spacing={3}
      width="100%"
    >
      <Input
        name="title"
        // value={}
        // onChange={}
        fontSize="10pt"
        borderRadius={4}
        placeholder="Title"
      />
      <Textarea />
      <Flex>
        <Button>Post</Button>
      </Flex>
    </Stack>
  )
}
export default TextInputs
