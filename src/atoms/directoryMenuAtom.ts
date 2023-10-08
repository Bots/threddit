import { IconType } from "react-icons"
import { TiHome } from "react-icons/ti"
import { atom } from "recoil"

export type DirectoryMenuItem = {
  displayText: string
  link: string
  icon: IconType
  iconColor: string
  imageURL?: string
}

interface DirectoryMenuState {
  isOpen: boolean
  selectedMenuItem: any
}

export const defaultMenuItem: DirectoryMenuItem = {
  displayText: "Home",
  link: "/",
  icon: TiHome,
  iconColor: "black",
}

export const defaultMenuState: DirectoryMenuState = {
  isOpen: false,
  selectedMenuItem: defaultMenuItem,
}

export const DirectoryMenuState = atom<DirectoryMenuState>({
  key: "directoryMenuState",
  default: defaultMenuState,
})
