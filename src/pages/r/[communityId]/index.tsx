import { Community } from "@/src/atoms/communitiesAtom"
import CreatePostLink from "@/src/components/Community/CreatePostLink"
import Header from "@/src/components/Community/Header"
import NotFound from "@/src/components/Community/NotFound"
import PageContent from "@/src/components/Layout/PageContent"
import Posts from "@/src/components/Posts/Posts"
import { firestore } from "@/src/firebase/clientApp"
import { doc, getDoc } from "firebase/firestore"
import { GetServerSidePropsContext } from "next"
import React from "react"
import safeJsonStringify from "safe-json-stringify"

type CommunityPageProps = {
  communityData: Community
}

const CommunityPage: React.FC<CommunityPageProps> = ({ communityData }) => {
  // Check to see if community exists
  if (!communityData) {
    return <NotFound />
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
          <div>RHS</div>
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
              safeJsonStringify({ id: communityDoc.id, ...communityDoc.data() }) // needed for dates
            )
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
