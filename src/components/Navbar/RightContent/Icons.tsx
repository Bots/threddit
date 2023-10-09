import { authModalState } from "@/src/atoms/authModalAtom"
import { auth } from "@/src/firebase/clientApp"
import useDirectory from "@/src/hooks/useDirectory"
import {
  Box,
  Flex,
  Icon,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Tooltip,
} from "@chakra-ui/react"
import { useRouter } from "next/router"
import React from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { BsArrowUpRightCircle, BsChatDots, BsShield } from "react-icons/bs"
import { GrAdd } from "react-icons/gr"
import { IoNotificationsOutline } from "react-icons/io5"
import { useSetRecoilState } from "recoil"

const Icons: React.FC = () => {
  const [user] = useAuthState(auth)
  const router = useRouter()
  const setAuthModalState = useSetRecoilState(authModalState)
  const { toggleMenuOpen } = useDirectory()

  const onClickCreatePostInNavbar = () => {
    const { communityId } = router.query

    if (communityId) {
      router.push(`/r/${communityId}/submit`)
      return
    }
    // Open directory menu if on home page
    toggleMenuOpen()
  }

  return (
    <Flex
      alignItems="center"
      flexGrow={1}
    >
      <Box
        display={{ base: "none", md: "flex" }}
        alignItems="center"
        borderRight="1px solid"
        borderColor="gray.200"
      >
        <Popover>
          <Tooltip label="Popular">
            <Box display="inline-block">
              <PopoverTrigger>
                <Flex
                  mr={1.5}
                  ml={1.5}
                  padding={1}
                  cursor="pointer"
                  borderRadius={4}
                  _hover={{ bg: "gray.200" }}
                >
                  <Icon
                    as={BsArrowUpRightCircle}
                    fontSize={20}
                  />
                </Flex>
              </PopoverTrigger>
            </Box>
          </Tooltip>
          <PopoverContent>
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverHeader>/r/Popular Coming Soon!</PopoverHeader>
            <PopoverBody>
              This will eventually take you to /r/popular. Are you popular?
            </PopoverBody>
          </PopoverContent>
        </Popover>

        <Popover>
          <Tooltip label="Moderation">
            <Box display="inline-block">
              <PopoverTrigger>
                <Flex
                  mr={1.5}
                  ml={1.5}
                  padding={1}
                  cursor="pointer"
                  borderRadius={4}
                  _hover={{ bg: "gray.200" }}
                >
                  <Icon
                    as={BsShield}
                    fontSize={18}
                  />
                </Flex>
              </PopoverTrigger>
            </Box>
          </Tooltip>
          <PopoverContent>
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverHeader>Moderation Settings Coming Soon!</PopoverHeader>
            <PopoverBody>
              This will eventually take you to your moderation settings. You mod
              bro?
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </Box>
      <>
        <Popover>
          <Tooltip label="Chat">
            <Box display="inline-block">
              <PopoverTrigger>
                <Flex
                  mr={1.5}
                  ml={1.5}
                  padding={1}
                  cursor="pointer"
                  borderRadius={4}
                  _hover={{ bg: "gray.200" }}
                >
                  <Icon
                    as={BsChatDots}
                    fontSize={20}
                  />
                </Flex>
              </PopoverTrigger>
            </Box>
          </Tooltip>
          <PopoverContent>
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverHeader>Threddit Chat Coming Soon!</PopoverHeader>
            <PopoverBody>
              This will eventually take you to Threddit chat. You do like
              talking, don&apos;t you?
            </PopoverBody>
          </PopoverContent>
        </Popover>

        <Popover>
          <Tooltip label="Notifications">
            <Box display="inline-block">
              <PopoverTrigger>
                <Flex
                  mr={1.5}
                  ml={1.5}
                  padding={1}
                  cursor="pointer"
                  borderRadius={4}
                  _hover={{ bg: "gray.200" }}
                >
                  <Icon
                    as={IoNotificationsOutline}
                    fontSize={20}
                  />
                </Flex>
              </PopoverTrigger>
            </Box>
          </Tooltip>
          <PopoverContent>
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverHeader>Threddit Notifications Coming Soon!</PopoverHeader>
            <PopoverBody>
              This will eventually take you to your notifications. That is, if
              anyone ever responds to your posts/comments.
            </PopoverBody>
          </PopoverContent>
        </Popover>

        <Tooltip label="Create Post">
          <Flex
            display={{ base: "none", md: "flex" }}
            mr={3}
            ml={1.5}
            padding={1}
            cursor="pointer"
            borderRadius={4}
            _hover={{ bg: "gray.200" }}
            onClick={() => onClickCreatePostInNavbar()}
          >
            <Icon
              as={GrAdd}
              fontSize={20}
            />
          </Flex>
        </Tooltip>
      </>
    </Flex>
  )
}
export default Icons
