import { Flex, Image } from "@chakra-ui/react"
import React from "react"
import SearchInput from "./SearchInput"
import RightContent from "./RightContent/RightContent"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/src/firebase/clientApp"
import Directory from "./Directory/Directory"

const Navbar: React.FC = () => {
  const [user, loading, error] = useAuthState(auth)

  return (
    <Flex
      bg="white"
      height="44px"
      padding="6px 12px"
      justify={{ md: "space-between" }}
    >
      <Flex
        align="center"
        width={{ base: "40px", md: "auto" }}
        mr={{ base: 0, md: 2 }}
      >
        <Image
          src="/images/redditFace.svg"
          height="30px"
          alt="Reddit face logo"
        />
        <Image
          display={{ base: "none", md: "unset" }}
          src="/images/threddittext.png"
          height="18px"
          ml="8px"
          alt="Reddit text logo"
        />
      </Flex>
      {user && <Directory />}
      <SearchInput user={user} />
      <RightContent user={user} />
    </Flex>
  )
}
export default Navbar
