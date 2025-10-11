'use client'

import { ReviewModal } from '@/components/ReviewModal'
import { useRouter } from 'next/navigation'

interface ReviewModalWrapperProps {
  reviewedUserId: string
  reviewedUserName: string
  postId: string
}

export function ReviewModalWrapper({
  reviewedUserId,
  reviewedUserName,
  postId
}: ReviewModalWrapperProps) {
  const router = useRouter()

  const handleReviewSubmitted = () => {
    // Refresh the page to show updated rating
    router.refresh()
  }

  return (
    <ReviewModal
      reviewedUserId={reviewedUserId}
      reviewedUserName={reviewedUserName}
      postId={postId}
      onReviewSubmitted={handleReviewSubmitted}
    />
  )
}
