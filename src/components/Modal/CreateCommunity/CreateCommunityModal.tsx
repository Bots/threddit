import { communityState } from "@/src/atoms/communitiesAtom"
import { auth, firestore } from "@/src/firebase/clientApp"
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
} from "@chakra-ui/react"
import { doc, runTransaction, serverTimestamp } from "firebase/firestore"
import router from "next/router"
import React, { useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { BsFillEyeFill, BsFillPersonFill } from "react-icons/bs"
import { HiLockClosed } from "react-icons/hi"
import { useSetRecoilState } from "recoil"

type CreateCommunityModalProps = {
  open: boolean
  handleClose: () => void
}

const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({
  open,
  handleClose,
}) => {
  const setSnippetState = useSetRecoilState(communityState)
  const [user] = useAuthState(auth)
  const [communityName, setCommunityName] = useState("")
  const [charsRemaining, setCharsRemaining] = useState(21)
  const [communityType, setCommunityType] = useState("public")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value.length > 21) return
    setCommunityName(event.target.value)
    setCharsRemaining(21 - event.target.value.length)
  }

  const onCommunityTypeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCommunityType(event.target.name)
  }

  const handleCreateCommunity = async () => {
    // Clear errors
    if (error) setError("")

    // Disallow special characters besides underscores and enforce char limits
    const format = /[ `!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?~]/

    if (format.test(communityName) || communityName.length < 3) {
      setError(
        "Community names must be between 3-21 characters, and can only contain letters, numbers, or underscores"
      )
      return
    }

    setLoading(true)

    try {
      const communityDocRef = doc(firestore, "communities", communityName)

      await runTransaction(firestore, async (transaction) => {
        // Check to see if community exists in db
        const communityDoc = await transaction.get(communityDocRef)

        if (communityDoc.exists()) {
          throw new Error(
            `Sorry ${communityName} is already taken. Try another.`
          )
        }

        // Create the community
        await transaction.set(communityDocRef, {
          creatorId: user?.uid,
          createdAt: serverTimestamp(),
          numberOfMembers: 1,
          privacyType: communityType,
        })

        // Create the communitySnippet on user
        transaction.set(
          doc(firestore, `users/${user?.uid}/communitySnippets`, communityName),
          {
            communityId: communityName,
            isModerator: true,
          }
        )
      })
    } catch (error: any) {
      console.log("handleCreateCommunity error: ", error)
      setError(error.message)
    }
    setSnippetState((prev) => ({
      ...prev,
      mySnippets: [],
    }))
    handleClose()
    router.push(`r/${communityName}`)
    setLoading(false)
  }

  return (
    <>
      <Modal
        isOpen={open}
        onClose={handleClose}
        size="lg"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            display="flex"
            flexDirection="column"
            fontSize={18}
            padding={3}
          >
            Create a community
          </ModalHeader>
          <Box
            pl={3}
            pr={3}
          >
            <ModalCloseButton />
            <ModalBody
              display="flex"
              flexDirection="column"
              padding="10px 0px"
            >
              <Text
                fontWeight={600}
                fontSize={15}
                pb={4}
              >
                Name
              </Text>
              <Text
                fontSize={11}
                color="gray.500"
              >
                Community names including capitalization cannot be changed
              </Text>
              <Text
                position="relative"
                top="28px"
                left="10px"
                width="20px"
                color="gray.400"
              >
                r/
              </Text>
              <Input
                position="relative"
                value={communityName}
                size="sm"
                pl="22px"
                onChange={handleChange}
              />
              <Text
                fontSize="9pt"
                color={charsRemaining === 0 ? "red" : "gray.500"}
              >
                {charsRemaining} characters remaining
              </Text>
              <Text
                fontSize="9pt"
                color="red"
                pt={3}
              >
                {error}
              </Text>
              <Box
                mt={4}
                mb={4}
              >
                <Text
                  fontWeight={600}
                  fontSize={15}
                  pb={4}
                >
                  Community Type
                </Text>
                <Stack spacing={2}>
                  <Checkbox
                    name="public"
                    isChecked={communityType === "public"}
                    onChange={onCommunityTypeChange}
                  >
                    <Flex align="center">
                      <Icon
                        as={BsFillPersonFill}
                        color="gray.500"
                        mr={2}
                      />
                      <Text
                        fontSize="10pt"
                        mr={1}
                      >
                        Public
                      </Text>
                      <Text
                        fontSize="8pt"
                        color="gray.500"
                        pt={1}
                      >
                        Anyone can view, post, and comment to this community
                      </Text>
                    </Flex>
                  </Checkbox>
                  <Checkbox
                    name="restricted"
                    isChecked={communityType === "restricted"}
                    onChange={onCommunityTypeChange}
                  >
                    <Flex align="center">
                      <Icon
                        as={BsFillEyeFill}
                        color="gray.500"
                        mr={2}
                      />
                      <Text
                        fontSize="10pt"
                        mr={1}
                      >
                        Restricted
                      </Text>
                      <Text
                        fontSize="8pt"
                        color="gray.500"
                        pt={1}
                      >
                        Anyone can view this community, but only approved users
                        can post
                      </Text>
                    </Flex>
                  </Checkbox>
                  <Checkbox
                    name="private"
                    isChecked={communityType === "private"}
                    onChange={onCommunityTypeChange}
                  >
                    <Flex align="center">
                      <Icon
                        as={HiLockClosed}
                        color="gray.500"
                        mr={2}
                      />
                      <Text
                        fontSize="10pt"
                        mr={1}
                      >
                        Private
                      </Text>
                      <Text
                        fontSize="8pt"
                        color="gray.500"
                        pt={1}
                      >
                        Only approved users can view and submit to this
                        commuinity
                      </Text>
                    </Flex>
                  </Checkbox>
                </Stack>
              </Box>
            </ModalBody>
          </Box>
          <ModalFooter
            bg="gray.100"
            borderRadius="0px 0px 10px 10px"
          >
            <Button
              variant="outline"
              height="30px"
              colorScheme="blue"
              mr={3}
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              height="30px"
              onClick={handleCreateCommunity}
              isLoading={loading}
            >
              Create Community
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
export default CreateCommunityModal
