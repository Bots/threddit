import React from "react"
import { useRecoilState } from "recoil"
import {
  DirectoryMenuItem,
  DirectoryMenuState,
} from "../atoms/directoryMenuAtom"
import { useRouter } from "next/router"

const useDirectory = () => {
  const [directoryState, setDirectoryState] = useRecoilState(DirectoryMenuState)
  const router = useRouter()

  const onSelectMenuItem = (menuItem: DirectoryMenuItem) => {
    setDirectoryState((prev) => ({
      ...prev,
      selectedMenuItem: menuItem,
    }))

    router.push(menuItem.link)
  }

  const toggleMenuOpen = () => {
    setDirectoryState((prev) => ({
      ...prev,
      isOpen: !directoryState.isOpen,
    }))
  }

  return { directoryState, toggleMenuOpen, onSelectMenuItem }
}
export default useDirectory
