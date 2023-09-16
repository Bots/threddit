import { Community } from "@/src/atoms/communitiesAtom"
import { firestore } from "@/src/firebase/clientApp"
import { doc, getDoc } from "firebase/firestore"
import { GetServerSidePropsContext } from "next"
import React from "react"
import safeJsonStringify from "safe-json-stringify"

type CommunityPageProps = {
  communityData: Community
}

const CommunityPage: React.FC<CommunityPageProps> = ({ communityData }) => {
  return <div>WELCOME TO {communityData.id}</div>
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
        communityData: JSON.parse(
          safeJsonStringify({ id: communityDoc.id, ...communityDoc.data() })
        ),
      },
    }
  } catch (error) {
    // Could add error page here
    console.log("getServerSideProps error: ", error)
    return { props: {} }
  }
}

export default CommunityPage
