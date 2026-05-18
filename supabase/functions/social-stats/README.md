Social stats function setup:

Required Supabase Edge Function secrets:
- `YOUTUBE_API_KEY`
- `YOUTUBE_CHANNEL_ID` or `YOUTUBE_CHANNEL_HANDLE`
- `META_ACCESS_TOKEN`
- `FACEBOOK_PAGE_ID`

Optional:
- `INSTAGRAM_USER_ID`
- `INSTAGRAM_USERNAME`
- `INSTAGRAM_PUBLIC_APP_ID`

What it does:
- reads live YouTube subscriber, view, and video counts
- reads the latest YouTube uploads automatically
- reads live Facebook page follower and like counts
- reads live Instagram follower and media counts
- attempts to read public Instagram profile data as a fallback
- can return recent Instagram video media when the official Meta token is connected
- returns partial results if one platform is not configured yet
- uses a 2-hour shared cache window for social refreshes

Deploy flow:
1. Create the secrets in Supabase for this project.
2. Deploy the function as `social-stats`.
3. Keep `VITE_SOCIAL_STATS_FUNCTION_NAME=social-stats` in the frontend if you want the default name.
