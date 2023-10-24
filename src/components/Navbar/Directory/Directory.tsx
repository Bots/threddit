import { ChevronDownIcon } from "@chakra-ui/icons"
import {
  Flex,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  Text,
  Image,
  useOutsideClick,
} from "@chakra-ui/react"
import React, { useRef } from "react"
import Communities from "./Communities"
import useDirectory from "@/src/hooks/useDirectory"

const UserMenu: React.FC = () => {
  const { directoryState, toggleMenuOpen } = useDirectory()

  const menuRef = useRef(null)

  useOutsideClick({
    ref: menuRef,
    handler: toggleMenuOpen,
  })

  return (
    <Menu
      isOpen={directoryState.isOpen}
      closeOnBlur
    >
      <MenuButton
        ref={menuRef}
        cursor="pointer"
        padding="0px 6px"
        borderRadius={4}
        mr={2}
        ml={{ base: 0, md: 2 }}
        _hover={{ outline: "1px solid", outlineColor: "gray.200" }}
        onClick={toggleMenuOpen}
      >
        <Flex
          align="center"
          justify="space-between"
          width={{ base: "auto", lg: "200px" }}
        >
          <Flex align="center">
            {directoryState.selectedMenuItem.imageURL ? (
              <Image
                src={directoryState.selectedMenuItem.imageURL}
                alt="Subreddit Image"
                borderRadius="full"
                boxSize="24px"
                mr={2}
              />
            ) : (
              <Icon
                fontSize={24}
                mr={{ base: 1, md: 2 }}
                as={directoryState.selectedMenuItem.icon}
                color={directoryState.selectedMenuItem.iconColor}
              />
            )}

            <Flex display={{ base: "none", lg: "flex" }}>
              <Text
                fontWeight={600}
                fontSize="10pt"
              >
                {directoryState.selectedMenuItem.displayText}
              </Text>
            </Flex>
          </Flex>
          <ChevronDownIcon />
        </Flex>
      </MenuButton>
      <MenuList>
        <Communities />
      </MenuList>
    </Menu>
  )
}
export default UserMenu
