import { useRouter } from "next/router"
import { useEffect } from "react"
import { FaReddit } from "react-icons/fa"
import { useRecoilState, useRecoilValue } from "recoil"
import { communityState } from "../atoms/communitiesAtom"
import {
  DirectoryMenuItem,
  DirectoryMenuState,
  defaultMenuItem,
} from "../atoms/directoryMenuAtom"

const useDirectory = () => {
  const [directoryState, setDirectoryState] = useRecoilState(DirectoryMenuState)
  const router = useRouter()
  const communityStateValue = useRecoilValue(communityState)

  const onSelectMenuItem = (menuItem: DirectoryMenuItem) => {
    setDirectoryState((prev) => ({
      ...prev,
      selectedMenuItem: menuItem,
    }))

    router.push(menuItem.link)
    if (directoryState.isOpen) {
      toggleMenuOpen()
    }
  }

  const toggleMenuOpen = () => {
    setDirectoryState((prev) => ({
      ...prev,
      isOpen: !directoryState.isOpen,
    }))
  }

  const closeMenu = () => {
    setDirectoryState((prev) => ({
      ...prev,
      isOpen: false,
    }))
  }

  useEffect(() => {
    const { currentCommunity } = communityStateValue

    if (currentCommunity) {
      setDirectoryState((prev) => ({
        ...prev,
        selectedMenuItem: {
          displayText: `r/${currentCommunity.id}`,
          link: `/r/${currentCommunity.id}`,
          imageURL: currentCommunity.imageURL,
          icon: FaReddit,
          iconColor: "blue.500",
        },
      }))
      return
    }
    setDirectoryState((prev) => ({
      ...prev,
      selectedMenuItem: defaultMenuItem,
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityStateValue.currentCommunity])

  return { directoryState, toggleMenuOpen, onSelectMenuItem, closeMenu }
}
export default useDirectory
