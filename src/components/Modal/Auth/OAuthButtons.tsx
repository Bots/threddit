import { Flex, Button, Image, Text } from "@chakra-ui/react"
import React from "react"
import {
  useSignInWithGoogle,
  useSignInWithTwitter,
} from "react-firebase-hooks/auth"
import { auth } from "@/src/firebase/clientApp"

const OAuthButtons: React.FC = () => {
  const [signInWithGoogle, googleUser, googleLoading, googleError] =
    useSignInWithGoogle(auth)
  const [signInWithTwitter, twitterUser, twitterLoading, twitterError] =
    useSignInWithTwitter(auth)
  return (
    <Flex
      direction="column"
      width="100%"
      mb={4}
    >
      <Button
        variant="oauth"
        mb={2}
        isLoading={googleLoading}
        onClick={() => signInWithGoogle()}
      >
        <Image
          src="/images/googlelogo.png"
          alt="Google logo"
          height="20px"
          mr={4}
        ></Image>
        Continue with Google
      </Button>
      <Button
        variant="oauth"
        mb={2}
        isLoading={twitterLoading}
        onClick={() => signInWithTwitter()}
      >
        <Image
          src="/images/xlogo.png"
          alt="X logo"
          height="20px"
          mr={4}
        ></Image>
        Continue with X
      </Button>
      {(googleError || twitterError) && (
        <Text>{googleError?.message || twitterError?.message}</Text>
      )}
    </Flex>
  )
}
export default OAuthButtons
