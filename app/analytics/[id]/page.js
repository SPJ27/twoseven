import AnalyticsComponents from '@/components/analytics/main';
import React from 'react'

const page = async ({params}) => {
    const {id} = await params;
  return (
    <div>
        <AnalyticsComponents TRACKER_ID={id}/>
    </div>
  )
}

export default page