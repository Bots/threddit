import { Flex, Image } from "@chakra-ui/react"
import React from "react"
import SearchInput from "./SearchInput"

const Navbar: React.FC = () => {
  return (
    <Flex
      bg="white"
      height="44px"
      padding="6px 12px"
    >
      <Flex align="center">
        <Image
          src="/images/redditFace.svg"
          height="30px"
          alt="Reddit face logo"
        />
        <Image
          display={{ base: "none", md: "unset" }}
          src="/images/redditText.svg"
          height="46px"
          alt="Reddit text logo"
        />
      </Flex>
      <SearchInput />
      {/* <Directory />
      <RightContent /> */}
    </Flex>
  )
}
export default Navbar
