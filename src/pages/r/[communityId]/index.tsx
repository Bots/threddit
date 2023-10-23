import { Community, communityState } from "@/src/atoms/communitiesAtom"
import About from "@/src/components/Community/About"
import CreatePostLink from "@/src/components/Community/CreatePostLink"
import Header from "@/src/components/Community/Header"
import CommunityNotFound from "@/src/components/Community/NotFound"
import NotFound from "@/src/components/Community/NotFound"
import PageContent from "@/src/components/Layout/PageContent"
import Posts from "@/src/components/Posts/Posts"
import { firestore } from "@/src/firebase/clientApp"
import { doc, getDoc } from "firebase/firestore"
import { GetServerSidePropsContext } from "next"
import React, { useEffect } from "react"
import { useSetRecoilState } from "recoil"

type CommunityPageProps = {
  communityData: Community
}

const CommunityPage: React.FC<CommunityPageProps> = ({ communityData }) => {
  const setCommunityStateValue = useSetRecoilState(communityState)

  // Check to see if community exists
  if (!communityData) {
    return <NotFound />
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    setCommunityStateValue((prev) => ({
      ...prev,
      currentCommunity: communityData,
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityData])

  if (!communityData) {
    return <CommunityNotFound />
  }

  return (
    <>
      <Header communityData={communityData} />
      <PageContent>
        <>
          <CreatePostLink />
          <Posts communityData={communityData} />
        </>
        <>
          <About communityData={communityData} />
        </>
      </PageContent>
    </>
  )
}

// Server side rendering
export async function getServerSideProps(context: GetServerSidePropsContext) {
  // Get community data and pass it to our client
  try {
    const communityDocRef = doc(
      firestore,
      "communities",
      context.query.communityId as string
    )
    const communityDoc = await getDoc(communityDocRef)
    return {
      props: {
        communityData: communityDoc.exists()
          ? JSON.parse(
              JSON.stringify({ id: communityDoc.id, ...communityDoc.data() })) // needed for dates
          : "",
      },
    }
  } catch (error) {
    // Could create error page here
    console.log("getServerSideProps error - [community]", error)
    return { props: {} }
  }
}

export default CommunityPage
