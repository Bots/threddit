import { Flex, Icon, Image, MenuItem } from "@chakra-ui/react"
import React from "react"
import { IconType } from "react-icons"

type MenuListItemProps = {
  displayText: string
  link: string
  icon: IconType
  iconColor: string
  imageUrl?: string
}

const MenuListItem: React.FC<MenuListItemProps> = ({
  displayText,
  link,
  icon,
  iconColor,
  imageUrl,
}) => {
  return (
    <MenuItem
      width="100%"
      fontSize="10pt"
      _hover={{ bg: "gray.100" }}
      onClick={() => {}}
    >
      <Flex align="center">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="Community Image"
            borderRadius="full"
            boxSize="18px"
            mr={2}
          />
        ) : (
          <Icon
            as={icon}
            fontSize={20}
            mr={2}
            color={iconColor}
          />
        )}
        {displayText}
      </Flex>
    </MenuItem>
  )
}
export default MenuListItem
