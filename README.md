 # TwoSeven (The name is based on my birthdate)

Note: Some buttons are not functional such as "Pick a plan" as the website is free for now.

TwoSeven is an open-source analytics platform designed to help users understand and track their website performance with accuracy. The name is inspired by my birthdate.

The platform is currently free to use and aims to provide detailed, reliable insights without the complexity or cost associated with traditional analytics tools.

This platform provides similar (or even better) data as compared to Google Analytics, Microsoft Clarity, Plausible, Umami, Datafa.st, etc. but with better and prettier UI as they are a mess.

## How to integrate?

1. Click on the 'Add Website" button, and type in the domain that you want to track.
![Add domain](image.png)

2. Go to the project settings by clicking the icon beside your domain
![alt text](image-1.png)

3. Copy the tracking code (click on localhost if you want that too) and paste it into your <head> tag
![alt text](image-2.png)

If you are using Next.js, you should use the <Script/> tag instead of the standard tag.

## Why is it better than Google Analytics? 
 - Google Analytics UI is very messy and hard to comprehend, whereas TwoSeven has a organized and simpler UI.
 - GA provides information that is not much useful such as which button is clicked more, etc. whereas we provides information on what user actually wants.

## Current Features
 - Basic stats such as - visitors, unique visitors, sessions, bounce rates, avg. time spent by users, pages per visitors
 - Technical information - pages, referrers, browsers, OS, devices
 - Geological data -  country, city, IP
 - Admin management - People who can both view the analytics and modify the settings
 - Viewers - People who can view the analytics but not modify the settings
 - APIs - Website creators can setup API keys to fetch their website statistics
 - You can also enable/disable localhost debugging


## Difference between visitors and sessions
 - Visitors reset everytime someone visits a new page. For example, visiting /dashboard and /project can be counted as two visits.
 - An individual session lasts for about 30 minutes. For example, visitng /dashboard and /project is counted as 1 sessionif within 30 mins. 

## Technical Spefications
 - Next.js 
 - Supabase (auth + db)
 - OpenAnalytics Engine - Built by me (modified for improved and detailed statistics)
 - Geolocation API

## Future improvements
 - Quicker response time
 - Restrictive/Permisive access for admins.
 - Adding viewers that can only view the analytics but not modify the settings
